const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/album/create-abl");
const DeleteAbl = require("../abl/album/delete-abl");
const GetAbl = require("../abl/album/get-abl");
const ListAbl = require("../abl/album/list-abl");
const UpdateAbl = require("../abl/album/update-abl");

router.post("/create", async (req, res) => {
  await CreateAbl(req, res);
});

router.delete("/delete", async (req, res) => {
  await DeleteAbl(req, res);
});

router.get("/get", async (req, res) => {
  await GetAbl(req, res);
});

router.get("/list", async (req, res) => {
  await ListAbl(req, res);
});

router.post("/update", async (req, res) => {
  await UpdateAbl(req, res);
});

module.exports = router;
