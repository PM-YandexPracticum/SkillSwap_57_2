import { Button } from '../../Button';
import styles from './CorpsButton.module.css';

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.05 5.05 0 0 1-2.2 3.31v2.77h3.57c2.09-1.92 3.27-4.75 3.27-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.85 0-5.27-1.92-6.13-4.5H2.18v2.85A11 11 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.87 14.12a6.6 6.6 0 0 1 0-4.24V7.03H2.18a11 11 0 0 0 0 9.94l3.69-2.85Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.03l3.69 2.85c.86-2.58 3.28-4.5 6.13-4.5Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.05 12.54c.02 2.15 1.89 2.87 1.91 2.88-.02.05-.3 1.03-.98 2.04-.59.87-1.2 1.73-2.17 1.75-.95.02-1.26-.56-2.35-.56-1.1 0-1.44.54-2.34.58-.94.04-1.65-.94-2.24-1.8-1.21-1.75-2.13-4.95-.89-7.1a3.47 3.47 0 0 1 2.93-1.78c.92-.02 1.8.62 2.36.62.56 0 1.62-.77 2.73-.66.46.02 1.76.19 2.6 1.43-.07.04-1.55.9-1.56 2.6ZM15.27 6.9c.49-.59.82-1.4.73-2.21-.71.03-1.57.47-2.08 1.06-.46.53-.86 1.35-.75 2.14.79.06 1.61-.4 2.1-.99Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CorpsButton() {
  return (
    <div className={styles.root}>
      <Button variant="secondary" className={styles.providerButton}>
        <GoogleIcon />
        <span>Продолжить с Google</span>
      </Button>

      <Button variant="secondary" className={styles.providerButton}>
        <AppleIcon />
        <span>Продолжить с Apple</span>
      </Button>

      <div className={styles.divider} role="separator" aria-label="или">
        <span>или</span>
      </div>
    </div>
  );
}
