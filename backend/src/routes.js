const express = require("express");

const authRouter = require("./modules/auth/auth.route.js");
const userRouter = require("./modules/users/user.route.js");
const recordRouter = require("./modules/records/record.route.js");

const router = express.Router();
const authMiddleware = require("./middleware");

router.use("/auth", authRouter);
router.use("/users", authMiddleware, userRouter);
router.use("/records", authMiddleware, recordRouter);

module.exports = router;
