const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const catchAsync = require("../Utils/catchAsync");
const ApiError = require("../Utils/apiError");
const sendMail = require("../Utils/Email");

const createResponseWithToken = (res, statusCode, user, message) => {
  const token = user.signToken();

  const cookieOptions = {
    maxAge: process.env.COOKIE_EXPIRESIN * 60 * 60 * 1000,
    httpOnly: true,
  };
  if (process.env === "production") {
    ((cookieOptions.samesite = "lax"), (cookieOptions.secure = true));
  } else {
    cookieOptions.samesite = "none";
  }
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user,
    },
    message: message,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  ((user.password = undefined), (user.__v = undefined));

  createResponseWithToken(res, 201, user);
});
exports.login = catchAsync(async (req, res, next) => {
  // check if user entered cred
  if (!req.body.email || !req.body.password) {
    return next(new ApiError("Enter your email and password to login!", 400));
  }
  //   find user by email
  const { email, password } = req.body;
  const currentUser = await User.findOne({ email }).select("+password");

  //   confirm entered password with db password
  if (!currentUser || !(await currentUser.checkPassword(password)))
    return next(new ApiError("Enter a valid email and password", 400));

  //Grant authorization....give access token

  createResponseWithToken(res, 200, currentUser);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = "";
  //   check for token in authorization header
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  // verify token to make sure it has not been manipulated or expired
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //   check user exist on DB
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ApiError("User does not exist", 401));
  }
  // check for password Change time and token issue time..a new token need to be reissued if password was changed.
  if (user.passwordChange(decoded.iat)) {
    return next(
      new ApiError(
        "User recently changed their password! Login again to continue",
        401,
      ),
    );
  }
  //   Grant access
  req.user = user;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1) check if req.body has a email
  const email = req.body.email;
  if (!email) {
    return next(new ApiError("Email is required to reset password", 400));
  }
  // 2) check if user exist on DB
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new ApiError("User does not exist with the provided details", 400),
    );
  }
  // 3) if user exist, issue a password reset token
  const resetToken = await user.createPasswordResetToken();
  try {
    await user.save({ validateBeforeSave: false });
    // 4)send the unencoded rest token to user via email
    const options = {
      to: user.email,
      subject: "Password Reset Link (Expires in 10 mins",
      message: `Click on this link to reset your password. ${req.protocol}//random-url/${resetToken}`,
    };
    await sendMail(options);

    // 5) Sen res

    res.status(200).json({
      status: "success",
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    return next(
      new ApiError("Failed to send password reset Link. Try again later", 400),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Check that password and passwordConfirm was sent and run validators
  if (!req.body.password || !req.body.passwordConfirmation) {
    return next(
      new ApiError("Provide password and password confirmation", 400),
    );
  }
  // 2) Check if unhashed token (now hashed) matches DB token
  const resetToken = req.params.resetToken;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3) check if resetToken is still valid
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  }).select("+password");
  if (!user) {
    return next(new ApiError("Invalid Reset Token, Try again later.", 401));
  }
  // 4) Reset the password..
  user.resetPassword(req.body.password, req.body.passwordConfirmation);
  await user.save({ validateBeforeSave: true });

  // 5)Res
  createResponseWithToken(res, 200, user, "Password reset successful");
});

exports.restrictedTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    // check logged in user
    const currentUser = req.user;
    if (!roles.includes(currentUser.role)) {
      return next(
        new ApiError("You are not allowed to access this route.", 401),
      );
    }
    next();
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // ) get logged in user current password, new password and password confirm from req.body
  const { password, newPassword, passwordConfirmation } = req.body;

  if (!req.body || !password || !newPassword || !passwordConfirmation) {
    return next(
      new ApiError("Provide password,newPassword and passwordConfirmation"),
    );
  }
  // 2) get logged in user DB password and compare both current and DB...
  const currentUser = await User.findById(req.user.id).select("+password");
  if (!currentUser.checkPassword(password)) {
    return next(
      new ApiError(
        "Incorrect Password! Enter correct password and try again",
        400,
      ),
    );
  }
  // 3) Run validators as you save new Password to DB and use save() to run middleware
  currentUser.resetPassword(newPassword, passwordConfirmation);
  await currentUser.save({ runValidators: true });
  // 4) Issue new token & // 5) Send res

  createResponseWithToken(res, 200, currentUser);
});
