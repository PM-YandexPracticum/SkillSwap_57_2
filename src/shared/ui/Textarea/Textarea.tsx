import { FC, TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'
import editIcon from '@/shared/assets/images/edit.svg'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  showPostfix?: boolean
}

export const Textarea: FC<TextareaProps> = ({ label, showPostfix, className, ...rest }) => {
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <div className={styles.textareaWrapper}>
        <textarea
          className={`${styles.textarea} ${showPostfix ? styles.textareaWithPostfix : ''} ${className ?? ''}`}
          {...rest}
        />
        {showPostfix && <img className={styles.postfix} src={editIcon} alt="редактировать" />}
      </div>
    </label>
  )
}
