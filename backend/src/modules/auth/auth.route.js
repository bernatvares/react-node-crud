const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware");

router.route("/login").post(authController.login);
router.route("/signup").post(authController.signUp);
router.route("/profile").put(authMiddleware, authController.updateProfile);
router.route("/profile").delete(authMiddleware, authController.deleteProfile);

module.exports = router;
