import Vue from 'vue';
import Vuex from 'vuex';
import { defaultRepos } from './model';

Vue.use(Vuex);


export default new Vuex.Store({
    state: {
        ...defaultRepos,
        loading: false,
        count: 0,
    },
    getters: {
        errors(state) {
            let errors = [];
            for (let repo of state.repos)
                for (let stat of repo.stats)
                    errors.push(stat.error);
            return errors;
        },
        errorsPresent(state) {
            let errors = [];
            for (let repo of state.repos)
                for (let stat of repo.stats)
                    errors.push(stat.error);
            let someError = errors.some(x => x !== null);
            state.loading = someError ? false : state.loading;
            return someError;
        },
        someStatLoaded(state) {
            for (let repo of state.repos)
                for (let stat of repo.stats)
                    if (stat.value !== null)
                        return true;
            return false;
        },
        info(state) {
            return state.repos.map(x => x.getStatByName('info').value);
        },
        activities(state) {
            return state.repos.map(x => x.getStatByName('activity').value);
        },
    },
    mutations: {
        INCREMENT_COUNT(state) {
            state.count = state.count === state.repos.length ? 1 : state.count + 1;
        },
        SET_LOADING(state, value) {
            state.loading = value;
        },
        SET_STAT_VALUE(state, payload) {
            let s = payload.repo.getStatByName(payload.statName);
            s.value = s.parseValue(payload.statValue);
            s.error = null;
        },
        SET_STAT_ERROR(state, payload) {
            let s = payload.repo.getStatByName(payload.statName);
            s.error = payload.err;
            s.value = null;
        },
    },
    actions: {
        compare: (context) => {
            context.commit('SET_LOADING', true);
            for (let repo of context.state.repos)
                for (let stat of repo.stats)
                    repo.fetchStat(stat.name)
                        .then(res => {
                            context.commit('SET_STAT_VALUE', {
                                repo,
                                statName: stat.name,
                                statValue: res.data,
                            });
                            context.commit('INCREMENT_COUNT');
                            if (context.state.count === context.state.repos.length)
                                context.commit('SET_LOADING', false);
                        }).catch(err => {
                            context.commit('SET_STAT_ERROR', {
                                repo,
                                statName: stat.name,
                                err,
                            });
                        }).then(() => {});
        },
    }
});

