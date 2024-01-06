/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

//type is either password or data
export const updateSettings = async (type, data) => {
  try {
    const url =
      type === 'data'
        ? '/api/v1/users/updateMe'
        : '/api/v1/users/updatePassword';
    console.log(data);
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
