import type { SubStep } from "../../types/feature";
import styles from "./StepIndicator.module.css";

export interface StepIndicatorProps {
  /** Current phase number, or null if complete */
  currentPhase: number | null;
  /** Which substep is active */
  activeSubStep?: SubStep | null;
  /** Whether the feature is complete */
  isComplete?: boolean;
  /** Optional custom step label (when phase can't be parsed) */
  customStep?: string;
}

const DEFAULT_SUBSTEPS: SubStep[] = ["context", "implement", "summarize"];

export function StepIndicator({
  currentPhase,
  activeSubStep,
  isComplete = false,
  customStep,
}: StepIndicatorProps) {
  if (isComplete) {
    return (
      <div className={styles.container}>
        <h3 className={styles.heading}>Current Step</h3>
        <div className={styles.complete}>{"\u2713"} All phases complete</div>
      </div>
    );
  }

  if (!currentPhase && customStep) {
    return (
      <div className={styles.container}>
        <h3 className={styles.heading}>Current Step</h3>
        <div className={styles.substeps}>
          <div className={`${styles.substep} ${styles.substepActive}`}>
            <div className={styles.dot} />
            {customStep}
          </div>
        </div>
      </div>
    );
  }

  const subIdx = activeSubStep ? DEFAULT_SUBSTEPS.indexOf(activeSubStep) : -1;

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>
        Phase {currentPhase} &mdash; Current Step
      </h3>
      <div className={styles.substeps}>
        {DEFAULT_SUBSTEPS.map((step, i) => {
          const cls =
            i < subIdx
              ? styles.substepDone
              : i === subIdx
                ? styles.substepActive
                : "";
          return (
            <div key={step} className={`${styles.substep} ${cls}`}>
              <div className={styles.dot} />
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
