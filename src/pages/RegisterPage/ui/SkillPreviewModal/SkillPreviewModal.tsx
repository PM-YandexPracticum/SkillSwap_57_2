import { Modal } from '../../../../shared/ui/Modal/Modal'
import type { ReactNode } from 'react'
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
  isSubmitting?: boolean
  feedback?: ReactNode
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
  isSubmitting = false,
  feedback,
}: SkillPreviewModalProps) {
  return (
    <Modal onClose={onClose} onOverlayClick={onClose}>
      <div className={styles.preview}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Ваше предложение</h2>

          <p className={styles.subtitle}>Пожалуйста, проверьте и подтвердите правильность данных</p>
          {feedback}
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
          isSubmitting={isSubmitting}
        />
      </div>
    </Modal>
  )
}
