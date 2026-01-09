import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SIZES } from "../../utils/constants";

const ConfirmationModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = COLORS.danger,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: confirmColor },
                ]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SIZES.lg,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.danger,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});

export default ConfirmationModal;
