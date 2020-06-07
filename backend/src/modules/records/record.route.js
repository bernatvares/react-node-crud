const express = require("express");
const router = express.Router();
const recordController = require("./record.controller");

router.route("/").get(recordController.list).post(recordController.create);
router
  .route("/:id")
  .get(recordController.read)
  .put(recordController.update)
  .delete(recordController.remove);

router.param("id", recordController.getRecordByID);

module.exports = router;
