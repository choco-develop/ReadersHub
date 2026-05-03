const Author = require("../Models/authorModel");
const catchAsync = require("../Utils/catchAsync");
const factory = require("./handlerController");

exports.getAllAuthors = factory.getAll(Author);

exports.getAuthor = factory.getOne(Author, {
  path: "books",
  select: "-author",
});
exports.createAuthor = factory.createOne(Author);
exports.updateAuthor = factory.updateOne(Author);
exports.deleteAuthor = factory.deleteOne(Author);
