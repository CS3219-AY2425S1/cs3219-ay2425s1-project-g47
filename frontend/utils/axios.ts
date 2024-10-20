import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Create an Axios instance
const instance = axios.create({
  baseURL: "http://localhost/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
