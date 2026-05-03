module.exports = class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    ((this.message = message),
      (this.statusCode = statusCode),
      (this.isOperational = true));
    this.status = statusCode.toString().startsWith(4) ? "Failed" : "Error";
  }
};
