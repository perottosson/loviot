import Vue from 'vue'
import App from './App.vue'
import 'leaflet/dist/leaflet.css';
import VueSocketIO from 'vue-socket.io'

Vue.config.productionTip = false

// Now setup our socket and vuex configuration
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000',

  options: {} //Optional options
}))

// import ApiTest from './components/ApiTest.vue'

Vue.config.productionTip = false

export const eventBus = new Vue();

new Vue({
  // render: h => h(ApiTest),
  render: h => h(App),
}).$mount('#app')
