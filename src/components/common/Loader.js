import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { COLORS } from "../../utils/constants";

const quotes = [
  "Good things take time… ⏳",
  "Patience is a form of wisdom.",
  "Loading magic… ✨",
  "Greatness is on its way!",
  "Dreams don’t rush…",
  "Almost there… 🚀",
  "Your screen is waking up… ☕",
];

const Loader = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const [quoteIndex, setQuoteIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animate the dots
  useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, [dot1, dot2, dot3]);

  // Animate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Change quote
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // change every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.loaderContainer}>
      <View style={styles.loader}>
        <Animated.View
          style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
        />
        <Animated.View
          style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
        />
        <Animated.View
          style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
        />
      </View>
      <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
        {quotes[quoteIndex]}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light,
  },
  loader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 60,
    marginBottom: 20,
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 200,
  },
});

export default Loader;
