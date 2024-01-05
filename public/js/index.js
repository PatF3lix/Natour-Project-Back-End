/* eslint-disable */
import '@babel/polyfill';
import { login, logOut } from './login';
import { updateSettings } from './updateSettings';
import { displayMap } from './leaflet';
import { bookTour } from './stripe';

//DOM ELEMENTS
const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userform = document.querySelector('.form-user-data');
const passwForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

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

if (logOutBtn) {
  logOutBtn.addEventListener('click', logOut);
}

if (userform) {
  userform.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-settings').textContent = 'Updating..';
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    await updateSettings('data', form);

    window.setTimeout(() => {
      location.reload();
      document.querySelector('.btn--save-settings').textContent =
        'Save Settings';
    }, 1500);
  });
}

if (passwForm) {
  passwForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating..';
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;
    await updateSettings('password', {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });
  });

  document.querySelector('.btn--save-password').textContent = 'Save Password';
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
