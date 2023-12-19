//** THIS IS PRETTY COOL!
/**In order to get rid of our try/catch blocks we simply wrapped our asynchronous func
 * inside of the catchAsync function that we just created, this function will then return
 * a new anonymous func, which will then be assigned to our async functions. That async function
 * will then return a promise and therefore in case there is an error in this promise,
 * in other words in case it gets rejected, we can then catch the error using the catch method
 * that is available on all promises. In the end it is this catch method that will pass
 * the error into the next function which will then make it so that our error ends up in our
 * global error handling middleware.
 */
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
