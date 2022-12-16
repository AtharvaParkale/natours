const mongoose = require('mongoose');
const validator = require('validator');

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
    validate:{
        validator:function(el){
            return el===this.password
        }
    }
  },
});

//CREATING MODEL OUT OF THE SCHEMA

const User = mongoose.model('User', userSchema);

module.exports = User;
