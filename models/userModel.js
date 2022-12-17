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
  password: {
    type: String,
    required: [true, 'Please provide a password !'],
    minlength: 8,
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
});

//BETWEEN THE MOMENT WE RECEIVE THE DATA AND SAVE INTO THE DATABASE
//IT IS A MIDDLEWARE

userSchema.pre('save', async function (next) {

  //ONLY RUN THIS FUNCTION IF PASSWORD WAS ACTUALLY MODIFY
  if (!this.isModified('password')) return next();
  
  //HASH THE PASSWORD WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);
  
  //DELETE PASSWORDCONFIRM FIELD
  this.passwordConfirm = undefined;
  next();
});

//CREATING MODEL OUT OF THE SCHEMA
const User = mongoose.model('User', userSchema);
module.exports = User;