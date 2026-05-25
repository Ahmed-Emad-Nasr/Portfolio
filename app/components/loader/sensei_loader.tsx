"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./sensei_loader.module.css";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      window.setTimeout(() => setLoading(false), 1500);
    };

    if (document.readyState === "complete") {
      handleLoad();
      return;
    }

    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={styles.loader}
          aria-hidden="true"
        >
          <div className={styles.neuralGrid} />

          <div className={styles.ringWrap}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className={styles.ring}
            />

            <div className={styles.symbol}>師</div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.copy}
          >
            <div className={styles.copyRuleRow}>
              <div className={styles.copyRule} />
              <span className={styles.copyLabel}>Loading Systems</span>
              <div className={styles.copyRule} />
            </div>
            <h2 className={styles.title}>
             Ahmed Emad<span className={styles.titleAccent}>Nasr</span>
            </h2>
          </motion.div>

          <div className={styles.progressBar}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className={styles.progressFill}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}