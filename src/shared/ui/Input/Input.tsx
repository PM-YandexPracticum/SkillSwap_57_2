import clsx from 'clsx';
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import EyeIcon from '@/shared/assets/images/eye.svg?react';
import EyeSlashIcon from '@/shared/assets/images/eye-slash.svg?react';
import styles from './Input.module.css';

type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'search';
  startIcon?: ReactNode;
};

export type PasswordInputProps = BaseInputProps & {
  type: 'password';
  endIcon?: never;
  onEndIconClick?: never;
};

type RegularInputType = 'text' | 'email' | 'search';

type RegularInputProps = BaseInputProps & {
  type?: RegularInputType;
  endIcon?: ReactNode;
  onEndIconClick?: () => void;
};

export type InputProps = PasswordInputProps | RegularInputProps;



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

    const describedBy = error
      ? errorId
      : hint
        ? hintId
        : inputProps['aria-describedby'];

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((currentValue) => !currentValue);
    };

    return (
      <div
        className={clsx(
          styles.root,
          variant === 'search' && styles['root-search'],
          className,
        )}
      >
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}

        <div
          className={clsx(
            styles.control,
            variant === 'search' && styles['control-search'],
            error && styles['control-error'],
            disabled && styles['control-disabled'],
          )}
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

          {isPassword ? (
            <button
              className={styles['icon-button']}
              type="button"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              aria-label={
                isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'
              }
            >
              {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          ) : endIcon && onEndIconClick ? (
            <button
              className={styles['icon-button']}
              type="button"
              onClick={onEndIconClick}
              disabled={disabled}
              aria-label="Выполнить действие"
            >
              {endIcon}
            </button>
          ) : (
            endIcon && (
              <span className={styles.icon} aria-hidden="true">
                {endIcon}
              </span>
            )
          )}
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
