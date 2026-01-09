import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { COLORS, SIZES } from "../../utils/constants";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Login Failed", result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          {/* <Text style={styles.subtitle}>Human Resource Management</Text> */}
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>User Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SIZES.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.xxl,
  },
  logoPlaceholder: {
    width: 300,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.xxs,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: -10,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.lg,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    paddingHorizontal: SIZES.md,
  },
  eyeIconText: {
    fontSize: 20,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SIZES.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#7cb342",
    paddingVertical: SIZES.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SIZES.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
