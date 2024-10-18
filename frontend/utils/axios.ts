import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Type for failed request handling
interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

// Create an Axios instance
const instance = axios.create({
  baseURL: "http://localhost/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// Helper function to retry queued requests after token refresh
const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor to handle refresh token logic
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if the error is related to authentication and avoid retry loops
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark the request as retry to prevent loops

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Call the refresh token API
          const { data } = await instance.get(
            "/user-service/auth/refresh-token",
          );

          // Assuming the backend sets a new access token as a cookie
          isRefreshing = false;
          processQueue(null, data.accessToken);

          // Retry the original request with the new token
          return instance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError as AxiosError, null);

          try {
            // Call the logout API to clear the cookies
            await instance.post("/user-service/auth/logout");
          } catch (logoutError) {
            console.error("Logout failed:", logoutError);
          }
          window.location.href = "/";

          return Promise.reject(refreshError);
        }
      }

      // If refreshing is in progress, queue the failed requests
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    return Promise.reject(error);
  },
);

export default instance;
