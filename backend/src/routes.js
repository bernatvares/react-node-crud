const express = require("express");

const authRouter = require("./modules/auth/auth.route.js");

const router = express.Router();

router.use("/auth", authRouter);

module.exports = router;
