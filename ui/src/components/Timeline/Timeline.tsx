import { useCallback } from "react";
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
  const activeRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }, []);

  if (phases.length === 0) {
    return (
      <div className={styles.container}>
        <span className={styles.empty}>No phases defined yet</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {phases.map((phase) => {
        const isDone = phase.number <= phasesComplete;
        const isActive = phase.number === currentPhase;
        const state = isDone ? "done" : isActive ? "active" : "upcoming";

        return (
          <div
            key={phase.number}
            ref={isActive ? activeRef : undefined}
            className={`${styles.phase} ${styles[`phase_${state}`]}`}
          >
            {phase.label}
          </div>
        );
      })}
    </div>
  );
}
