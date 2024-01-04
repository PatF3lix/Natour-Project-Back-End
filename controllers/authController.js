// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/*a cookie is just a small piece of text that a server can send to clients.
then when a client receives a cookie, it will automatically store it
and then automatically send it back along with all future requests to the same server.*/
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  //sending cookie
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  //remove password from output
  user.passwrod = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**how to log out the user's and keeping the jwt token ?
 * because usually with jwt authentication we just delete the cookie or the token from local storage
 * but not possible when using it as we are currently.
 * what we will do instead is create a very simple log out route that will simply
 * send back a new cookie with the exact same name but without the token
 * That will then override the current cookie that we have in the browser with one that has the same name.
 * but no token, and so when that cookie is then sent along with the next request, then we will not be able to identify
 * the user as being logged in. This will affectively then log out the user.
 * clever work around to solve the problem that we cannot manipulate the cookie in the browser and delete it.
 *
 */

exports.logOut = (req, res) => {
  res.cookie('jwt', 'logged_out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

//post request
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

//post request
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2) check if user exists && password is correct
  //.select('+password'), is put there in order to output the password that was hidden in the model
  const user = await User.findOne({ email }).select('+password');

  //this way if the user does not exist, return true on !user,
  //it will not run the following code, and try o access a variable that may not exist like 'user.password'
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) if everything ok, send token to client
  createSendToken(user, 200, res);
});

//protect route from being exploited before user is logged in
exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) {
    // console.log(token);
    return next(
      new AppError('You are not logged in ! Please log in to get access.', 401),
    );
  }
  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user still exists
  /** We do this so that we can be 100% sure that the iD is actually correct,
   * because if we made it until this point of the code here then it means that the verification
   * process, that we had previously, was successfull, Otherwise the following line of code
   * would of caused an error which would then of provented the function from continuing.
   */
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token, no longer exists', 401),
    );

  //4) check if user changed password after the token was issued
  //iat is the jwt timestamp
  if (await freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.!',
        401,
      ),
    );
  }
  //5) Grant access to protected route
  req.user = freshUser; //maybe usefull at some point in future
  res.locals.user = freshUser;
  next();
});

//only for rendered pages no erros!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt === 'logged_out') return next();

  if (req.cookies.jwt) {
    //1) verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );

    //2) check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) return next();

    //3) check if user changed password after the token was issued
    //iat is the jwt timestamp
    if (await freshUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    //THERE IS A LOGGED IN USER
    //pug templates will get access to the following variable in locals
    res.locals.user = freshUser;
    return next();
  }
  next();
});

/*Since we cannot pass argument to a middleware function,
we wrap that function within a function, giving it access to the roles variable
due to closure.*/

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin', 'lead-guide']; default=role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) et user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user associated to that email address.', 404),
    );
  }
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //to remove required fields from usermodel post request while using the save method
  // set validateBeforeSave : false
  await user.save({ validateBeforeSave: false });
  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    //this only modifies the data, but doesn't really save it.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //verify if password token matches any hashedToken in db,
  //and verify if the token has not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //if we get here, the user has benn found and token is not expired , then we update
  //and save the users info into the db
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) Update changedPasswordAt property for the user

  //4) Log the user in, send JWT
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  //3) If so, update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  //4) Log user in, send Jwt
  createSendToken(user, 201, res);
});
