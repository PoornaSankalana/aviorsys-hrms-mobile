import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import DropdownModal from "../../components/common/DropdownModal";
import api from "../../services/api";
import { API_ENDPOINTS, COLORS, SIZES } from "../../utils/constants";

// Optional: Configure calendar locale
LocaleConfig.locales["en"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
LocaleConfig.defaultLocale = "en";

const TimesheetScreen = () => {
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [Years, setYears] = useState([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [timesheetData, setTimesheetData] = useState([]);
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'list'
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateDetails, setShowDateDetails] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getMonthDateRange = (year, month) => {
    const monthIndex = months.indexOf(month);
    const firstDate = new Date(year, monthIndex, 1);
    const lastDate = new Date(year, monthIndex + 1, 0);
    return {
      firstDate: firstDate.toISOString().split("T")[0],
      lastDate: lastDate.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    if (isFocused) {
      const today = new Date();
      setSelectedYear(today.getFullYear().toString());
      setSelectedMonth(months[today.getMonth()]);
      getInitData();
      loadTimesheet();
    }
  }, [isFocused]);

  const getInitData = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_YEARS);
      setYears(response.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const loadTimesheet = async () => {
    const { firstDate, lastDate } = getMonthDateRange(
      selectedYear,
      selectedMonth
    );

    // Validation: Check if selected month is in the future
    const today = new Date();
    const selectedMonthIndex = months.indexOf(selectedMonth);
    const selectedDate = new Date(
      parseInt(selectedYear),
      selectedMonthIndex,
      1
    );

    // Set to first day of current month for comparison
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (selectedDate > currentMonthStart) {
      Alert.alert(
        "Error",
        "Cannot load timesheet for future months. Please select current or past month.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.TIMESHEET, {
        params: { startDate: firstDate, endDate: lastDate },
      });
      setTimesheetData(response.data);
      prepareCalendarData(response.data);
    } catch (error) {
      console.error("Error loading timesheet:", error);
      setTimesheetData([]);
      setMarkedDates({});
      Alert.alert("Error", "Failed to load timesheet. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const prepareCalendarData = (data) => {
    const marked = {};

    data.forEach((day) => {
      if (!day.Date) return;

      // Ensure date is in YYYY-MM-DD format
      const dateStr = day.Date;

      // Determine color based on status
      let dotColor = "#D1D5DB"; // Default gray

      if (day.LeaveAmount != 0) {
        dotColor = "#F59E0B"; // Orange for leave
      } else if (day.DayTitle === "Saturday") {
        dotColor = "#9CA3AF"; // Gray for Saturday
      } else if (day.DayTitle === "Sunday") {
        dotColor = "#C5CAE9"; // Light blue for Sunday
      } else if (day.IsHoliDay) {
        dotColor = "#FBBF24"; // Yellow for holiday
      } else if (day.PrAb === "Ab") {
        dotColor = "#EF4444"; // Red for absent
      } else if (day.PrAb === "Pr") {
        dotColor = "#10B981"; // Green for present
      }

      // Create the marked date configuration
      marked[dateStr] = {
        selected: true,
        selectedColor: dotColor,
        selectedTextColor: "#FFFFFF",
        // Add custom styles
        customStyles: {
          container: {
            backgroundColor: dotColor,
            borderRadius: 20,
          },
          text: {
            color: "#FFFFFF",
            fontWeight: "bold",
          },
        },
        // Store the day data for details
        dayData: {
          Date: day.Date || dateStr,
          DayTitle:
            day.DayTitle ||
            new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" }),
          PrAb: day.PrAb || "N/A",
          InTime: day.InTime || "-",
          OutTime: day.OutTime || "-",
          LateMinutes: day.LateMinutes || "0",
          EarlyDepatureMinutes: day.EarlyDepatureMinutes || "0",
          LeaveType: day.LeaveType || "N/A",
          LeaveAmount: day.LeaveAmount || "0",
          LeaveStatus: day.LeaveStatus || "N/A",
          RequestType: day.RequestType || "-",
          PayrollCategory: day.PayrollCategory || "-",
          UnitName: day.UnitName || "-",
          IsHoliDay: day.IsHoliDay || false,
        },
      };
    });

    setMarkedDates(marked);
  };

  const getDayColor = (day) => {
    if (day.LeaveAmount != 0) return "#FFE0B2";
    if (day.DayTitle === "Saturday") return "#E0F7FA";
    if (day.DayTitle === "Sunday") return "#E8EAF6";
    if (day.IsHoliDay) return "#FFF59D";
    if (day.PrAb === "Ab") return "#FFCDD2";
    if (day.PrAb === "Pr") return "#C8E6C9";
    return "#FFF";
  };

  const handleDayPress = (day) => {
    const dateStr = day.dateString;
    const markedDay = markedDates[dateStr];

    if (markedDay && markedDay.dayData) {
      setSelectedDate(markedDay.dayData);
      setShowDateDetails(true);
    } else {
      // Show minimal info for days without data
      setSelectedDate({
        Date: dateStr,
        DayTitle: new Date(dateStr).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        PrAb: "N/A",
        InTime: "-",
        OutTime: "-",
        LateMinutes: "0",
        EarlyDepatureMinutes: "0",
        LeaveType: "N/A",
        LeaveAmount: "0",
        LeaveStatus: "N/A",
        RequestType: "-",
        PayrollCategory: "-",
        UnitName: "-",
        IsHoliDay: false,
      });
      setShowDateDetails(true);
    }
  };

  const getCalendarTheme = () => ({
    backgroundColor: "#ffffff",
    calendarBackground: "#ffffff",
    textSectionTitleColor: "#6B7280",
    selectedDayBackgroundColor: COLORS.primary,
    selectedDayTextColor: "#ffffff",
    todayTextColor: COLORS.primary,
    dayTextColor: "#374151",
    textDisabledColor: "#D1D5DB",
    dotColor: COLORS.primary,
    selectedDotColor: "#ffffff",
    arrowColor: COLORS.primary,
    monthTextColor: COLORS.text,
    textDayFontWeight: "400",
    textMonthFontWeight: "bold",
    textDayHeaderFontWeight: "500",
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
    "stylesheet.calendar.header": {
      week: {
        marginTop: 7,
        flexDirection: "row",
        justifyContent: "space-around",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 10,
        marginHorizontal: 10,
      },
    },
  });

  // Format date for display (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Get day details for popup
  const DateDetailsModal = () => {
    if (!showDateDetails) return null;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDateDetails}
        onRequestClose={() => setShowDateDetails(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDateDetails(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dateDetailsContainer}>
                {selectedDate ? (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        {selectedDate?.DayTitle},{" "}
                        {formatDate(selectedDate?.Date)}
                      </Text>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowDateDetails(false)}
                      >
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.detailsContent}>
                      {/* Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getDayColor(selectedDate) },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {selectedDate?.PrAb === "Pr"
                            ? "Present"
                            : selectedDate?.PrAb === "Ab"
                            ? "Absent"
                            : selectedDate?.IsHoliDay
                            ? "Holiday"
                            : selectedDate?.LeaveType !== "N/A"
                            ? selectedDate?.LeaveType
                            : "No Record"}
                        </Text>
                      </View>

                      {/* Attendance Details */}
                      <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Attendance</Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Status:</Text>
                          <Text
                            style={[
                              styles.detailValue,
                              selectedDate?.PrAb === "Pr"
                                ? styles.presentText
                                : selectedDate?.PrAb === "Ab"
                                ? styles.absentText
                                : styles.neutralText,
                            ]}
                          >
                            {selectedDate?.PrAb || "-"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Check In:</Text>
                          <Text style={styles.detailValue}>
                            {selectedDate?.InTime || "-"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Check Out:</Text>
                          <Text style={styles.detailValue}>
                            {selectedDate?.OutTime || "-"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Late Minutes:</Text>
                          <Text
                            style={[
                              styles.detailValue,
                              selectedDate?.LateMinutes &&
                              parseInt(selectedDate.LateMinutes) > 0
                                ? styles.lateText
                                : {},
                            ]}
                          >
                            {selectedDate?.LateMinutes || "0"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Early Departure:
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedDate?.EarlyDepatureMinutes || "0"}
                          </Text>
                        </View>
                      </View>

                      {/* Leave Details (if applicable) */}
                      {selectedDate?.LeaveType &&
                        selectedDate.LeaveType !== "N/A" && (
                          <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>
                              Leave Information
                            </Text>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Type:</Text>
                              <Text style={styles.detailValue}>
                                {selectedDate?.LeaveType}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Amount:</Text>
                              <Text style={styles.detailValue}>
                                {selectedDate?.LeaveAmount || "0"}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Status:</Text>
                              <Text
                                style={[
                                  styles.detailValue,
                                  selectedDate?.LeaveStatus === "Pending"
                                    ? styles.pendingText
                                    : selectedDate?.LeaveStatus === "Approved"
                                    ? styles.approvedText
                                    : {},
                                ]}
                              >
                                {selectedDate?.LeaveStatus !== "N/A"
                                  ? selectedDate.LeaveStatus
                                  : "-"}
                              </Text>
                            </View>
                            {selectedDate?.RequestType &&
                              selectedDate.RequestType !== " - " && (
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>
                                    Request Type:
                                  </Text>
                                  <Text style={styles.detailValue}>
                                    {selectedDate?.RequestType}
                                  </Text>
                                </View>
                              )}
                          </View>
                        )}

                      {/* Additional Info */}
                      {/* <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>
                          Additional Information
                        </Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Payroll Category:
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedDate?.PayrollCategory || "-"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Unit:</Text>
                          <Text style={styles.detailValue}>
                            {selectedDate?.UnitName || "-"}
                          </Text>
                        </View>
                      </View> */}
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyModalContent}>
                    <Text style={styles.emptyModalTitle}>
                      No Data Available
                    </Text>
                    <Text style={styles.emptyModalText}>
                      No attendance data found for this date.
                    </Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowDateDetails(false)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

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
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowYearModal(true)}
            >
              <Text style={styles.filterButtonText}>{selectedYear}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Month</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowMonthModal(true)}
            >
              <Text style={styles.filterButtonText}>{selectedMonth}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewToggleContainer}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "calendar" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("calendar")}
            >
              <Text
                style={[
                  styles.viewToggleButtonText,
                  viewMode === "calendar" && styles.viewToggleButtonTextActive,
                ]}
              >
                📅 Calendar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "list" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("list")}
            >
              <Text
                style={[
                  styles.viewToggleButtonText,
                  viewMode === "list" && styles.viewToggleButtonTextActive,
                ]}
              >
                📋 List
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loadButton} onPress={loadTimesheet}>
          <Text style={styles.loadButtonText}>Load</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modals */}
      <DropdownModal
        visible={showYearModal}
        onClose={() => setShowYearModal(false)}
        title="Select Year"
        data={Years.map((m, idx) => ({ Year: m, idx }))}
        displayKey="Year"
        valueKey="Year"
        onSelect={(item) => {
          setSelectedYear(item.Year);
          setShowYearModal(false);
        }}
      />
      <DropdownModal
        visible={showMonthModal}
        onClose={() => setShowMonthModal(false)}
        title="Select Month"
        data={months.map((m, idx) => ({ Month: m, idx }))}
        displayKey="Month"
        valueKey="idx"
        onSelect={(item) => {
          setSelectedMonth(item.Month);
          setShowMonthModal(false);
        }}
      />

      {/* Legend */}
      <View style={styles.legendContainer}>
        {viewMode === "calendar" ? (
          // Calendar View Legend (Darker colors for selected dates)
          <>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#10B981" }]}
              />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
              />
              <Text style={styles.legendText}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FBBF24" }]}
              />
              <Text style={styles.legendText}>Holiday</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#F59E0B" }]}
              />
              <Text style={styles.legendText}>Leave</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#9CA3AF" }]}
              />
              <Text style={styles.legendText}>Saturday</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#C5CAE9" }]}
              />
              <Text style={styles.legendText}>Sunday</Text>
            </View>
          </>
        ) : (
          // List View Legend (Light colors for backgrounds)
          <>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#C8E6C9" }]}
              />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FFCDD2" }]}
              />
              <Text style={styles.legendText}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FFF59D" }]}
              />
              <Text style={styles.legendText}>Holiday</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FFE0B2" }]}
              />
              <Text style={styles.legendText}>Leave</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#E0F7FA" }]}
              />
              <Text style={styles.legendText}>Saturday</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#E8EAF6" }]}
              />
              <Text style={styles.legendText}>Sunday</Text>
            </View>
          </>
        )}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading timesheet...</Text>
          </View>
        ) : timesheetData.length > 0 ? (
          viewMode === "calendar" ? (
            // Calendar View
            <View style={styles.calendarContainer}>
              <Calendar
                current={`${selectedYear}-${String(
                  months.indexOf(selectedMonth) + 1
                ).padStart(2, "0")}-01`}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                markingType={"custom"}
                theme={getCalendarTheme()}
                style={styles.calendar}
                hideExtraDays={true}
                firstDay={1}
                enableSwipeMonths={false}
                renderArrow={() => null}
                disableMonthChange={true}
              />

              {/* Stats Summary */}
              {/* <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {timesheetData.filter((d) => d.PrAb === "Pr").length}
                  </Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {timesheetData.filter((d) => d.PrAb === "Ab").length}
                  </Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {timesheetData.filter((d) => d.LeaveType !== "N/A").length}
                  </Text>
                  <Text style={styles.statLabel}>Leaves</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {timesheetData.filter((d) => d.IsHoliDay).length}
                  </Text>
                  <Text style={styles.statLabel}>Holidays</Text>
                </View>
              </View> */}
            </View>
          ) : (
            // List View (existing table view - keep your original table code here)
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Your existing table code */}
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { width: 90 }]}>Date</Text>
                  <Text style={[styles.tableCell, { width: 90 }]}>Day</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>Status</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>In</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>Out</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>Late</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>Early</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>
                    Leave Type
                  </Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>
                    Leave Amount
                  </Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>
                    Leave Status
                  </Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>
                    Request Type
                  </Text>
                </View>
                {timesheetData.map((day, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.tableRow,
                      { backgroundColor: getDayColor(day) },
                    ]}
                  >
                    <Text style={[styles.tableCell, { width: 90 }]}>
                      {day.Date}
                    </Text>
                    <Text style={[styles.tableCell, { width: 90 }]}>
                      {day.DayTitle}
                    </Text>
                    <Text style={[styles.tableCell, { width: 70 }]}>
                      {day.PrAb}
                    </Text>
                    <Text style={[styles.tableCell, { width: 70 }]}>
                      {day.InTime || "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: 70 }]}>
                      {day.OutTime || "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: 70 }]}>
                      {day.LateMinutes || 0}
                    </Text>
                    <Text style={[styles.tableCell, { width: 80 }]}>
                      {day.EarlyDepatureMinutes || 0}
                    </Text>
                    <Text style={[styles.tableCell, { width: 100 }]}>
                      {day.LeaveType !== "N/A" ? day.LeaveType : "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: 100 }]}>
                      {day.LeaveAmount !== undefined ? day.LeaveAmount : "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: 100 }]}>
                      {day.LeaveStatus !== "N/A" ? day.LeaveStatus : "-"}
                    </Text>
                    <Text style={[styles.tableCell, { width: 100 }]}>
                      {day.RequestType && day.RequestType !== " - "
                        ? day.RequestType
                        : "-"}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )
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
          1. Select year and month, then click Load{"\n"}
          2. View calendar with color-coded attendance{"\n"}
          3. Tap any date to see detailed information{"\n"}
          4. Switch between Calendar and List views
        </Text>
      </View>

      {/* Date Details Modal */}
      <DateDetailsModal />
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

  // View Toggle Styles
  viewToggleContainer: {
    marginBottom: SIZES.md,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  viewToggleButtonText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  viewToggleButtonTextActive: {
    color: COLORS.white,
    fontWeight: "bold",
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
    alignItems: "center",
    justifyContent: "center",
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
    minHeight: 400,
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

  // Calendar Styles
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: SIZES.md,
  },

  // Stats Styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    padding: SIZES.md,
    borderRadius: 12,
    marginTop: SIZES.md,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.lg,
  },
  dateDetailsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    padding: SIZES.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  detailsContent: {
    // flex: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 20,
    marginBottom: SIZES.lg,
  },
  statusBadgeText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 14,
  },
  detailSection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.md,
    paddingBottom: SIZES.xs,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },

  // Color styles for text
  presentText: {
    color: "#10B981",
    fontWeight: "bold",
  },
  absentText: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  neutralText: {
    color: "#6B7280",
  },
  pendingText: {
    color: "#F59E0B",
    fontWeight: "bold",
  },
  approvedText: {
    color: "#10B981",
    fontWeight: "bold",
  },
  lateText: {
    color: "#EF4444",
    fontWeight: "bold",
  },

  // Existing table styles (keep these for list view)
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderRadius: 0,
    marginVertical: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tableCell: {
    fontSize: 14,
    paddingHorizontal: 5,
    color: COLORS.text,
    textAlign: "center",
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
