import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  login as loginService,
  logout as logoutService,
} from "../services/authService";

export const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 10 minutes in milliseconds
const APP_CLOSE_CHECK_KEY = "appBackgroundTimestamp";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const inactivityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);
  const appStateSubscriptionRef = useRef(null);

  useEffect(() => {
    checkLoginStatus();
    setupAppStateListener();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startActivityTracking();
      resetInactivityTimer();
    } else {
      clearInactivityTimer();
    }
    return () => {
      clearInactivityTimer();
    };
  }, [isAuthenticated]);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("userData");
      const backgroundTimestamp = await AsyncStorage.getItem(
        APP_CLOSE_CHECK_KEY
      );

      if (token && userData) {
        // Check if app was killed
        // If backgroundTimestamp exists on app start, it means:
        // - App went to background (timestamp was set)
        // - App was then killed (timestamp wasn't cleared on resume)
        // So we should logout
        if (backgroundTimestamp) {
          // App was killed - clear auth data and logout
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("userData");
          await AsyncStorage.removeItem(APP_CLOSE_CHECK_KEY);
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Fresh app start or app resumed properly (timestamp was cleared)
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          // Record activity on app start
          recordActivity();
        }
      } else {
        // No auth data, ensure timestamp is cleared
        await AsyncStorage.removeItem(APP_CLOSE_CHECK_KEY);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await loginService(username, password);

      if (response.success) {
        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));
        // Don't set timestamp on login - it will be set when app goes to background
        setUser(response.user);
        setIsAuthenticated(true);
        recordActivity();
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      setIsAuthenticated(false);
      clearInactivityTimer();
      await AsyncStorage.removeItem(APP_CLOSE_CHECK_KEY);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const setupAppStateListener = () => {
    appStateSubscriptionRef.current = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
  };

  const handleAppStateChange = async (nextAppState) => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to the foreground
      await checkAppWasKilled();
      resetInactivityTimer();
    } else if (
      appStateRef.current === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has gone to the background
      await AsyncStorage.setItem(APP_CLOSE_CHECK_KEY, Date.now().toString());
      clearInactivityTimer();
    }
    appStateRef.current = nextAppState;
  };

  const checkAppWasKilled = async () => {
    try {
      const backgroundTimestamp = await AsyncStorage.getItem(
        APP_CLOSE_CHECK_KEY
      );
      if (backgroundTimestamp && isAuthenticated) {
        // App resumed from background properly, clear the timestamp
        await AsyncStorage.removeItem(APP_CLOSE_CHECK_KEY);
      }
      // Note: Kill detection is handled in checkLoginStatus on app start
    } catch (error) {
      console.error("Error checking app kill status:", error);
    }
  };

  const startActivityTracking = () => {
    // Track user activity through touch events
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      resetInactivityTimer();
    };

    // Listen to global touch events
    // Note: In React Native, we'll track activity through navigation and screen focus
    // This will be handled by the ActivityTracker component
  };

  const resetInactivityTimer = () => {
    clearInactivityTimer();
    if (isAuthenticated) {
      inactivityTimerRef.current = setTimeout(() => {
        handleInactivityTimeout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const handleInactivityTimeout = async () => {
    if (isAuthenticated) {
      console.log("Auto-logout due to inactivity");
      await logout();
    }
  };

  const recordActivity = () => {
    lastActivityRef.current = Date.now();
    resetInactivityTimer();
  };

  const cleanup = () => {
    clearInactivityTimer();
    if (appStateSubscriptionRef.current) {
      appStateSubscriptionRef.current.remove();
      appStateSubscriptionRef.current = null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        recordActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
