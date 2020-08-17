import Vue from 'vue'
import VueRouter from 'vue-router'
import VueClipboards from 'vue-clipboards';
import VModal from 'vue-js-modal';
import BootstrapVue from 'bootstrap-vue'
import App from './App.vue'

import moment from 'moment'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'font-awesome/css/font-awesome.css'


Vue.use(VueRouter);
Vue.use(VueClipboards);
Vue.use(VModal)
Vue.use(BootstrapVue);

import IndexView from './views/IndexView.vue'
import BoxView  from './views/BoxView.vue'
import Error404  from './views/404View.vue'

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: IndexView },
    { name: 'box', path: '/box/:id', component: BoxView },
    { path: "*", component: Error404 }
  ]
});

new Vue({
  el: '#app',
  template: '<App/>',
  render: h => h(App),
  router: router
});


Vue.filter('prettyBytes', function (num) {
  // jacked from: https://github.com/sindresorhus/pretty-bytes
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number');
  }

  let exponent;
  let unit;
  let neg = num < 0;
  let units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
  unit = units[exponent];

  return (neg ? '-' : '') + num + ' ' + unit;
});

Vue.filter('moment', function(date){
  return moment(date).format('MMMM Do YYYY, h:mm:ss a');
});
