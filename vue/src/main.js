import Vue from 'vue';
import VueSentry from 'vue2-sentry';

import App from './App.vue';

if (process.env.NODE_ENV === 'production') {
  Vue.use(VueSentry, {
    key: process.env.VUE_APP_SENTRY_PUBLIC_KEY,
    project: process.env.VUE_APP_SENTRY_PROJECT_ID,
  });
}

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
