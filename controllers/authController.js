// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

//post request
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      use: newUser,
    },
  });
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
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
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
  }
  // console.log(token);
  if (!token) {
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
      new AppError('The user belonging yo this token, no longer exists', 401),
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
