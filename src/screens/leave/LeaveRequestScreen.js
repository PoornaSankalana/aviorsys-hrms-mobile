import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropdownModal from "../../components/common/DropdownModal";
import Loader from "../../components/common/Loader";
import ProcessingLoader from "../../components/common/ProcessingLoader";
import api from "../../services/api";
import { API_ENDPOINTS, COLORS, SIZES } from "../../utils/constants";

const LeaveRequestScreen = () => {
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    YearName: "",
    Year: 0,
    leaveType: "",
    leaveTypeIdx: null,
    startDate: "",
    endDate: "",
    startTime: "",
    startTimeIdx: "",
    endTime: "",
    endTimeIdx: "",
    numberOfDays: "",
    reason: "",
    coveringPerson: "",
    coveringPersonIdx: null,
    confirmingOfficer: "",
    confirmingOfficerIdx: null,
    reportingOfficer: "",
    reportingOfficerIdx: null,
    postReportingOfficer: "",
    postReportingOfficerIdx: null,
  });
  const [initData, setInitData] = useState({
    initData: [],
    confOfficer: [],
    cvrPerson: [],
    leaveSTime: [],
    leaveTime: [],
    leaveTypes: [],
    leaveYears: [],
    postRepOfficer: [],
    prefix: [],
    repOfficer: [],
    yrs: [],
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Modal states for dropdowns
  const [showYearModal, setShowYearModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);
  const [showCoveringPersonModal, setShowCoveringPersonModal] = useState(false);
  const [showConfirmingOfficerModal, setShowConfirmingOfficerModal] =
    useState(false);

  useEffect(() => {
    if (isFocused) {
      LoadIntialData();
      handleReset(true);
    }
  }, [isFocused]);

  // useEffect(() => {
  //   console.log("Form Data: ", initData.allocTbl);
  // }, [formData]);

  useEffect(() => {
    if (formData.endTimeIdx) {
      calculateNumberOfDays();
    }
  }, [formData.endTimeIdx]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        handleReset(true);
      };
    }, [])
  );

  const LoadIntialData = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.LEAVE_REQUEST_INIT_DATA);
      setInitData(response.data);

      // Find the year with maximum MstrYearsIdx
      if (response.data.leaveYears && response.data.leaveYears.length > 0) {
        let latestYear = response.data.leaveYears[0];
        let maxIdx = parseInt(latestYear.MstrYearsIdx);

        response.data.leaveYears.forEach((year) => {
          const currentIdx = parseInt(year.MstrYearsIdx);
          if (currentIdx > maxIdx) {
            maxIdx = currentIdx;
            latestYear = year;
          }
        });

        setFormData((prev) => ({
          ...prev,
          YearName: latestYear.Year,
          Year: parseInt(latestYear.MstrYearsIdx),
        }));
      }

      // Set default reporting officers if available
      if (response.data.repOfficer && response.data.repOfficer.length > 0) {
        const defaultOfficer = response.data.repOfficer[0];
        setFormData((prev) => ({
          ...prev,
          reportingOfficer: defaultOfficer.FullName,
          reportingOfficerIdx: defaultOfficer.EmployeeIdx,
        }));
      }

      if (
        response.data.postRepOfficer &&
        response.data.postRepOfficer.length > 0
      ) {
        const defaultPostOfficer = response.data.postRepOfficer[0];
        setFormData((prev) => ({
          ...prev,
          postReportingOfficer: defaultPostOfficer.FullName,
          postReportingOfficerIdx: defaultPostOfficer.EmployeeIdx,
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.leaveType) {
      Alert.alert("Error", "Please select a leave type");
      return;
    }
    if (!formData.startDate) {
      Alert.alert("Error", "Please select start date");
      return;
    }
    if (!formData.startTime) {
      Alert.alert("Error", "Please select start time");
      return;
    }
    if (!formData.endDate) {
      Alert.alert("Error", "Please select end date");
      return;
    }
    if (!formData.endTime) {
      Alert.alert("Error", "Please select end time");
      return;
    }
    if (!formData.reason || formData.reason.trim() === "") {
      Alert.alert("Error", "Please enter reason/tasks");
      return;
    }
    if (!formData.confirmingOfficerIdx || formData.confirmingOfficerIdx <= 0) {
      Alert.alert("Error", "Please select confirming officer");
      return;
    }

    Alert.alert(
      "Submit Leave Request",
      "Are you sure you want to submit this leave request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              setProcessing(true);

              // Prepare submission data matching the backend model
              const submitData = {
                LeaveIdx: initData.prefix?.[0]?.prefix,
                Year: formData.Year,
                StartDate: formData.startDate,
                StartTime: formData.startTimeIdx,
                EndDate: formData.endDate,
                EndTime: formData.endTimeIdx,
                NoOfDays: parseFloat(formData.numberOfDays) || null,
                Reason: formData.reason.trim(),
                LeaveType: formData.leaveTypeIdx,
                CoveringPerson: formData.coveringPersonIdx || null,
                ConfirmPerson: formData.confirmingOfficerIdx,
                ReportingPerson: formData.reportingOfficerIdx || null,
                PostReportingPerson: formData.postReportingOfficerIdx || null,
              };

              // Make API call
              const response = await api.post(
                API_ENDPOINTS.SUBMIT_LEAVE_REQUEST,
                submitData
              );

              setProcessing(false);

              const res = Array.isArray(response.data)
                ? response.data[0]
                : response.data;

              // Check response structure - adjust based on your actual API response
              if (res && (res.success === true || res.rsltType === 1)) {
                Alert.alert(
                  "Success",
                  res.message ||
                    res.outputInfo ||
                    "Leave request submitted successfully",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        handleReset(true);
                        LoadIntialData();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Error",
                  res?.message ||
                    res?.outputInfo ||
                    "Failed to submit leave request"
                );
              }
            } catch (error) {
              setLoading(false);

              const errRes = Array.isArray(error.response?.data)
                ? error.response.data[0]
                : error.response?.data;

              console.error("Error submitting leave:", error);
              console.error("Error details:", errRes);

              Alert.alert(
                "Error",
                errRes?.message ||
                  errRes?.outputInfo ||
                  "Failed to submit leave request. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleReset = (all) => {
    if (all) {
      // Get default year again
      if (initData.leaveYears && initData.leaveYears.length > 0) {
        let latestYear = initData.leaveYears[0];
        let maxIdx = parseInt(latestYear.MstrYearsIdx);

        initData.leaveYears.forEach((year) => {
          const currentIdx = parseInt(year.MstrYearsIdx);
          if (currentIdx > maxIdx) {
            maxIdx = currentIdx;
            latestYear = year;
          }
        });

        setFormData({
          YearName: latestYear.Year,
          Year: parseInt(latestYear.MstrYearsIdx),
          leaveType: "",
          leaveTypeIdx: null,
          startDate: "",
          endDate: "",
          startTime: "",
          startTimeIdx: "",
          endTime: "",
          endTimeIdx: "",
          numberOfDays: "",
          reason: "",
          coveringPerson: "",
          coveringPersonIdx: null,
          confirmingOfficer: "",
          confirmingOfficerIdx: null,
          reportingOfficer: initData.repOfficer?.[0]?.FullName || "",
          reportingOfficerIdx: initData.repOfficer?.[0]?.EmpID || null,
          postReportingOfficer: initData.postRepOfficer?.[0]?.FullName || "",
          postReportingOfficerIdx: initData.postRepOfficer?.[0]?.EmpID || null,
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        leaveType: "",
        leaveTypeIdx: null,
        startDate: "",
        endDate: "",
        startTime: "",
        startTimeIdx: "",
        endTime: "",
        endTimeIdx: "",
        numberOfDays: "",
        reason: "",
        coveringPerson: "",
        coveringPersonIdx: null,
        confirmingOfficer: "",
        confirmingOfficerIdx: null,
      }));
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const calculateNumberOfDays = async () => {
    try {
      const params = new URLSearchParams({
        LeaveTypeIdx: formData.leaveTypeIdx,
        StartDate: formData.startDate,
        EndDate: formData.endDate,
        StartTIdx: formData.startTimeIdx,
        EndTIdx: formData.endTimeIdx,
      }).toString();

      const url = `${API_ENDPOINTS.CALCULATE_NO_OF_DAYS}?${params}`;
      const response = await api.get(url);

      if (response.data[0].rsltType == 1) {
        setFormData((prev) => ({
          ...prev,
          numberOfDays: response.data[0].outputInfo,
        }));
      } else {
        Alert.alert("Error", response.data[0].outputInfo);
      }
    } catch (error) {
      console.error("Error calculating days:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leave Request Form</Text>
        <Text style={styles.headerSubtitle}>Submit your leave application</Text>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Leave Request Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Leave Request Number</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>
              {initData.prefix?.[0]?.prefix || ""}
            </Text>
          </View>
        </View>

        {/* Year */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Year *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowYearModal(true)}
          >
            <Text
              style={
                formData.YearName ? styles.inputText : styles.placeholderText
              }
            >
              {formData.YearName || "Please Select"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leave Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Leave Type *</Text>
          <View style={styles.leaveTypesList}>
            {initData.leaveTypes.map((type) => (
              <TouchableOpacity
                key={type.LeaveTypeIdx}
                style={[
                  styles.leaveTypeButton,
                  formData.leaveTypeIdx === type.LeaveTypeIdx &&
                    styles.leaveTypeButtonActive,
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    leaveType: type.LeaveType,
                    leaveTypeIdx: type.LeaveTypeIdx,
                  })
                }
              >
                <Text
                  style={[
                    styles.leaveTypeButtonText,
                    formData.leaveTypeIdx === type.LeaveTypeIdx &&
                      styles.leaveTypeButtonTextActive,
                  ]}
                >
                  {type.LeaveType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              !formData.leaveTypeIdx && styles.inputDisabled,
            ]}
            onPress={() =>
              formData.leaveTypeIdx && setShowStartDatePicker(true)
            }
            disabled={!formData.leaveTypeIdx}
          >
            <Text
              style={
                formData.startDate ? styles.inputText : styles.placeholderText
              }
            >
              {formData.startDate || "YYYY/MM/DD"}
            </Text>
          </TouchableOpacity>

          {showStartDatePicker && (
            <DateTimePicker
              value={
                formData.startDate ? new Date(formData.startDate) : new Date()
              }
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);

                if (event.type === "dismissed") {
                  return;
                }

                if (selectedDate) {
                  setFormData((prev) => ({
                    ...prev,
                    startDate: formatDate(selectedDate),

                    startTime: "",
                    startTimeIdx: "",
                    endDate: "",
                    endTime: "",
                    endTimeIdx: "",
                  }));
                }
              }}
            />
          )}
        </View>

        {/* Start Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time *</Text>
          <TouchableOpacity
            style={[styles.input, !formData.startDate && styles.inputDisabled]}
            onPress={() => formData.startDate && setShowStartTimeModal(true)}
            disabled={!formData.startDate}
          >
            <Text
              style={
                formData.startTime ? styles.inputText : styles.placeholderText
              }
            >
              {formData.startTime || "Please Select"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              !formData.startTimeIdx && styles.inputDisabled,
            ]}
            onPress={() => formData.startTimeIdx && setShowEndDatePicker(true)}
            disabled={!formData.startTimeIdx}
          >
            <Text
              style={
                formData.endDate ? styles.inputText : styles.placeholderText
              }
            >
              {formData.endDate || "YYYY/MM/DD"}
            </Text>
          </TouchableOpacity>

          {showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate ? new Date(formData.endDate) : new Date()}
              mode="date"
              display="default"
              minimumDate={
                formData.startDate ? new Date(formData.startDate) : new Date()
              }
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);

                if (event.type === "dismissed") {
                  return;
                }

                if (selectedDate) {
                  setFormData((prev) => ({
                    ...prev,
                    endDate: formatDate(selectedDate),
                    endTime: "",
                    endTimeIdx: "",
                  }));
                }
              }}
            />
          )}
        </View>

        {/* End Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Time *</Text>
          <TouchableOpacity
            style={[styles.input, !formData.endDate && styles.inputDisabled]}
            onPress={() => formData.startTimeIdx && setShowEndTimeModal(true)}
            disabled={!formData.startTimeIdx}
          >
            <Text
              style={
                formData.endTime ? styles.inputText : styles.placeholderText
              }
            >
              {formData.endTime || "Please Select"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Number of Days */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number Of Days</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>
              {formData.numberOfDays || "0"}
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reason/Tasks *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              (!formData.numberOfDays || formData.numberOfDays <= 0) &&
                styles.inputDisabled,
            ]}
            placeholder="Reason"
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={formData.numberOfDays > 0}
          />
        </View>

        {/* Covering Person */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Covering Person</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCoveringPersonModal(true)}
          >
            <Text
              style={
                formData.coveringPerson
                  ? styles.inputText
                  : styles.placeholderText
              }
            >
              {formData.coveringPerson || "Please Select"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirming Officer */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirming Officer</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowConfirmingOfficerModal(true)}
          >
            <Text
              style={
                formData.confirmingOfficer
                  ? styles.inputText
                  : styles.placeholderText
              }
            >
              {formData.confirmingOfficer || "Please Select"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reporting Officer */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reporting Officer *</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>
              {formData.reportingOfficer || ""}
            </Text>
          </View>
        </View>

        {/* Post Reporting Officer */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Post Reporting Officer</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>
              {formData.postReportingOfficer || ""}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => handleReset(false)}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Leave Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>📊 Leave Balance</Text>

        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, styles.colType]}>Type</Text>
          <Text style={styles.cell}>Alloc</Text>
          <Text style={styles.cell}>Pend</Text>
          <Text style={styles.cell}>Used</Text>
          <Text style={styles.cell}>Bal</Text>
        </View>

        {/* Rows */}
        {initData.allocTbl?.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.cell, styles.colType]}>
              {item.TypeOfLeave}
            </Text>
            <Text style={styles.cell}>
              {item.AnnualAllocation == "" ? 0 : item.AnnualAllocation}
            </Text>
            <Text style={styles.cell}>
              {item.Pending == "" ? 0 : item.Pending}
            </Text>
            <Text style={styles.cell}>{item.Used == "" ? 0 : item.Used}</Text>
            <Text style={[styles.cell, styles.balanceCell]}>
              {item.Balance == "" ? 0 : item.Balance}
            </Text>
          </View>
        ))}
      </View>

      {/* Modals */}
      <DropdownModal
        visible={showYearModal}
        onClose={() => setShowYearModal(false)}
        title="Select Year"
        data={initData.leaveYears}
        displayKey="Year"
        valueKey="MstrYearsIdx"
        onSelect={(item) => {
          setFormData({
            ...formData,
            YearName: item.Year,
            Year: parseInt(item.MstrYearsIdx),
          });
        }}
      />

      <DropdownModal
        visible={showStartTimeModal}
        onClose={() => setShowStartTimeModal(false)}
        title="Select Start Time"
        data={initData.leaveTime}
        displayKey="LeaveTType"
        valueKey="LeaveTimeIdx"
        onSelect={(item) => {
          setFormData({
            ...formData,
            startTime: item.LeaveTType,
            startTimeIdx: item.LeaveTimeIdx,
          });
        }}
      />

      <DropdownModal
        visible={showEndTimeModal}
        onClose={() => setShowEndTimeModal(false)}
        title="Select End Time"
        data={initData.leaveTime}
        displayKey="LeaveTType"
        valueKey="LeaveTimeIdx"
        onSelect={(item) => {
          setFormData({
            ...formData,
            endTime: item.LeaveTType,
            endTimeIdx: item.LeaveTimeIdx,
          });
        }}
      />

      <DropdownModal
        visible={showCoveringPersonModal}
        onClose={() => setShowCoveringPersonModal(false)}
        title="Select Covering Person"
        data={initData.cvrPerson}
        displayKey="Value"
        valueKey="ValueIdx"
        onSelect={(item) => {
          setFormData({
            ...formData,
            coveringPerson: item.Value,
            coveringPersonIdx: item.ValueIdx,
          });
        }}
      />

      <DropdownModal
        visible={showConfirmingOfficerModal}
        onClose={() => setShowConfirmingOfficerModal(false)}
        title="Select Confirming Officer"
        data={initData.confOfficer}
        displayKey="Value"
        valueKey="ValueIdx"
        onSelect={(item) => {
          setFormData({
            ...formData,
            confirmingOfficer: item.Value,
            confirmingOfficerIdx: item.ValueIdx,
          });
        }}
      />

      <ProcessingLoader
        visible={processing}
        message="Submitting your leave request..."
      />
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
  formContainer: {
    margin: SIZES.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.light,
  },
  inputDisabledText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  leaveTypesList: {
    marginTop: SIZES.sm,
    gap: SIZES.sm,
  },
  leaveTypeButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  leaveTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  leaveTypeButtonText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },
  leaveTypeButtonTextActive: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  resetButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    padding: SIZES.md,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#7cb342",
    padding: SIZES.md,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceCard: {
    margin: SIZES.md,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  balanceRowTotal: {
    borderBottomWidth: 0,
    marginTop: SIZES.sm,
    paddingTop: SIZES.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  balanceLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  balanceValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  balanceValueBold: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: "#DDD",
  },

  tableHeader: {
    backgroundColor: "#E0E0E0",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  cell: {
    flex: 1,
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },

  colType: {
    flex: 2,
    textAlign: "left",
    paddingLeft: 6,
    fontWeight: "600",
  },

  balanceCell: {
    fontWeight: "700",
    color: "#2E7D32",
  },
});

export default LeaveRequestScreen;
