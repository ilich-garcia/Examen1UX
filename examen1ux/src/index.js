import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import './index.css';
import App from './App';

firebase.initializeApp({
    apiKey: "AIzaSyATGAZA0IC_FgofrNIEupzVZQ88UeXqquY",
    authDomain: "firstuxexam.firebaseapp.com",
    databaseURL: "https://firstuxexam.firebaseio.com",
    projectId: "firstuxexam",
    storageBucket: "firstuxexam.appspot.com",
    messagingSenderId: "608881711863"
});

ReactDOM.render(<App />, document.getElementById('root'));