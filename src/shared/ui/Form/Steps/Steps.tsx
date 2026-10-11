import styles from './Steps.module.css';

const TOTAL_STEPS = 3;

export type StepsProps = {
  currentStep: 1 | 2 | 3;
};

export function Steps({ currentStep }: StepsProps) {
  return (
    <div className={styles.root}>
      <p className={styles.label}>
        Шаг {currentStep} из {TOTAL_STEPS}
      </p>

      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Этапы регистрации"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={currentStep}
        aria-valuetext={`Шаг ${currentStep} из ${TOTAL_STEPS}`}
      >
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <span
            aria-hidden="true"
            className={index < currentStep ? styles.completedStep : styles.pendingStep}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
