const express = require("express");
const router = express.Router();

const DeleteAbl = require("../abl/photo/delete-abl");
const GetAbl = require("../abl/photo/get-abl");
const UpdateAbl = require("../abl/photo/update-abl");

router.delete("/delete", async (req, res) => {
  await DeleteAbl(req, res);
});

router.get("/get", async (req, res) => {
  await GetAbl(req, res);
});

router.post("/update", async (req, res) => {
  await UpdateAbl(req, res);
});

module.exports = router;
