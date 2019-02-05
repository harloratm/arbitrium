<template>
<main id="app" class="limit">
    <header>
        <h1 :class="{'loading': loading}">consilium</h1>
        <p>
            Quickly compare 2 open source projects.
        </p>
        <p>
            Use the relative url, omitting `https://github.com/`...
        </p>
        <a v-bind:href="shareLink"
            class="share-link"
            target="_blank">
            Share this comparison!
        </a>
    </header>

    <form @submit.prevent="compare">
        <input type="text"
            v-for="(repo, index) in repos"
            v-bind:key="index"
            v-model="repo.name"
        />
        <input type="submit" v-model="ctaLabel" />
    </form>

    <div class="errors" v-if="errorsPresent">
        :( I have got some errors when trying to compare
        the two repositories.
        <ul>
            <li v-for="(error, i) in errors"
                v-bind:key="i"
                v-html="formatError(error)">
            </li>
        </ul>
        It may be a mispelled repository, or some network error.
        Please, try again!
    </div>

    <section class="stats" v-show="!errorsPresent && someStatLoaded">
        <div class="stat">
            <h2>General numbers</h2>
            <canvas id="info" width="400" height="200"></canvas>
        </div>

        <div class="stat">
            <h2>Number of commits during last year (52 weeks)</h2>
            <canvas id="activity" width="400" height="200"></canvas>
        </div>
    </section>
</main>
</template>

<script>
import Chart from 'chart.js';

import { mapState, mapActions, mapGetters } from 'vuex';
import common from './app.scss'; // eslint-disable-line no-unused-vars


function getQueryStringParams(queryString) {
    let params = {}, queries, temp, i, l;
    queries = queryString.split('&');
    for (i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
}

function getReposFromQueryString() {
    const qs = getQueryStringParams(window.location.search.substring(1));
    if (qs.hasOwnProperty('r')) {
        let repoNames = qs.r.split('+');
        if (repoNames.length === 2)
            return repoNames.map(x => x.replace('|', '/'));
    }
    return null;
}

function chartFactory(
    id,
    chartType,
    labels,
) {
    return new Chart(
        document.getElementById(id).getContext('2d'),
        {
           type: chartType,
            data: {
                labels,
                datasets: [{data: [],}, {data: [],},],
            },
        }, {
            responsive: false,
            maintainAspectRatio: false,
        }
    );
}

export default {
    name: 'app',
    computed: {
        ...mapState([
            'repos',
            'loading',
            'count',
        ]),
        ...mapGetters([
            'activities',
            'info',
            'errors',
            'errorsPresent',
            'someStatLoaded',
            'shareLink',
        ]),
        ctaLabel() {
            return this.loading ? '...' : 'compare';
        },
    },
    watch: {
        activities() {
            for (let i = 0; i < this.repos.length; i++) {
                let ds = this.activityChart.data.datasets[i];
                let repo = this.repos[i];
                ds.label = repo.name;
                ds.borderColor = repo.color;
                ds.backgroundColor = 'transparent';
                ds.tension = 0;
                ds.data = this.activities[i];
            }
            this.activityChart.update();
        },
        info() {
            for (let i = 0; i < this.repos.length; i++) {
                let ds = this.infoChart.data.datasets[i];
                let repo = this.repos[i];
                ds.label = repo.name;
                ds.borderColor = repo.color;
                ds.backgroundColor = repo.color;
                ds.tension = 0;
                ds.data = this.info[i];
            }
            this.infoChart.update();
        },
    },
    methods: {
        ...mapActions([
            'compare',
        ]),
        formatError(err) {
            if (err === null)
                return;
            return `Got a ${err.response.status} ${err.response.statusText}
                trying to ${err.config.method} ${err.config.url}`;
        },
    },
    mounted() {
        const qsRepos = getReposFromQueryString();
        if (qsRepos !== null) {
            this.repos[0].name = qsRepos[0];
            this.repos[1].name = qsRepos[1];
            this.compare();
        }
        this.activityChart = chartFactory(
            'activity',
            'line',
            [...Array.from(Array(53).keys()).filter(x => x > 0)],
        );
        this.infoChart = chartFactory(
            'info',
            'bar',
            ['forks', 'open issues', 'stars', 'subscribers'],
        );
    },
};
</script>
