import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

import userIcon from '@/shared/assets/images/user-circle-hug.svg'
import addUserIcon from '@/shared/assets/images/Add-user.svg'
import galleryAddIcon from '@/shared/assets/images/gallery-add.svg'
import crossIcon from '@/shared/assets/images/cross.svg'

import styles from './ImageUpload.module.scss'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

type ImageUploadProps =
  | {
      variant: 'avatar'
      value: File | null
      onChange: (file: File | null) => void
    }
  | {
      variant: 'skill'
      value: File[]
      onChange: (files: File[]) => void
    }

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Можно загружать только изображения JPEG или PNG'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Размер изображения не должен превышать 2 МБ'
  }

  return null
}

function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className={styles.preview}>
      {previewUrl && (
        <img src={previewUrl} alt={`Предпросмотр ${file.name}`} className={styles.previewImage} />
      )}

      <button
        type="button"
        className={styles.removeButton}
        onClick={onRemove}
        aria-label={`Удалить ${file.name}`}
      >
        <img src={crossIcon} alt="" className={styles.removeIcon} />
      </button>
    </div>
  )
}

export function ImageUpload(props: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const isAvatar = props.variant === 'avatar'
  const hasAvatar = isAvatar && props.value !== null

  const openFilePicker = () => {
    if (hasAvatar) return
    inputRef.current?.click()
  }

  const processFiles = (files: File[]) => {
    setError(null)

    if (isAvatar) {
      if (props.value !== null || files.length === 0) return

      const file = files[0]
      const validationError = validateFile(file)

      if (validationError) {
        setError(validationError)
        return
      }

      props.onChange(file)
      return
    }

    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      const validationError = validateFile(file)

      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
      } else {
        validFiles.push(file)
      }
    })

    if (validFiles.length > 0) {
      props.onChange([...props.value, ...validFiles])
    }

    if (errors.length > 0) {
      setError(errors.join('. '))
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    if (isAvatar) return

    processFiles(Array.from(event.dataTransfer.files))
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (isAvatar) return

    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (isAvatar) return

    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const removeAvatar = () => {
    if (props.variant !== 'avatar') return

    props.onChange(null)
    setError(null)
  }

  const removeSkillImage = (index: number) => {
    if (props.variant !== 'skill') return

    props.onChange(props.value.filter((_, i) => i !== index))
    setError(null)
  }

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple={!isAvatar}
        className={styles.fileInput}
        onChange={handleInputChange}
        aria-label={isAvatar ? 'Выбрать аватар' : 'Выбрать изображения навыка'}
      />

      {props.variant === 'avatar' ? (
        <div className={styles.avatarWrapper}>
          {props.value ? (
            <ImagePreview file={props.value} onRemove={removeAvatar} />
          ) : (
            <button
              type="button"
              className={styles.avatarButton}
              onClick={openFilePicker}
              aria-label="Загрузить аватар"
            >
              <img src={userIcon} alt="" className={styles.userIcon} />
              <img src={addUserIcon} alt="" className={styles.addUserIcon} />
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className={styles.description}>Перетащите или выберите изображения навыка</p>

            <button type="button" className={styles.selectButton} onClick={openFilePicker}>
              <img src={galleryAddIcon} alt="" />
              Выбрать изображения
            </button>
          </div>

          {props.value.length > 0 && (
            <div className={styles.previewGrid}>
              {props.value.map((file, index) => (
                <ImagePreview
                  key={`${file.name}-${file.lastModified}-${index}`}
                  file={file}
                  onRemove={() => removeSkillImage(index)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
