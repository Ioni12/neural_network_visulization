import React, { useState } from "react";
import { init, getState, trainStep } from "../services/nnService";

const NeuralNetwork = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [batchSize, setBatchSize] = useState(30000);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [trainingData, setTrainingData] = useState([]);

  const handleInit = async () => {
    try {
      init();
      setIsInitialized(true);
      console.log("initialized");
      let res = await getState();
      setTrainingData(res.trainingData);
      setCurrentIteration(0);
      console.log(res.currentIteration);
      console.log(res.trainingData[0].image);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTrainStep = async () => {
    setIsTraining(true);
    try {
      const result = await trainStep(batchSize);
      setCurrentIteration(result.iteration);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    setIsTraining(false);
  };

  return (
    <div>
      <button onClick={handleInit}>init</button>
      <button onClick={handleTrainStep}>Train</button>
      {trainingData.length > 0 && trainingData[currentIteration] && (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="w-full h-full flex flex-wrap gap-1 content-center">
            {trainingData[currentIteration].image.map((value, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: `rgb(${value}, ${value}, ${value})`,
                  width: "6px",
                  height: "6px",
                }}
                title={`Color ${i + 1}: ${value}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetwork;
