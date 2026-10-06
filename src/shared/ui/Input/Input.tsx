import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import eyeIcon from '@/shared/assets/images/eye.svg';
import eyeSlashIcon from '@/shared/assets/images/eye-slash.svg';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'search';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onEndIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      variant = 'default',
      startIcon,
      endIcon,
      onEndIconClick,
      type = 'text',
      id,
      className,
      disabled,
      ...inputProps
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const isPassword = type === 'password';
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const resolvedType = isPassword && isPasswordVisible ? 'text' : type;
    const hasEndAction = isPassword || Boolean(onEndIconClick);

    const handleEndAction = () => {
      if (isPassword) {
        setIsPasswordVisible((currentValue) => !currentValue);
        return;
      }

      onEndIconClick?.();
    };

    const describedBy = error
      ? errorId
      : hint
        ? hintId
        : inputProps['aria-describedby'];

    return (
      <div
        className={[
          styles.root,
          variant === 'search' ? styles.rootSearch : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}

        <div
          className={[
            styles.control,
            variant === 'search' ? styles.controlSearch : '',
            error ? styles.controlError : '',
            disabled ? styles.controlDisabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {startIcon && (
            <span className={styles.icon} aria-hidden="true">
              {startIcon}
            </span>
          )}

          <input
            {...inputProps}
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            className={styles.input}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          />

          {(endIcon || isPassword) &&
            (hasEndAction ? (
              <button
                className={styles.iconButton}
                type="button"
                onClick={handleEndAction}
                disabled={disabled}
                aria-label={
                  isPassword
                    ? isPasswordVisible
                      ? 'Скрыть пароль'
                      : 'Показать пароль'
                    : 'Выполнить действие'
                }
              >
                {endIcon ?? (
                  <img
                    src={isPasswordVisible ? eyeSlashIcon : eyeIcon}
                    alt=""
                    aria-hidden="true"
                  />
                )}
              </button>
            ) : (
              <span className={styles.icon} aria-hidden="true">
                {endIcon}
              </span>
            ))}
        </div>

        {error ? (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        ) : (
          hint && (
            <span id={hintId} className={styles.hint}>
              {hint}
            </span>
          )
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
