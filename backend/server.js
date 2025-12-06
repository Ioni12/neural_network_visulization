const express = require("express");
const cors = require("cors");
const nnRoutes = require("./routes/neuralNetworkRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/nn", nnRoutes);

app.listen(3000, () => {
  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📊 Neural Network API ready`);
});
