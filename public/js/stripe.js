/* eslint-disable */
import axios from 'axios';

export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //await stripe.redirectToCheckout({
    //  sessionId: session.data.session.id,
    //});

    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
