const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');
// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require('crypto');

//name, email, photo, password, password confirm
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
    //in order to exclude fields, put the select property to false, like below
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

//Middleware

//Slugify
userSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//password encryption upon modification
userSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  if (process.env.NODE_ENV === 'LOADER') {
    this.isNew = true;
    return next();
  }

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  /*we only need the passwordConfirm field to validate userPassword will signUp is being
  perform, but we do not want to persits this data to the database, hence we mark that field
  as undefined.*/
  this.passwordConfirm = undefined;
  next();
});

//this function updates the PasswordChangedAt field, when password is reset
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  //-1000 to remove async problems, small hack but will work for the time being
  //will then ensure that the token is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this keyword points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//instance Method
//instance mthods are available on all user documents
/*
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
  /**We are creating this token, to send it to the user and so it's like a
   * reset password really that the user can then use to create a new real password.
   * of course only the user will have access to this token.
   */
  const resetToken = crypto.randomBytes(32).toString('hex');
  //encrypting the token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //10min to reset password
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  //we send the token by email, and we keep the encrypted version in our database.
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
