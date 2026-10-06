import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from './Button.module.scss';

type ButtonVar = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    children: ReactNode;
    variant?: ButtonVar;
}
export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const buttonClassName = [
    styles.button,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...props} type={type}className={buttonClassName}>{children}</button>
  );
}
