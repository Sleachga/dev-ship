import styles from "./StatusBadge.module.css";

export interface StatusBadgeProps {
  status: "active" | "complete";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {status === "complete" ? "\u2713 complete" : "\u25cf active"}
    </span>
  );
}
