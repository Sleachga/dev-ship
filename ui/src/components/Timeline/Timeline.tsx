import styles from "./Timeline.module.css";

export interface TimelinePhase {
  number: number;
  label: string;
}

export interface TimelineProps {
  phases: TimelinePhase[];
  phasesComplete: number;
  /** 1-indexed current active phase */
  currentPhase: number | null;
}

export function Timeline({ phases, phasesComplete, currentPhase }: TimelineProps) {
  if (phases.length === 0) {
    return (
      <div className={styles.container}>
        <span className={styles.empty}>No phases defined yet</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {phases.map((phase, i) => {
        const isDone = phase.number <= phasesComplete;
        const isActive = phase.number === currentPhase;
        const dotState = isDone ? "done" : isActive ? "active" : "upcoming";
        const isLast = i === phases.length - 1;

        return (
          <div key={phase.number} className={styles.phase}>
            <div className={styles.node}>
              <div className={`${styles.dot} ${styles[`dot_${dotState}`]}`}>
                {isDone ? "\u2713" : phase.number}
              </div>
              <div className={`${styles.label} ${styles[`label_${dotState}`]}`}>
                {phase.label}
              </div>
            </div>
            {!isLast && (
              <div
                className={`${styles.connector} ${
                  isDone ? styles.connectorDone : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
