const mongoose = require("mongoose");

const authorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "An author must have a name"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "An author must have a date of Birth"],
    },
    biography: {
      type: String,
      required: [true, "An author must have a biography"],
      minlength: [50, "Biography must ahve a minimum of 50 character"],
      maxlength: [200, "Biography must not exceed 200 characters"],
    },
    // booksWritten
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate
authorSchema.virtual("books", {
  ref: "Books",
  foreignField: "author",
  localField: "_id",
});

const Author = mongoose.model("Author", authorSchema);

module.exports = Author;
