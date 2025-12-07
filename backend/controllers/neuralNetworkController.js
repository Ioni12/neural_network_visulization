const fs = require("fs");
const NeuralNetwork = require("../lib/NeuralNetwork");

let nn = null;
let trainingData = null;
let currentIteration = 0;

function labelToOneHot(label) {
  const oneHot = Array(10).fill(0);
  oneHot[label] = 1;
  return oneHot;
}

function loadTrainingData() {
  if (!trainingData) {
    trainingData = fs
      .readFileSync(
        "C:/Users/joni/Desktop/node_projects/digit-recognition/backend/data/mnist_handwritten_train.json",
        "utf8"
      )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    console.log(`📚 Training data loaded: ${trainingData.length} samples`);
  }
  return trainingData;
}

exports.initNetwork = (req, res) => {
  nn = new NeuralNetwork(784, 64, 10);
  currentIteration = 0;

  loadTrainingData();

  res.json({
    success: true,
    message: `Network initialized`,
    trainingDataSize: trainingData.length,
  });
};

exports.getNetworkState = (req, res) => {
  if (!nn) {
    return res.status(400).json({ error: "Network not initialized" });
  }

  res.json({
    weightsIH: nn.weights_ih.data,
    weightsHO: nn.weights_ho.data,
    biasH: nn.bias_h.data,
    biasO: nn.bias_o.data,
    currentIteration,
    trainingData,
  });
};

exports.trainStep = (req, res) => {
  if (!nn) {
    return res
      .status(400)
      .json({ error: "Network not initialized. Call /api/nn/init first" });
  }

  if (!trainingData) {
    loadTrainingData();
  }

  const { batchSize = 1000 } = req.body;
  let totalError = 0;

  for (let i = 0; i < batchSize; i++) {
    const randomIndex = Math.floor(Math.random() * trainingData.length);
    const data = trainingData[randomIndex];
    const targets = labelToOneHot(data.label);
    const error = nn.train(data.image, targets);
    totalError += error;
  }

  currentIteration += batchSize;

  res.json({
    success: true,
    iteration: currentIteration,
    error: (totalError / batchSize).toFixed(5),
    batchSize,
  });
};
