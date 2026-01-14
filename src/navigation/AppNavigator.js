import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useContext, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../utils/constants";

// Screens
import ActivityTracker from "../components/common/ActivityTracker";
import ConfirmationModal from "../components/common/ConfirmationModal";
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import LeaveRequestScreen from "../screens/leave/LeaveRequestScreen";
import TimeSheetScreen from "../screens/timesheet/TimeSheetScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator for authenticated users
const DrawerNavigator = () => {
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <ActivityTracker>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1e3c72",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 15, padding: 4 }}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          drawerActiveTintColor: "#1e3c72",
          drawerInactiveTintColor: "#6b7280",
        }}
      >
        <Drawer.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: "Dashboard",
          }}
        />
        <Drawer.Screen
          name="Timesheet"
          component={TimeSheetScreen}
          options={{
            title: "Time Sheet",
          }}
        />
        <Drawer.Screen
          name="LeaveRequest"
          component={LeaveRequestScreen}
          options={{
            title: "Leave Request",
          }}
        />
      </Drawer.Navigator>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmColor={COLORS.danger}
      />
    </ActivityTracker>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1e3c72" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
