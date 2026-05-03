const mongoose = require("mongoose");
const Book = require("./bookModel");

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    required: [true, "A review is required"],
    maxlength: [100, "A review must not exceed 100 characters "],
  },
  rating: {
    type: Number,
    required: [true, "A review must have a rating"],
    min: 1,
    max: 5,
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: "Books",
    required: [true, "A review must be referenced to a book"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A review must be referenced to a user"],
  },
});
reviewSchema.statics.calcAverageReview = async function (bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: {
        _id: "book",
        nRating: { $sum: 1 },
        aveRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    // console.log("...updating");
    const average = Math.round(stats[0].aveRating * 10) / 10;
    await Book.findOneAndUpdate(bookId, {
      rating: average,
      numberOfReviews: stats[0].nRating,
    });
  } else {
    await Book.findOneAndUpdate(bookId, {
      rating: 4.0,
      numberOfReviews: 0,
    });
  }
};
reviewSchema.post("save", function () {
  this.constructor.calcAverageReview(this.book);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverageReview(doc.book);
});

reviewSchema.index({ book: 1, user: 1 }, { unique: true });
module.exports = mongoose.model("Reviews", reviewSchema);
