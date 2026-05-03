const User = require("../Models/userModel");
const catchAsync = require("../Utils/catchAsync");
const ApiError = require("../Utils/apiError");
const factory = require("./handlerController");

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  // update name and email

  if (req.body.password || req.body.passwordConfirmation) {
    return next(new ApiError("You cannot update password on this route", 400));
  }

  const filteredBody = filteredObj(req.body, "name", "email");

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    returnDocument: "after",
  });

  res.status(200).json({
    status: "success",
    message: "User profile updated",
    data: {
      updatedUser,
    },
  });
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  //GOal-- set current user as active:false

  //   1) Get current user.. &  2) Set current User active to false
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // 3) Return a response
  res.status(204).json({
    status: "success",
    message: "Profile deleted",
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
