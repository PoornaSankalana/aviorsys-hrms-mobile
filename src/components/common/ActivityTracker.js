import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useRef } from "react";
import { AppState, PanResponder, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";

const ActivityTracker = ({ children }) => {
  const { recordActivity, isAuthenticated } = useContext(AuthContext);
  const navigation = useNavigation();
  const appStateRef = useRef(AppState.currentState);

  // Track navigation state changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = navigation.addListener("state", () => {
      // Navigation state changed (user navigated)
      recordActivity();
    });

    return unsubscribe;
  }, [navigation, isAuthenticated, recordActivity]);

  // Track app state changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came to foreground
        recordActivity();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, recordActivity]);

  // Track touch events using PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        if (isAuthenticated) {
          recordActivity();
        }
        return false; // Don't block touches, just track them
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default ActivityTracker;
