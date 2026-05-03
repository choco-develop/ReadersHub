const express = require("express");
const authController = require("../Controllers/authController");
const authorController = require("../Controllers/authorController");
const bookRouter = require("./bookRouter");

const router = express.Router();

router.use(authController.protect);

router.use("/:authorId/books", bookRouter);

router.route("/").get(authorController.getAllAuthors);

router.route("/:id").get(authorController.getAuthor);

router.use(authController.restrictedTo("admin"));

router
  .route("/:id")
  .post(authorController.createAuthor)
  .patch(authorController.updateAuthor)
  .delete(authorController.deleteAuthor);

module.exports = router;
