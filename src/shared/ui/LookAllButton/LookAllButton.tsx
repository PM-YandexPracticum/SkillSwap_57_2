import chevronRight from '../../assets/images/chevron-right.svg'
import styles from './LookAllButton.module.css'

interface LookAllButtonProps {
  isExpanded: boolean
  onClick: () => void
}

export const LookAllButton = ({ isExpanded, onClick }: LookAllButtonProps) => (
  <button
    className={styles.button}
    type="button"
    onClick={onClick}
    aria-expanded={isExpanded}
  >
    {isExpanded ? 'Свернуть' : 'Смотреть все'}
    <img
      className={`${styles.icon} ${isExpanded ? styles.iconExpanded : ''}`}
      src={chevronRight}
      alt=""
      aria-hidden="true"
    />
  </button>
)