const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
