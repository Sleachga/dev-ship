import styles from "./ConnectionStatus.module.css";

export type ConnectionState = "connected" | "disconnected" | "connecting";

export interface ConnectionStatusProps {
  state: ConnectionState;
}

const labels: Record<ConnectionState, string> = {
  connected: "live",
  disconnected: "disconnected",
  connecting: "connecting...",
};

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  return (
    <div className={styles.status}>
      <span className={`${styles.dot} ${styles[state]}`} />
      <span>{labels[state]}</span>
    </div>
  );
}
