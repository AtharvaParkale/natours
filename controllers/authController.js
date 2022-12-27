const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//THIS FUNCTION WILL CREATE A NEW USER IN THE DATABASE
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //CREATE A JWT TOKEN
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

//LOGIN USER BASED ON PASSWORD AND EMAIL

exports.login = catchAsync(async (req, res, next) => {
  //THIS IS OBJECT DESTRUCTURING
  const { email, password } = req.body;

  //CHECK IF EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please provide email and password ! ', 400));
  }
  //CHECK IF USER EXISTS AND PASSWORD IS CORRECT
  const user = await User.findOne({ email: email }).select('+password');
  // console.log(user);

  //THIS FUNCTION IS DEFINED IN USER MODEL (user,correctPassword)

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password !', 401));
  }

  //IF EVERYTHING IS OKAY, SEND TOKEN TO CLIENT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: token,
  });
});

//BEFORE ACCESSING THE GET ALL TOURS THIS MIDDLEWARE WILL CHECK WHETHER THE USER
//IS LOGGED IN OR NOT
exports.protect = catchAsync(async (req, res, next) => {
  // 1.) GET THE TOKEN AND CHECK IF ITS THERE
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //IF THE USER DOES NOT LOGIN THEN HE/SHE WILL NOT GET THE JWT TOKEN
  if (!token) {
    return next(new AppError('You are not logged in. PLease login', 401));
  }

  // 2.) VERIFICATION OF  THE TOKEN

  //IN THIS STEP WE CHECK IF SOMEONE MANIPULATED THE DATA OR EXPIRED
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. ) CHECK IF USER STILL EXISTS
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError('The user belonging to the token does not exist', 401)
    );
  }

  // 4.) USER CHANGE PASSWORD AFTER THE JWT WAS ISSUED
  if (freshUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password !: PLease login again', 401)
    );
  }

  //IF CODE REACHES HERE THEN GRANT ACCESS
  req.user = freshUser;
  next();
});

//THIS IS A MIDDLEWARE FUNCTION
//THIS WILL GIVE ACCESS BASED ON ROLE OF THE USER, LIKE A ADMIN OR A NORMAL USER

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //HERE ...ROLES IS AN ARRAY ['user','lead-guide']

    //THIS WILL CHECK IF USER IS THERE IN ARRAY OR NOT
    //IF ROLE OF USER NOT THERE THEN DON'T GIVE HIM THE PERMISSION
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action !')
      );
    }
    next();
  };
};

//FORGOT RESET
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.) GET USER BASED ON POSTED EMAIL

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no email with that email', 404));
  }

  //2.)  GENERATE THE RANDOM TOKEN
  //Create a instance method

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  //3.) SEND IT BACK AS AN EMAIL
  console.log(req.protocol);
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? Submit your patch request with your new password and passwordConfirm to : ${resetURL}.\n If didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (Only valid for 10 min)',
      message: message,
    });

    res.status(200).json({
      status: 'Success !',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error , tru again later !', 500));
  }
});

//RESET PASSWORD
exports.resetPassword = (req, res, next) => {};
