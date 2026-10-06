import chevronRight from '../../assets/images/chevron-right.svg'
import styles from './LookAllButton.module.css'
import { Button } from '../Button'

interface LookAllButtonProps {
  isExpanded: boolean
  onClick: () => void
}

export const LookAllButton = ({ isExpanded, onClick }: LookAllButtonProps) => (
  <Button
    variant='tertiary'
    type='button'
    onClick={onClick}>
    {isExpanded ? 'Свернуть' : 'Смотреть все'}
    <img
       className={`${styles.icon} ${isExpanded ? styles.iconExpanded : ''}`}
       src={chevronRight}
       alt=""
       aria-hidden="true"
     />
  </Button>
)
