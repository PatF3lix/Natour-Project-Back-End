const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    unique: true,
  },
  slug: String,
  email: {
    type: String,
    required: [true, 'a user must have an email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'a user must have a password'],
    minlength: [8, 'a password must have 8 characters or more'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'the entered password must match!'],
    validate: {
      //this only works on create and save !!
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Slugify
userSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//password encryption upon modification
//only run this function if password was actually modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (process.env.NODE_ENV === 'LOADER') {
    this.isNew = true;
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/*
  instance Method
  instance methods are available on all user documents

  this funct returns true if both passwords are the same,
  this func hashed the password passed in during login, hashes that password using bcrypt,
  then compares it to the one stored in the database
*/
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  let changedTimeStamp;
  if (this.passwordChangedAt) {
    changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }
  //False means not changed
  return JWTTimestamp < changedTimeStamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //encrypting the token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //10min to reset password
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
