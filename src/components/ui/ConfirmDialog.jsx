"use client";

import Modal from "./Modal.jsx";
import Button from "./Button.jsx";
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  confirmVariant = "danger",
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      className={styles.modal}
      footer={
        <div className={styles.footer}>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
        </div>
      }
    >
      <div className={styles.message}>{message}</div>
    </Modal>
  );
}
