const Matrix = require("./Matrix");

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function dsigmoid(y) {
  return y * (1 - y);
}

class NeuralNetwork {
  constructor(input_nodes, hidden_nodes, output_nodes) {
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;

    this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
    this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
    this.weights_ih.randomize();
    this.weights_ho.randomize();

    this.bias_h = new Matrix(this.hidden_nodes, 1);
    this.bias_o = new Matrix(this.output_nodes, 1);
    this.bias_h.randomize();
    this.bias_o.randomize();

    this.learning_rate = 0.1;
  }

  predict(input_array) {
    let inputs = Matrix.fromArray(input_array);

    let hidden = Matrix.multiply(this.weights_ih, inputs);
    hidden = hidden.add(this.bias_h);
    hidden.map(sigmoid);

    let output = Matrix.multiply(this.weights_ho, hidden);
    output = output.add(this.bias_o);
    output.map(sigmoid);

    return output.toArray();
  }

  train(input_array, target_array) {
    // Convert input to matrix
    let inputs = Matrix.fromArray(input_array);

    // Forward pass through hidden layer
    let hidden = Matrix.multiply(this.weights_ih, inputs);
    hidden = hidden.add(this.bias_h);
    hidden.map(sigmoid);

    // Forward pass through output layer
    let outputs = Matrix.multiply(this.weights_ho, hidden);
    outputs = outputs.add(this.bias_o);
    outputs.map(sigmoid);

    // Convert targets to matrix
    let targets = Matrix.fromArray(target_array);

    // Calculate output errors (targets - outputs)
    let output_errors = new Matrix(targets.rows, targets.cols);
    for (let i = 0; i < targets.rows; i++) {
      for (let j = 0; j < targets.cols; j++) {
        output_errors.data[i][j] = targets.data[i][j] - outputs.data[i][j];
      }
    }

    // Calculate output gradients
    let gradients = new Matrix(outputs.rows, outputs.cols);
    for (let i = 0; i < outputs.rows; i++) {
      for (let j = 0; j < outputs.cols; j++) {
        gradients.data[i][j] = outputs.data[i][j];
      }
    }
    gradients.map(dsigmoid);
    gradients = gradients.multiply(output_errors);
    gradients = gradients.multiply(this.learning_rate);

    // Calculate weight deltas for hidden->output
    let hidden_T = Matrix.transpose(hidden);
    let weights_ho_deltas = Matrix.multiply(gradients, hidden_T);

    // Update weights and biases for output layer
    this.weights_ho = this.weights_ho.add(weights_ho_deltas);
    this.bias_o = this.bias_o.add(gradients);

    // Calculate hidden layer errors
    let who_t = Matrix.transpose(this.weights_ho);
    let hidden_errors = Matrix.multiply(who_t, output_errors);

    // Calculate hidden gradients
    let hidden_gradient = new Matrix(hidden.rows, hidden.cols);
    for (let i = 0; i < hidden.rows; i++) {
      for (let j = 0; j < hidden.cols; j++) {
        hidden_gradient.data[i][j] = hidden.data[i][j];
      }
    }
    hidden_gradient.map(dsigmoid);
    hidden_gradient = hidden_gradient.multiply(hidden_errors);
    hidden_gradient = hidden_gradient.multiply(this.learning_rate);

    // Calculate weight deltas for input->hidden
    let inputs_T = Matrix.transpose(inputs);
    let weights_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

    // Update weights and biases for hidden layer
    this.weights_ih = this.weights_ih.add(weights_ih_deltas);
    this.bias_h = this.bias_h.add(hidden_gradient);

    // Return average absolute error
    let totalError = 0;
    for (let i = 0; i < output_errors.rows; i++) {
      for (let j = 0; j < output_errors.cols; j++) {
        totalError += Math.abs(output_errors.data[i][j]);
      }
    }
    return totalError / output_errors.rows;
  }

  serialize() {
    return {
      weights_ih: this.weights_ih.data,
      weights_ho: this.weights_ho.data,
      bias_h: this.bias_h.data,
      bias_o: this.bias_o.data,
    };
  }

  deserialize(data) {
    this.weights_ih.data = data.weights_ih;
    this.weights_ho.data = data.weights_ho;
    this.bias_h.data = data.bias_h;
    this.bias_o.data = data.bias_o;
  }
}

module.exports = NeuralNetwork;

// server.js update needed:
// Convert label (0-9) to one-hot encoded array
function labelToOneHot(label) {
  const oneHot = Array(10).fill(0);
  oneHot[label] = 1;
  return oneHot;
}

// In train-step endpoint:
// const targets = labelToOneHot(data.label);
// const error = nn.train(data.image, targets);
