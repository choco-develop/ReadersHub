const express = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userController");

const router = express.Router();

router.post("/signin", authController.signup);
router.post("/login", authController.login);
router.post("/forget-password", authController.forgetPassword);
router.patch("/reset-password/:resetToken", authController.resetPassword);

router.use(authController.protect);

router.patch("/update-password", authController.updatePassword);
router.patch("/update-me", userController.updateCurrentUser);
router.delete("/delete-me", userController.deleteCurrentUser);

router.use(authController.restrictedTo("admin"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);

module.exports = router;
