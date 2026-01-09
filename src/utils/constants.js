// Update this with your actual backend API URL
export const API_BASE_URL =
  "https://richard-unpoled-saddeningly.ngrok-free.dev/api";

export const API_ENDPOINTS = {
  //auth
  LOGIN: "/login/authenticate",
  LOGOUT: "/auth/logout",
  //dashboard
  DASHBOARD: "/EssDashboard/EssDBoard",
  // leave request form
  LEAVE_REQUEST_INIT_DATA: "/AttAndLeaveReq/GetInitialData",
  CALCULATE_NO_OF_DAYS: "/AttAndLeaveReq/CalNoOfDays",
  SUBMIT_LEAVE_REQUEST: "/AttAndLeaveReq/SaveLeaveReq",
  // time sheet
  TIMESHEET: "/timesheet",
  LEAVE_HISTORY: "/leave/history",
};

export const COLORS = {
  primary: "#1e3c72",
  secondary: "#2a5298",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  light: "#f9fafb",
  dark: "#1e293b",
  white: "#ffffff",
  border: "#e5e7eb",
  text: "#374151",
  textLight: "#6b7280",
};

export const SIZES = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};
