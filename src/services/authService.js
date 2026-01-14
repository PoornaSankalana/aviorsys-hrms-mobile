import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_ENDPOINTS } from "../utils/constants";
import api from "./api";

export const login = async (username, password) => {
  try {
    const response = await api.post(API_ENDPOINTS.LOGIN, {
      username,
      password,
    });

    // Adjust this based on your actual API response structure
    if (response.data && response.data.token) {
      const user = {
        name: response.data.name,
        empId: response.data.empId,
        userID: response.data.userID,
        userUniqueKey: response.data.userUniqueKey,
        permissionsCount: response.data.permissions?.Count ?? 0,
        isPrivacyStatus: response.data.isPrivacyStatus,
        isTempPassword: response.data.isTempPassword,
        authFlag: response.data.authFlag,
        smsFlag: response.data.smsFlag,
        qrCodeFlag: response.data.qrCodeFlag,
        setupCode: response.data.SetupCode,
      };
      return {
        success: true,
        token: response.data.token,
        user: user,
      };
    } else {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }
  } catch (error) {
    console.log(error);
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        message: error.response.data?.message || "Invalid credentials",
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    } else {
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  }
};

export const logout = async () => {
  try {
    // await api.post(API_ENDPOINTS.LOGOUT);
    if (Platform.OS !== "web") {
      await AsyncStorage.clear();
    } else {
      await localStorage.clear();
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};
