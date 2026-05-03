const Review = require("../Models/reviewModel");
const catchAsync = require("../Utils/catchAsync");
const factory = require("./handlerController");

exports.addReviewProperties = (req, res, next) => {
  if (!req.body.book) req.body.book = req.params.bookId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review, "book");

exports.getReviews = factory.getOne(Review);

exports.createReviews = factory.createOne(Review);

exports.updateReviews = factory.updateOne(Review, true);

exports.deleteReviews = factory.deleteOne(Review, true);
