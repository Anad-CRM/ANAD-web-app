import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ------------------ */
/* Validation Utils */
/* ------------------ */

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
}

/* ------------------ */
/* Axios Instance */
/* ------------------ */

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* Attach token automatically */
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Normalize errors */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

/* ------------------ */
/* Auth Service */
/* ------------------ */

export const authService = {
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!isValidEmail(email)) {
      throw new Error("Invalid email address");
    }

    const res = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    return {
      token: res.data.data.token,
      user: res.data.data.user,
    };
  },

  async signup(formData: any) {
    if (!formData.email || !formData.password) {
      throw new Error("Required fields missing");
    }

    if (!isValidEmail(formData.email)) {
      throw new Error("Invalid email address");
    }

    validatePassword(formData.password);

    await axiosInstance.post("/auth/register", formData);
    return true;
  },

  async forgotPassword(email: string) {
    if (!email) {
      throw new Error("Email is required");
    }

    if (!isValidEmail(email)) {
      throw new Error("Invalid email address");
    }

    await axiosInstance.post("/auth/forgot-password", { email });
    return true;
  },

  async verifyOtp(email: string, otp: string) {
    if (!otp || otp.length !== 6) {
      throw new Error("OTP must be 6 digits");
    }

    await axiosInstance.post("/auth/verify-otp", {
      email,
      otp,
    });

    return true;
  },

  async resetPassword(password: string, confirmPassword: string) {
    if (!password || !confirmPassword) {
      throw new Error("Password fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    validatePassword(password);

    await axiosInstance.post("/auth/reset-password", {
      password,
      confirmPassword,
    });

    return true;
  },
};
