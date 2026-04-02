"use client";

/*
 * File: CVDownloadModal.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Modal popup for choosing between CV and Resume downloads with loading states
 */

import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./cv-download-modal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faTimes, faDownload, faCheck, faEye } from "@fortawesome/free-solid-svg-icons";
import { recordFunnelEvent, sendNotificationEmail } from "@/app/core/utils/engagement";
import { showToast } from "@/app/core/utils/toast";

interface CVDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocumentOption = (typeof documentOptions)[number];
type ModalActionType = "preview" | "download";

const documentOptions = [
  {
    key: "cv",
    title: "Curriculum Vitae",
    description: "Detailed professional background and experience",
    href: "Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf",
    downloadName: "AhmedEmad_CV.pdf",
    meta: "PDF • 1.6 MB • Updated Apr 2026",
  },
  {
    key: "resume",
    title: "Resume",
    description: "Concise summary of skills and achievements",
    href: "Assets/cv/AhmedEmad_SOCAnalyst_Resume.pdf",
    downloadName: "AhmedEmad_Resume.pdf",
    meta: "PDF • 0.8 MB • Updated Apr 2026",
  },
] as const;

const CVDownloadModal = memo(function CVDownloadModal({ isOpen, onClose }: CVDownloadModalProps) {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLAnchorElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle escape and focus trap while modal is open.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !isOpen) return;

      const container = modalRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
        )
      ).filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    if (isOpen) {
      previousFocusedElementRef.current = document.activeElement as HTMLElement | null;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setLoadingFile(null);
      setSuccessFile(null);
      setLiveMessage("CV download popup opened");
      // Focus management - focus first option for better a11y
      setTimeout(() => firstOptionRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      previousFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const notifyAction = (actionType: ModalActionType, option: DocumentOption) => {
    const funnelEvent =
      actionType === "preview"
        ? option.key === "cv"
          ? "cv_preview"
          : "resume_preview"
        : option.key === "cv"
          ? "cv_download"
          : "resume_download";

    recordFunnelEvent(funnelEvent);
    void sendNotificationEmail({
      subject: `Portfolio alert: ${actionType} ${option.title}`,
      cooldownKey: `cv_modal_${actionType}_${option.key}`,
      cooldownMs: 10_000,
      lines: [
        `Action: ${actionType}`,
        `Document: ${option.title}`,
        `File: ${option.downloadName}`,
        `Time (UTC): ${new Date().toISOString()}`,
        `Page: ${typeof window !== "undefined" ? window.location.href : "unknown"}`,
      ],
    });

    showToast({
      type: "info",
      message: `${actionType === "preview" ? "Preview opened" : "Download started"}: ${option.title}`,
    });
    setLiveMessage(`${actionType === "preview" ? "Preview opened" : "Download started"} for ${option.title}`);
  };

  const handleDownloadClick = (option: DocumentOption) => {
    setLoadingFile(option.key);
    setSuccessFile(null);
    notifyAction("download", option);

    // Simulate download completion and show success message
    setTimeout(() => {
      setLoadingFile(null);
      setSuccessFile(option.key);
      showToast({ type: "success", message: `${option.title} downloaded successfully` });
      setLiveMessage(`${option.title} downloaded successfully`);
      setTimeout(() => {
        setSuccessFile(null);
        onClose();
      }, 1400);
    }, 700);
  };

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick} role="presentation">
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-download-title"
        aria-describedby="cv-download-description"
      >
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal (Press Escape)"
          type="button"
          title="Close (Esc)"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className={styles.content}>
          <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
            {liveMessage}
          </p>
          <div className={styles.headerContent}>
            <span className={styles.kicker}>Instant PDF Download</span>
            <h2 className={styles.title} id="cv-download-title">Choose Your Document</h2>
            <p className={styles.subtitle} id="cv-download-description">Pick the format that fits your opportunity and download in one click.</p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>ATS-friendly</span>
              <span className={styles.metaPill}>Updated 2026</span>
              <span className={styles.metaPill}>English</span>
            </div>
          </div>

          <div className={styles.optionsContainer}>
            {documentOptions.map((documentOption, index) => {
              const isLoading = loadingFile === documentOption.key;
              const isSuccess = successFile === documentOption.key;

              return (
                <div
                  key={documentOption.key}
                  className={`${styles.option} ${isLoading ? styles.loading : ""} ${isSuccess ? styles.success : ""}`}
                  aria-busy={isLoading}
                >
                  <div className={styles.optionMain}>
                    <div className={styles.optionIcon}>
                      {isSuccess ? (
                        <FontAwesomeIcon icon={faCheck} className={styles.successIcon} />
                      ) : (
                        <FontAwesomeIcon icon={faFilePdf} />
                      )}
                    </div>

                    <div className={styles.optionContent}>
                      <h3>{documentOption.title}</h3>
                      <p>{documentOption.description}</p>
                      <p className={styles.optionMeta}>{documentOption.meta}</p>
                      {isSuccess ? (
                        <p className={styles.statusText} role="status">
                          Downloaded successfully
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className={styles.optionActions}>
                    <a
                      ref={index === 0 ? firstOptionRef : undefined}
                      href={documentOption.href}
                      download={documentOption.downloadName}
                      className={`${styles.actionBtn} ${styles.downloadBtn}`}
                      onClick={() => handleDownloadClick(documentOption)}
                      aria-label={`Download ${documentOption.title}`}
                    >
                      {isLoading ? (
                        <>
                          <span className={styles.spinner} aria-hidden="true" />
                          <span>Downloading</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faDownload} />
                          <span>Download</span>
                        </>
                      )}
                    </a>

                    <a
                      href={documentOption.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.actionBtn} ${styles.previewBtn}`}
                      onClick={() => notifyAction("preview", documentOption)}
                      aria-label={`Preview ${documentOption.title}`}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Preview</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

export default CVDownloadModal;
