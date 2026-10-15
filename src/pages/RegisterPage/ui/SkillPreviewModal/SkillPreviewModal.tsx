import { Modal } from '../../../../shared/ui/Modal/Modal'
import { SkillDetails } from '@/shared/ui/SkillDetails'

import styles from './SkillPreviewModal.module.scss'

type SkillPreviewModalProps = {
  title: string
  category: string
  subcategory: string
  description: string
  images: string[]
  onClose: () => void
  onEdit: () => void
  onDone: () => void
}

export function SkillPreviewModal({
  title,
  category,
  subcategory,
  description,
  images,
  onClose,
  onEdit,
  onDone,
}: SkillPreviewModalProps) {
  return (
    <Modal onClose={onClose} onOverlayClick={onClose}>
      <div className={styles.preview}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Ваше предложение</h2>

          <p className={styles.subtitle}>Пожалуйста, проверьте и подтвердите правильность данных</p>
        </div>

        <SkillDetails
          title={title}
          category={category}
          subcategory={subcategory}
          description={description}
          images={images}
          variant="preview"
          onEdit={onEdit}
          onDone={onDone}
        />
      </div>
    </Modal>
  )
}
