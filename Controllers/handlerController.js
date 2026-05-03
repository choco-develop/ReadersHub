const catchAsync = require("../Utils/catchAsync");
const ApiFeatures = require("../Utils/apiFeatures");
const ApiError = require("../Utils/apiError");

exports.getAll = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    const doc = await features.query.populate(popOption);

    res.status(200).json({
      status: "Success",
      requestedAt: req.timeStamp,
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(popOptions);
    if (!doc) {
      return next(new ApiError("No ACTIVE doc found with that ID", 404));
    }
    res.status(200).json({
      status: "Success",
      requestedAt: req.timeStamp,
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      requestedAt: req.timeStamp,
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model, isUser = false) =>
  catchAsync(async (req, res, next) => {
    let doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new ApiError("No ACTIVE doc found with that ID", 404));
    }

    if (isUser && doc.user.toString() !== req.user.id) {
      return next(new ApiError("Forbidden", 403));
    }

    doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    res.status(200).json({
      status: "Success",
      requestedAt: req.timeStamp,
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model, isUser = false) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new ApiError("No doc found with that ID", 404));
    }

    if (isUser && doc.user.toString() !== req.user.id) {
      return next(new ApiError("Forbidden", 403));
    }

    await doc.deleteOne();

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
