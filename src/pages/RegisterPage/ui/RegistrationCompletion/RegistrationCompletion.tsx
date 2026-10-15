import { useEffect, useRef, useState } from 'react'
import { useCompleteRegistration } from '@/features/auth/model/useCompleteRegistration'
import type { RegistrationData } from '@/features/auth/model/registerUser'
import { SkillPreviewModal } from '../SkillPreviewModal/SkillPreviewModal'
import { RegistrationSuccessModal } from '../RegistrationSuccessModal'
import styles from './RegistrationCompletion.module.css'

interface RegistrationCompletionProps {
  data: RegistrationData
  onEdit: () => void
  onFinished: () => void
}

/** Монтируется контейнером после третьего шага. Сам управляет всем подтверждением. */
export function RegistrationCompletion({ data, onEdit, onFinished }: RegistrationCompletionProps) {
  const finish = useCompleteRegistration()
  const [images, setImages] = useState<string[]>([])
  const finished = useRef(false)

  useEffect(() => {
    const urls = data.offer.images.map((file) => URL.createObjectURL(file))
    setImages(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [data.offer.images])

  const handleEdit = () => {
    if (!finish.isSubmitting) onEdit()
  }

  const handleFinished = () => {
    if (finished.current) return
    finished.current = true
    onFinished()
  }

  if (finish.isSuccessOpen) return <RegistrationSuccessModal onClose={handleFinished} />

  return (
    <SkillPreviewModal
      {...data.offer}
      images={images}
      onDone={() => {
        void finish.complete(data)
      }}
      onEdit={handleEdit}
      onClose={handleEdit}
      isSubmitting={finish.isSubmitting}
      feedback={
        finish.error ? (
          <p className={styles.error} role="alert">
            {finish.error}
          </p>
        ) : finish.isSubmitting ? (
          <p role="status">Сохраняем данные…</p>
        ) : null
      }
    />
  )
}
