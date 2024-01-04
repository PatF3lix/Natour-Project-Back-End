// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//middleware for get Current User on /getMe, just to set id
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//configure how the file will be stored, in this case the destination
//it will be saved to, and the name we will save it as.
//** cb stands for callback function
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-id-currentimestamp.extention (.jpeg, etc)
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
//** this way the image will be stored as a buffer
const multerStorage = multer.memoryStorage();

//this filter only permits images to be uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

//must install multer
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

//must install sharp npm (good resize lib)
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  //the buffer is then available at req.file.buffer
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400,
      ),
    );
  }

  //2) filter body object in order to update only certain fields
  const filteredBody = filterObj(req.body, 'name', 'email');
  //adding photo property to filtered object, in order to update user photo file reference
  //in the database
  if (req.file) filteredBody.photo = req.file.filename;

  //3) find user by idandUpdate
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  //4) Update user document
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);
//don't use this route use sign up instead , this route is for admin only
exports.getUser = factory.getOne(User);
//Do not update password with this!
exports.updateUser = factory.updateOne(User);
exports.delUser = factory.deleteOne(User);
exports.createUser = factory.createOne(User);
