<template>
<main id="app" class="limit">
    <header>
        <h1 :class="{'loading': loading}">arbitrium</h1>
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

    <div class="legend" v-show="!errorsPresent && someStatLoaded">
        <span class="legend-line">{{ repos[0].name }}</span>
        <span class="legend-line">{{ repos[1].name }}</span>
    </div>

    <section class="stats" v-show="!errorsPresent && someStatLoaded">
        <div class="stat">
            <h2>General numbers</h2>
            <div id="info" class="ct-minor-seventh"></div>
        </div>

        <div class="stat">
            <h2>Number of commits during last year (52 weeks)</h2>
            <div id="activity" class="ct-minor-seventh"></div>
        </div>
    </section>
</main>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';


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
            if (this.activities.every(x => x)) {
                const data = {
                    series: this.activities,
                };
                this.activityChart.update(data);
            }
        },
        info() {
            if (this.info.every(x => x)) {
                const data = {
                    labels: this.infoChart.data.labels,
                    series: this.info,
                };
                this.infoChart.update(data);
            }
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
        const createCharts = async () => {
            const ChartLibrary = await import('chartist');
            await import('chartist/dist/chartist.min.css');
            return [
                ChartLibrary.default.Line('#activity',
                {
                    labels: [...Array.from(Array(53).keys()).filter(x => x > 0)],
                }),
                ChartLibrary.default.Bar('#info',
                {
                    labels: ['forks', 'open issues', 'stars', 'subscribers'],
                }),
            ];
        };

        createCharts().then(charts => [this.activityChart, this.infoChart] = charts);
    },
};
</script>
