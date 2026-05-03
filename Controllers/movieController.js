const fs = require("fs");
const movieRecord = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/index2.json`),
);

exports.checkId = (req, res, next, value) => {
  if (value > movieRecord.length - 1) {
    res.status(400).json({
      status: "failed",
      message: "Bad Request",
    });
  }
  next();
};

exports.getAllMovies = (req, res) => {
  res.status(200).json({
    status: "Success",
    requestedAt: req.timeStamp,
    message: "You have made a request to the movies route",
    data: {
      movieRecord,
    },
  });
};

exports.getMovie = (req, res) => {
  const id = req.params.id * 1;
  res.status(200).json({
    status: "Success",
    data: {
      movie: movieRecord[id - 1],
    },
  });
};
