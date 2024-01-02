/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './leaflet';

//DOM ELEMENTS
const map = document.getElementById('map');
const loginForm = document.querySelector('.form');

//DELEGATION
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
