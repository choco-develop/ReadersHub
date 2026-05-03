const ApiError = require("../Utils/apiError");

const handleCastErrorDB = (err) => {
  return new ApiError(`Invalid ${err.path}: ${err.value}`, 400);
};
const handleValidationErrorDB = (err) => {
  const validationError = Object.values(err.errors).map((el) => el.message);
  return new ApiError(`${validationError.join(". ")}`, err.statusCode);
};
const handleDuplicateKeyDB = (err) => {
  const value = err.errmsg.match(/\"([^\"]+)\"/);
  return new ApiError(`${value[1]} already exists!`, err.statusCode);
};
const handleInvalidToken = (err) => {
  return new ApiError("Invalid token, login and try again!", 401);
};
const handleTokenExpired = (err) => {
  return new ApiError("Token Expired, Login Again", 401);
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error 💥💥", err);
    return res.status(500).json({
      status: "error",
      message: "Oops! An error occured",
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  if (process.env.NODE_ENV === "development") {
    if (!err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
      });
    } else {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
      });
    }
  }

  if (process.env.NODE_ENV === "production") {
    let error = err;
    if (err.name === "CastError") {
      error = handleCastErrorDB(error);
    } else if (err.code === 11000) {
      error = handleDuplicateKeyDB(error);
    } else if (err.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    } else if (err.name === "JsonWebTokenError") {
      error = handleInvalidToken(error);
    } else if (err.name === "TokenExpiredError") {
      error = handleTokenExpired(error);
    }
    sendErrorProd(error, res);
  }
};
