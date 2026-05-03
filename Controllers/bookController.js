const Books = require(`${__dirname}/../Models/bookModel.js`);
const factory = require("./handlerController");
const ApiFeatures = require(`${__dirname}/../Utils/apiFeatures.js`);
const ApiError = require("../Utils/apiError");
const catchAsync = require("../Utils/catchAsync");

exports.aliasTopRecommended = (req, res, next) => {
  const currentQuery = { ...req.query };
  Object.defineProperty(req, "query", {
    value: {
      ...currentQuery,
      sort: "-rating",
      limit: "5",
      fields: "title, writer, plot, pages,rating",
    },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};

exports.aliasLeastRecommended = (req, res, next) => {
  const currentQuery = { ...req.query };

  Object.defineProperty(req, "query", {
    value: {
      ...currentQuery,
      sort: "rating",
      limit: "5",
    },
    enumerable: true,
    writable: true,
    configurable: true,
  });
  next();
};

exports.addBookId = (req, res, next) => {
  if (!req.body.author) req.body.author = req.params.authorId;
  next();
};

exports.getAnalytics = catchAsync(async (req, res, next) => {
  const bookAnalytics = await Books.aggregate([
    { $match: { rating: { $gte: 3.0 } } },
    {
      $group: {
        _id: "$genre",
        avgPages: { $avg: "$pages" },
      },
    },
  ]);
  res.status(200).json({
    status: "Success",
    data: bookAnalytics,
  });
});

exports.getPopularThemes = catchAsync(async (req, res) => {
  const popularThemes = await Books.aggregate([
    { $unwind: "$keyThemes" },
    {
      $match: { rating: { $gte: 4.0 } },
    },
    {
      $group: {
        _id: "$keyThemes",
        count: { $sum: 1 },
        books: {
          $push: {
            title: "$title",
            writer: "$writer",
            pages: "$pages",
            plot: "$plot",
          },
        },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    status: "Success",
    data: popularThemes,
  });
});

exports.getAllBooks = factory.getAll(Books);

exports.getBook = factory.getOne(Books, {
  path: "reviews",
  select: "review rating user -book",
});
exports.createBook = factory.createOne(Books);

exports.updateBook = factory.updateOne(Books);

exports.deleteBook = factory.deleteOne(Books);
