const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1.) Create error is the user POSTs password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update !. Please use update my password',
        400
      )
    );
  }

  //2.) Filtered out unwanted field names like 'role' etc
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3.) Update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser,
    },
  });
});


//DEACTIVATE THE ACCOUNT OF CURRENT USER
exports.deleteMe= catchAsync(async (req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false})

  res.status(204).json({
    status:'success',
    data:null
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    msg: 'This route is note implemented yet !!',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    msg: 'This route is note implemented yet !!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    msg: 'This route is note implemented yet !!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    msg: 'This route is note implemented yet !!',
  });
};
