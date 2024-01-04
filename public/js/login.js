/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  // console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logOut',
    });

    //reload browser
    if ((res.data.status = 'success')) location.assign('/');
  } catch (error) {
    showAlert('error', 'Error logging out! Try again');
  }
};
