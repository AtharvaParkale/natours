const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name !'],
  },

  email: {
    type: String,
    required: [true, 'Please tell us your email !'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please a valid email !'],
  },

  photo: String,

  passwordChangedAt: Date,

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guid', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Please provide a password !'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password !'],

    //This only works on save
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
    message: 'Passwords are not the same !',
  },

  passwordResetToken: String,

  passwordResetExpires: Date,
});

//BETWEEN THE MOMENT WE RECEIVE THE DATA AND SAVE INTO THE DATABASE
//IT IS A MIDDLEWARE

userSchema.pre('save', async function (next) {
  //ONLY RUN THIS FUNCTION IF PASSWORD WAS ACTUALLY MODIFY
  if (!this.isModified('password')) return next();

  //HASH THE PASSWORD WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);

  //DELETE PASSWORD CONFIRM FIELD
  this.passwordConfirm = undefined;
  next();
});

//CHECK THE PASSWORDS BY BCRYPT, IF SAME RETURN TRUE ELSE FALSE
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//INSTANCE METHOD
userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

//INSTANCE METHOD
userSchema.methods.createPasswordResetToken = function () {
  //WE WILL SEND THIS TOKEN TO THE USER

  //THIS IS THE ORIGINAL RESET TOKEN
  const resetToken = crypto.randomBytes(32).toString('hex');

  //THIS IS THE RESET TOKEN AFTER ENCRYPTING IT
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  //EXPIRES AFTER 10MIN
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//CREATING MODEL OUT OF THE SCHEMA
const User = mongoose.model('User', userSchema);
module.exports = User;
