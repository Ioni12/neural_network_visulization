import axios from "axios";

const apiUrl = "http://localhost:3000/api/nn";

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getState = async () => {
  try {
    const res = await api.get("/state");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const init = async () => {
  try {
    const res = await api.post("/init");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const trainStep = async (batchSize = 1000) => {
  try {
    const res = await api.post("/train-step", { batchSize });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
