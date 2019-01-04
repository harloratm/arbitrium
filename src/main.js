import Vue from 'vue';
import App from './App.vue';
import store from './store';
import Chart from 'chart.js';

Vue.config.productionTip = false;
Chart.defaults.global.defaultFontFamily = 'Source Code Pro';
Chart.defaults.global.defaultFontSize = 12;

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
