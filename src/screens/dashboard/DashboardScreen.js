import { useIsFocused } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Loader from "../../components/common/Loader";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { API_ENDPOINTS, COLORS, SIZES } from "../../utils/constants";

const DashboardScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { user, logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    birthdays: [],
    companyNews: [],
    leaveAllocation: [],
    recentActivities: [],
    userDesignation: "",
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadDashboardData();
    }
  }, [isFocused]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD);
      const apiData = response.data;

      setTimeout(() => {
        setDashboardData({
          // Maps weeklyBDay array to birthdays
          birthdays: (apiData.weeklyBDay || []).map((birthday) => ({
            name: birthday.EmpName.split(" - ")[0] || "N/A",
            empId: birthday.EmpName.split(" - ")[1] || "N/A",
            date: birthday.DOB || "",
          })),

          // Maps comNews array to companyNews
          companyNews: (apiData.comNews || []).map((news) => ({
            company: news.ComName || "Company",
            news: news.News || "N/A",
            date: news.CreateDate || "",
          })),

          // Maps leaAlloc array to leaveAllocation
          leaveAllocation: (apiData.leaAlloc || []).map((leave) => ({
            type: leave.TypeOfLeave || "N/A",
            pending: parseFloat(leave.Pending) || 0,
            used: parseFloat(leave.Used) || 0,
            available: parseFloat(leave.Balance) || 0,
            total: parseFloat(leave.AnnualAllocation) || 0,
          })),

          // Maps recActivity array to recentActivities
          recentActivities: (apiData.recActivity || [])
            .slice(0, 5)
            .map((activity) => ({
              id: activity.ReqIdx,
              type: activity.ReqTypeDate.split("<br/>")[0],
              date: activity.CreateDate.split(" ")[0],
              status: activity.ReqStatName,
              reqNo: activity.ReqNo,
            })),
          userDesignation: apiData.userName[0].Designation,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Logout",
            onPress: () => logout(),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    } else {
      // Fallback to custom modal
      setShowLogoutModal(true);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const menuItems = [
    {
      id: 1,
      title: "Time Sheet",
      icon: "📊",
      color: "#3b82f6",
      screen: "Timesheet",
    },
    {
      id: 2,
      title: "Leave Request",
      icon: "✈️",
      color: "#22c55e",
      screen: "LeaveRequest",
    },
    {
      id: 3,
      title: "My Profile",
      icon: "👤",
      color: "#f59e0b",
      screen: null,
    },
    {
      id: 4,
      title: "Settings",
      icon: "⚙️",
      color: "#6b7280",
      screen: null,
    },
  ];

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      Alert.alert(
        "Coming Soon",
        `${item.title} feature will be available soon`
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActivityBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return styles.activityBadgeApproved;
      case "cancelled":
        return styles.activityBadgeCancelled;
      case "confirmed":
        return styles.activityBadgeConfirmed;
      case "pending":
        return styles.activityBadgePending;
      default:
        return styles.activityBadgeDefault;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || "U"}
              </Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userRole}>
            {dashboardData.userDesignation || "Employee"}
          </Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickActionCard}
              onPress={() => handleMenuPress(item)}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: item.color },
                ]}
              >
                <Text style={styles.quickActionEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.quickActionTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Birthdays */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎂 Weekly Birthdays</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {dashboardData.birthdays.length > 0 ? (
              dashboardData.birthdays.map((birthday) => (
                <View
                  key={`${birthday.name}-${birthday.date}`}
                  style={styles.birthdayCard}
                >
                  <View style={styles.birthdayCardAvatar}>
                    <Text style={styles.birthdayCardAvatarText}>
                      {birthday.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.birthdayCardName} numberOfLines={2}>
                    {birthday.name}
                  </Text>
                  <Text style={styles.birthdayCardEmpId}>
                    EPF No: {birthday.empId}
                  </Text>
                  <View style={styles.birthdayCardDateBadge}>
                    <Text style={styles.birthdayCardDate}>
                      {formatDate(birthday.date)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No birthdays this week</Text>
            )}
          </ScrollView>
        </View>

        {/* Company News */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Company News</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {dashboardData.companyNews.length > 0 ? (
              dashboardData.companyNews.map((news) => (
                <View
                  key={`${news.company}-${news.date}-${news.news}`}
                  style={styles.newsCard}
                >
                  <View style={styles.newsCardIconContainer}>
                    <Text style={styles.newsCardIcon}>📢</Text>
                  </View>
                  <Text style={styles.newsCardCompany}>{news.company}</Text>
                  <Text style={styles.newsCardTitle} numberOfLines={2}>
                    {news.news}
                  </Text>
                  <Text style={styles.newsCardDate}>
                    {formatDate(news.date)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent news</Text>
            )}
          </ScrollView>
        </View>

        {/* Leave Allocation Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Leave Allocation</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaveChartContainer}>
            {dashboardData.leaveAllocation.map((leave, index) => {
              const usedPercentage = (leave.used / leave.total) * 100;
              const pendingPercentage = (leave.pending / leave.total) * 100;
              const availablePercentage = (leave.available / leave.total) * 100;

              return (
                <View key={index} style={styles.leaveChartItem}>
                  <Text style={styles.leaveType}>{leave.type}</Text>
                  <View style={styles.leaveBar}>
                    {leave.pending > 0 && (
                      <View
                        style={[
                          styles.leaveBarSegment,
                          {
                            width: `${pendingPercentage}%`,
                            backgroundColor: "#3b82f6",
                          },
                        ]}
                      />
                    )}
                    {leave.used > 0 && (
                      <View
                        style={[
                          styles.leaveBarSegment,
                          {
                            width: `${usedPercentage}%`,
                            backgroundColor: "#ef4444",
                          },
                        ]}
                      />
                    )}
                    {leave.available > 0 && (
                      <View
                        style={[
                          styles.leaveBarSegment,
                          {
                            width: `${availablePercentage}%`,
                            backgroundColor: "#7cb342",
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.leaveStats}>
                    <Text style={styles.leaveStat}>
                      Pending:{" "}
                      <Text style={styles.leaveStatBold}>{leave.pending}</Text>
                    </Text>
                    <Text style={styles.leaveStat}>
                      Used:{" "}
                      <Text style={styles.leaveStatBold}>{leave.used}</Text>
                    </Text>
                    <Text style={styles.leaveStat}>
                      Available:{" "}
                      <Text style={styles.leaveStatBold}>
                        {leave.available}
                      </Text>
                    </Text>
                    <Text style={styles.leaveStat}>
                      Total:{" "}
                      <Text style={styles.leaveStatBold}>{leave.total}</Text>
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.leaveLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#3b82f6" }]}
              />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#ef4444" }]}
              />
              <Text style={styles.legendText}>Used</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#7cb342" }]}
              />
              <Text style={styles.legendText}>Available</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ Recent Activities</Text>
          </View>
          {dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityType}>{activity.type}</Text>
                  <Text style={styles.activityDate}>
                    Create Date: {activity.date}
                  </Text>
                </View>
                <View
                  style={[
                    styles.activityBadge,
                    getActivityBadgeStyle(activity.status),
                  ]}
                >
                  <Text style={styles.activityBadgeText}>
                    {activity.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activities</Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Aviorsys HRMS v1.0</Text>
        </View>
      </ScrollView>

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white + "50",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.white + "CC",
    marginBottom: SIZES.xs,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SIZES.xs,
    textAlign: "center",
  },
  userRole: {
    fontSize: 14,
    color: COLORS.white + "CC",
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SIZES.md,
    marginTop: -SIZES.xl,
    gap: SIZES.md,
  },
  quickActionCard: {
    width: "47%",
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    marginTop: SIZES.lg,
    borderRadius: 12,
    padding: SIZES.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  horizontalScrollContent: {
    paddingRight: SIZES.md,
  },
  birthdayCard: {
    width: 140,
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: SIZES.md,
    marginRight: SIZES.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  birthdayCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#7cb342",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  birthdayCardAvatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
  },
  birthdayCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SIZES.xs,
    height: 34,
  },
  birthdayCardEmpId: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: SIZES.sm,
  },
  birthdayCardDateBadge: {
    backgroundColor: "#7cb342",
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  birthdayCardDate: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
  },
  newsCard: {
    width: 200,
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: SIZES.md,
    marginRight: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  newsCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  newsCardIcon: {
    fontSize: 20,
  },
  newsCardCompany: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: SIZES.xs,
  },
  newsCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
    height: 34,
  },
  newsCardDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  birthdayItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  birthdayAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7cb342",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
  },
  birthdayAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  birthdayInfo: {
    flex: 1,
  },
  birthdayName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  birthdayEmpId: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  birthdayDateBadge: {
    backgroundColor: "#7cb342",
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  birthdayDate: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
  },
  newsItem: {
    flexDirection: "row",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  newsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
  },
  newsIcon: {
    fontSize: 20,
  },
  newsContent: {
    flex: 1,
  },
  newsCompany: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  newsDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  leaveChartContainer: {
    marginVertical: SIZES.sm,
  },
  leaveChartItem: {
    marginBottom: SIZES.lg,
  },
  leaveType: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  leaveBar: {
    flexDirection: "row",
    height: 24,
    backgroundColor: COLORS.light,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: SIZES.sm,
  },
  leaveBarSegment: {
    height: "100%",
  },
  leaveStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leaveStat: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  leaveStatBold: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  leaveLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.md,
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.xs,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.md,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  activityBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.light,
  },
  activityBadgeDefault: {
    backgroundColor: COLORS.light,
  },
  activityBadgeApproved: {
    backgroundColor: "#22c55e",
  },
  activityBadgeCancelled: {
    backgroundColor: "#ef4444",
  },
  activityBadgeConfirmed: {
    backgroundColor: "#ec4899",
  },
  activityBadgePending: {
    backgroundColor: "#f59e0b",
  },
  activityBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.white,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    paddingVertical: SIZES.lg,
  },
  logoutButton: {
    margin: SIZES.md,
    marginTop: SIZES.lg,
    backgroundColor: COLORS.danger,
    padding: SIZES.md,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    padding: SIZES.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default DashboardScreen;
