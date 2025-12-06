const express = require("express");
const router = express.Router();
const nnController = require("../controllers/neuralNetworkController");

router.post("/init", nnController.initNetwork);

router.get("/state", nnController.getNetworkState);
