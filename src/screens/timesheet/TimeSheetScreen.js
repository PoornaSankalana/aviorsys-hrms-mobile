import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SIZES } from "../../utils/constants";

const TimesheetScreen = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2026");

  // Placeholder data - will be fetched from API
  const timesheetData = [];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time Sheet</Text>
        <Text style={styles.headerSubtitle}>View your attendance records</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Year</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>{selectedYear}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Month</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>{selectedMonth}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.loadButton}>
          <Text style={styles.loadButtonText}>Load</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#7cb342" }]} />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Absent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.legendText}>Holiday</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#9ca3af" }]} />
          <Text style={styles.legendText}>Weekend</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading timesheet...</Text>
          </View>
        ) : timesheetData.length > 0 ? (
          <View style={styles.timesheetContainer}>
            {/* Timesheet entries will go here */}
            {timesheetData.map((entry, index) => (
              <View key={index} style={styles.timesheetRow}>
                <Text>{entry.date}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptyText}>
              Select a month and year, then click Load to view your timesheet
            </Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ How to use</Text>
        <Text style={styles.infoText}>
          1. Select the year and month from dropdowns{"\n"}
          2. Click the "Load" button to fetch your timesheet{"\n"}
          3. View your attendance records with color-coded status
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.lg,
    paddingTop: SIZES.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white + "CC",
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    padding: SIZES.md,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: {
    flexDirection: "row",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.light,
  },
  filterButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  loadButton: {
    backgroundColor: "#3b82f6",
    padding: SIZES.md,
    borderRadius: 8,
    alignItems: "center",
  },
  loadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SIZES.md,
    gap: SIZES.md,
    marginBottom: SIZES.md,
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
  contentContainer: {
    margin: SIZES.md,
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.xxl,
    borderRadius: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textLight,
  },
  timesheetContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.md,
  },
  timesheetRow: {
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.xxl,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#e0f2fe",
    margin: SIZES.md,
    padding: SIZES.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0284c7",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default TimesheetScreen;
