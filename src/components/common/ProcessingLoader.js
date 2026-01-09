import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../utils/constants";

const ProcessingLoader = ({ visible = false, message = "Processing..." }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Spinning animation
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible, spinValue]);

  // Scale animation for center circle
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, scaleValue]);

  // Pulse animation for outer ring
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          {/* Outer pulsing ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{ scale: pulseValue }],
                opacity: pulseValue.interpolate({
                  inputRange: [1, 1.3],
                  outputRange: [0.3, 0.1],
                }),
              },
            ]}
          />

          {/* Spinning ring */}
          <Animated.View
            style={[
              styles.spinnerRing,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={styles.spinnerSegment} />
          </Animated.View>

          {/* Center circle with scale animation */}
          <Animated.View
            style={[
              styles.centerCircle,
              {
                transform: [{ scale: scaleValue }],
              },
            ]}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  outerRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
  },
  spinnerRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
  },
  spinnerSegment: {
    width: "100%",
    height: "100%",
  },
  centerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  checkmark: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: "bold",
  },
  message: {
    position: "absolute",
    bottom: -40,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ProcessingLoader;
