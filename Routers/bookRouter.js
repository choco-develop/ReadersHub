const express = require("express");
const bookController = require("../Controllers/bookController");
const authController = require("../Controllers/authController");
const reviewRouter = require("./reviewRouter");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.use("/:bookId/reviews", reviewRouter);

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookController.addBookId, bookController.createBook);

router
  .route("/top-recommended")
  .get(bookController.aliasTopRecommended, bookController.getAllBooks);
router
  .route("/least-rated")
  .get(bookController.aliasLeastRecommended, bookController.getAllBooks);

router.route("/book-analytics").get(bookController.getAnalytics);
router.route("/popular-themes").get(bookController.getPopularThemes);

router.use(authController.restrictedTo("admin"));

router
  .route("/:id")
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook);

module.exports = router;
