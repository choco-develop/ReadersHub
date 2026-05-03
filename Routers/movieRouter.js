const express = require("express");
const movieController = require(
  `${__dirname}/../Controllers/movieController.js`,
);

const router = express.Router();

router.param("id", movieController.checkId);

router.route("/").get(movieController.getAllMovies);
router.route("/:id").get(movieController.getMovie);
module.exports = router;
