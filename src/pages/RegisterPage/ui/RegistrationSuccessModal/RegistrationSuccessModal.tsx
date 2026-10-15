import { Modal } from '@/shared/ui/Modal/Modal'
import { SuccessMessage } from '@/shared/ui/SuccessMessage'
import done from '@/shared/assets/images/Done.svg'
import styles from './RegistrationSuccessModal.module.css'

export function RegistrationSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} onOverlayClick={onClose}>
      <div className={styles.content}>
        <SuccessMessage
          illustration={done}
          title="Ваше предложение создано"
          description="Теперь вы можете предложить обмен"
          onClose={onClose}
        />
      </div>
    </Modal>
  )
}
