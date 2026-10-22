import { Button } from '@/shared/ui/Button/Button'
import { Title } from '@/shared/ui/Title'
import styles from './SuccessMessage.module.css'

interface SuccessMessageProps {
  illustration: string
  title: string
  description: string
  onClose: () => void
  variant?: 'default' | 'exchange'
}

export const SuccessMessage = ({
  illustration,
  title,
  description,
  onClose,
  variant = 'default',
}: SuccessMessageProps) => (
  <div className={`${styles.successMessage} ${variant === 'exchange' ? styles.exchange : ''}`}>
    <img src={illustration} alt="" width={100} height={100} className={styles.illustration} />

    <div className={styles.content}>
      <div className={styles.text}>
        <Title size="H2" className={styles.title}>
          {title}
        </Title>
        <p className={styles.description}>{description}</p>
      </div>

      <Button className={styles.button} onClick={onClose}>
        Готово
      </Button>
    </div>
  </div>
)
