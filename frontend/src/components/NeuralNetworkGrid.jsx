import React, { useState, useEffect } from "react";
import { getState } from "../services/nnService";

const NeuralNetworkGrid = () => {
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRandomSample = async () => {
    setLoading(true);
    try {
      const sampleRes = await getState();
      setSample(sampleRes);
      console.log(sampleRes);
    } catch (error) {
      console.error("Error loading sample:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRandomSample();
  }, []);

  return (
    <div>
      <h1>{sample}</h1>
    </div>
  );
};

export default NeuralNetworkGrid;
