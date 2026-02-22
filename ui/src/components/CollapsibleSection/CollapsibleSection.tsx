import { useState } from "react";
import styles from "./CollapsibleSection.module.css";

export interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <button
        className={styles.header}
        onClick={() => setIsOpen((o) => !o)}
        type="button"
      >
        <span>{title}</span>
        <span className={`${styles.toggle} ${isOpen ? styles.open : ""}`}>
          {"\u25b6"}
        </span>
      </button>
      {isOpen && <div className={styles.body}>{children}</div>}
    </div>
  );
}
