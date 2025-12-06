const NeuralNetwork = require("../lib/NeuralNetwork");

let nn = null;

exports.initNetwork = (req, res) => {
  nn = new NeuralNetwork(784, 64, 10);

  res.json({ success: true });
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
  });
};
