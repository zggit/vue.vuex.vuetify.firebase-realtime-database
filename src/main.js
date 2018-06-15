// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import firebase from 'firebase';
import 'vuetify/dist/vuetify.min.css';
import App from './App';
import router from './router';


// Initialize Firebase
const config = {
  apiKey: 'AIzaSyA1R6cmxfmdoXsIKRFzy8TKrpdt3F9_zCg',
  authDomain: 'foster-kinship-clients.firebaseapp.com',
  databaseURL: 'https://foster-kinship-clients.firebaseio.com',
  projectId: 'foster-kinship-clients',
  storageBucket: 'foster-kinship-clients.appspot.com',
  messagingSenderId: '186407844577',
};

firebase.initializeApp(config);

Vue.use(Vuetify, { theme: {
  primary: '#ee44aa',
  secondary: '#424242',
  accent: '#82B1FF',
  error: '#FF5252',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FFC107',
} });

Vue.config.productionTip = false;

let app;

firebase.auth().onAuthStateChanged(function(user) {
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>',
    });
  }
});
