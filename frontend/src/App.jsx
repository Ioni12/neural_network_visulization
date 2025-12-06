import { useState } from "react";
import NeuralNetworkGrid from "./components/NeuralNetworkGrid";
import { init } from "./services/nnService";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    init();
  }, []);
  return (
    <>
      <NeuralNetworkGrid />
    </>
  );
}

export default App;
