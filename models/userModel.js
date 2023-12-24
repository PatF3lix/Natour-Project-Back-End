const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

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

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  /*we only need the passwordConfirm field to validate userPassword will signUp is being
  perform, but we do not want to persits this data to the database, hence we mark that field
  as undefined.*/
  this.passwordConfirm = undefined;
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

const User = mongoose.model('User', userSchema);

module.exports = User;
