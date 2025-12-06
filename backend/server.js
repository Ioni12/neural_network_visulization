const express = require("express");
const cors = require("cors");
const fs = require("fs");
const NeuralNetwork = require("./lib/NeuralNetwork");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/nn", nnRoutes);

const nn = new NeuralNetwork(784, 64, 10);

let trainingData = fs
  .readFileSync("./data/mnist_handwritten_train.json", "utf8")
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));
let currentIteration = 0;

function labelToOneHot(label) {
  const oneHot = Array(10).fill(0);
  oneHot[label] = 1;
  return oneHot;
}

app.post("/api/train-step", (req, res) => {
  const batchSize = 1000;
  let totalError = 0;

  for (let i = 0; i < batchSize; i++) {
    const randomIndex = Math.floor(Math.random() * trainingData.length);
    const data = trainingData[randomIndex];
    const targets = labelToOneHot(data.label); // Convert label to one-hot
    const error = nn.train(data.image, targets);
    totalError += error;
  }

  currentIteration += batchSize;
  res.json({
    success: true,
    iteration: currentIteration,
    error: (totalError / batchSize).toFixed(4),
  });
});

app.listen(3000, () => {
  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📊 Neural Network: 784 → 64 → 10`);
  console.log(`📚 Training data: ${trainingData.length} samples`);
});
