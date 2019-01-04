import axios from 'axios';

class GHClient {
    constructor() {
        this.HTTP = axios.create({
            baseURL: 'https://api.github.com',
        });
    }

    getActivity(name) {
        return this.HTTP.get(`/repos/${name}/stats/commit_activity`);
    }

    getInfo(name) {
        return this.HTTP.get(`/repos/${name}`);
    }
}

function statFactory(statName, parseValue) {
    return {
        name: statName,
        value: null,
        error: null,
        parseValue,
    };
}

function repositoryFactory(path, color) {
    return {
        name: path,
        color: color,
        http: new GHClient(),
        stats: [
            statFactory('activity', payload => {
                return payload.map(x => x.total);
            }),
            statFactory('info', payload => {
                return [
                    payload.forks_count,
                    payload.open_issues_count,
                    payload.stargazers_count,
                    payload.subscribers_count,
                ];
            }),
        ],

        fetchStat(name) {
            switch (name) {
                case 'activity':
                    return this.http.getActivity(this.name);
                case 'info':
                    return this.http.getInfo(this.name);
                default:
                    break;
            }
        },

        getStatByName(statName) {
            return this.stats.find(x => x.name === statName);
        },

        get errors() {
            return this.stats.filter(s => s.error !== null);
        },
    };
}

export const defaultRepos = {
    repos: [
        repositoryFactory('vuejs/vue', '#3FB984'),
        repositoryFactory('facebook/react', '#4C6290'),
    ],
};
