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

    if (!res) {
      console.log("no data");
    }

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const init = async () => {
  try {
    await api.post("/init");
  } catch (error) {
    console.log(error);
  }
};
