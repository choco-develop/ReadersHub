const mongoose = require("mongoose");
const slugify = require("slugify");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A book must have a title"],
      unique: true,
      maxlength: [50, "A title must not exceed 100 characters "],
    },
    titleSlug: {
      type: String,
    },
    writer: {
      type: String,
      required: [true, "A book must have writer"],
      select: false,
    },
    genre: {
      type: String,
      required: [true, "A book must have a genre"],
    },
    plot: {
      type: String,
      required: [true, "A book must have a plot"],
    },
    pages: {
      type: Number,
      required: [true, "A book must have number of pages"],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: [1.0, "A book rate should not be lower than 1.0"],
      max: [5.0, "A book rate should not be greater than 5.0"],
    },
    numberOfReviews: {
      type: Number,
    },
    keyThemes: [String],
    active: {
      type: Boolean,
      default: true,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "Author",
    },
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } },
);

bookSchema.virtual("estimatedReadHours").get(function () {
  const time = this.pages / 24;
  return time.toFixed(2);
});

bookSchema.virtual("reviews", {
  ref: "Reviews",
  foreignField: "book",
  localField: "_id",
});

//MONGOOSE MIDDLWARE ----pre & post

// 1- Document middle ware ----it acts on save and create methods only
bookSchema.pre("save", function () {
  this.titleSlug = slugify(this.title, { lower: true });
  console.log(this.titleSlug);
});

bookSchema.post("save", function (doc) {
  console.log(doc);
});

// 2-Query middleware  ---- it also access the doc using this

bookSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
  this.populate("author");
  this.start = Date.now();
});

bookSchema.post(/^find/, function (docs) {
  const duration = Date.now() - this.start;
  // console.log(duration, docs.length);
});

// Aggregate Middlware

bookSchema.pre("aggregate", function (docs) {
  this._pipeline.unshift({ $match: { active: { $ne: false } } });
});

bookSchema.index({ rating: 1, pages: -1 });
bookSchema.index({});

module.exports = mongoose.model("Books", bookSchema);
