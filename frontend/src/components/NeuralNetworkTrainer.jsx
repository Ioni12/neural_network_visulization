import React, { useState, useEffect } from "react";
import { Play, Square, RotateCcw, Brain, TrendingDown } from "lucide-react";

// API functions
const API_URL = "http://localhost:3000/api/nn";

const api = {
  init: async () => {
    const res = await fetch(`${API_URL}/init`, { method: "POST" });
    return res.json();
  },

  trainStep: async (batchSize = 1000) => {
    const res = await fetch(`${API_URL}/train-step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchSize }),
    });
    return res.json();
  },

  getState: async () => {
    const res = await fetch(`${API_URL}/state`);
    return res.json();
  },
};

export default function NeuralNetworkTrainer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingData, setTrainingData] = useState(null);
  const [batchSize, setBatchSize] = useState(1000);
  const [iterations, setIterations] = useState(0);
  const [currentError, setCurrentError] = useState(null);
  const [errorHistory, setErrorHistory] = useState([]);
  const [status, setStatus] = useState("Not initialized");

  const handleInit = async () => {
    try {
      setStatus("Initializing network...");
      const result = await api.init();
      setIsInitialized(true);
      setIterations(0);
      setErrorHistory([]);
      setCurrentError(null);
      setTrainingData(result);
      setStatus(`Ready! Loaded ${result.trainingDataSize} training samples`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleTrainStep = async () => {
    if (!isInitialized) {
      setStatus("Please initialize the network first");
      return;
    }

    try {
      const result = await api.trainStep(batchSize);
      setIterations(result.iteration);
      setCurrentError(parseFloat(result.error));
      setErrorHistory((prev) => [...prev, parseFloat(result.error)].slice(-50));
      setStatus(`Training... Iteration ${result.iteration}`);
    } catch (error) {
      setStatus(`Training error: ${error.message}`);
    }
  };

  const startContinuousTraining = async () => {
    setIsTraining(true);
    setStatus("Training in progress...");
  };

  const stopTraining = () => {
    setIsTraining(false);
    setStatus("Training paused");
  };

  useEffect(() => {
    let interval;
    if (isTraining && isInitialized) {
      interval = setInterval(async () => {
        await handleTrainStep();
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTraining, isInitialized, batchSize]);

  const resetNetwork = () => {
    setIsInitialized(false);
    setIsTraining(false);
    setIterations(0);
    setCurrentError(null);
    setErrorHistory([]);
    setStatus("Reset complete. Click Initialize to start again.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">
              MNIST Neural Network Trainer
            </h1>
          </div>
          <p className="text-gray-300">
            Train a neural network to recognize handwritten digits
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Initialize Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Network Control
              </h2>

              <button
                onClick={handleInit}
                disabled={isInitialized}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
              >
                {isInitialized ? "Network Initialized ✓" : "Initialize Network"}
              </button>

              <button
                onClick={resetNetwork}
                className="w-full bg-white/10 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Network
              </button>
            </div>

            {/* Training Controls */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Training Controls
              </h2>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Batch Size: {batchSize}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full"
                  disabled={isTraining}
                />
              </div>

              <div className="flex gap-2">
                {!isTraining ? (
                  <button
                    onClick={startContinuousTraining}
                    disabled={!isInitialized}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Training
                  </button>
                ) : (
                  <button
                    onClick={stopTraining}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop Training
                  </button>
                )}

                <button
                  onClick={handleTrainStep}
                  disabled={!isInitialized || isTraining}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Single Step
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-2">Status</h2>
              <p className="text-gray-300 text-sm">{status}</p>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔢</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Iterations</p>
                    <p className="text-3xl font-bold text-white">
                      {iterations.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Current Error</p>
                    <p className="text-3xl font-bold text-white">
                      {currentError !== null ? currentError.toFixed(5) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Error History
              </h2>

              {errorHistory.length > 0 ? (
                <div className="relative h-64 flex items-end gap-1">
                  {errorHistory.map((error, idx) => {
                    const maxError = Math.max(...errorHistory);
                    const height = (error / maxError) * 100;
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-red-500 to-orange-400 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                        title={`Error: ${error.toFixed(5)}`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>
                    No training data yet. Start training to see error history.
                  </p>
                </div>
              )}
            </div>

            {/* Training Info */}
            {trainingData && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Dataset Info
                </h2>
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <p className="text-sm text-gray-400">Training Samples</p>
                    <p className="text-lg font-semibold">
                      {trainingData.trainingDataSize?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      Network Architecture
                    </p>
                    <p className="text-lg font-semibold">784 → 64 → 10</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
