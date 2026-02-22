import styles from "./ProgressBar.module.css";

export interface ProgressBarProps {
  /** 0-100 */
  percent: number;
  variant?: "active" | "done";
  /** e.g. "3/5" */
  label?: string;
}

export function ProgressBar({ percent, variant = "active", label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <span className={styles.wrapper}>
      <span className={styles.bar}>
        <span
          className={`${styles.fill} ${styles[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
