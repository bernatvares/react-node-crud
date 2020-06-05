const express = require("express");

const authRouter = require("./modules/auth/auth.route.js");
const userRouter = require("./modules/users/user.route.js");
const authMiddleware = require("./middleware");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", authMiddleware, userRouter);

module.exports = router;
