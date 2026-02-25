import type { Feature } from "../../types/feature";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import styles from "./FeatureTable.module.css";

export interface FeatureTableProps {
  features: Feature[];
  onFeatureClick?: (featureDir: string) => void;
}

export function FeatureTable({ features, onFeatureClick }: FeatureTableProps) {
  if (features.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>~</div>
        <p>No features yet. Run /dev:sail to start one.</p>
      </div>
    );
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Ticket</th>
          <th>Step</th>
          <th>Progress</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {features.map((f) => {
          const pct = f.phasesTotal
            ? Math.round(((f.phasesComplete ?? 0) / f.phasesTotal) * 100)
            : 0;
          const isDone = f.status === "complete";
          const label = f.phasesTotal
            ? `${f.phasesComplete ?? 0}/${f.phasesTotal}`
            : "0/?";

          return (
            <tr
              key={f.dir}
              className={styles.row}
              onClick={() => onFeatureClick?.(f.dir)}
            >
              <td className={styles.name}>{f.name || f.dir}</td>
              <td className={styles.dim}>{f.ticket || "none"}</td>
              <td>{f.step || "\u2014"}</td>
              <td>
                <ProgressBar
                  percent={pct}
                  variant={isDone ? "done" : "active"}
                  label={label}
                />
              </td>
              <td>
                <StatusBadge status={isDone ? "complete" : "active"} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
