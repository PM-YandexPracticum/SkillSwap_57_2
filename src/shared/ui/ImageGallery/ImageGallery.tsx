import { useRef } from 'react'
import ReactImageGallery, { type ImageGalleryRef } from 'react-image-gallery'

import ChevronRight from '@/shared/assets/images/chevron-right.svg'

import 'react-image-gallery/styles/image-gallery.css'
import styles from './ImageGallery.module.scss'

interface ImageGalleryProps {
  images: string[]
  showArrows?: boolean
}

export function ImageGallery({ images, showArrows = true }: ImageGalleryProps) {
  const galleryRef = useRef<ImageGalleryRef>(null)

  const thumbnails = images.slice(1, 4)
  const hiddenCount = Math.max(images.length - 4, 0)

  const items = images.map((src, index) => ({
    original: src,
    originalAlt: `Фото навыка ${index + 1}`,
  }))

  if (images.length === 0) return null

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <ReactImageGallery
          ref={galleryRef}
          items={items}
          showThumbnails={false}
          showPlayButton={false}
          showFullscreenButton={false}
          showBullets={false}
          showIndex={false}
          showNav={showArrows && images.length > 1}
          autoPlay={false}
          infinite
          slideDuration={300}
          renderItem={(item) => (
            <img className={styles.mainImage} src={item.original} alt={item.originalAlt} />
          )}
          renderLeftNav={(onClick, disabled) => (
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={onClick}
              disabled={disabled}
              aria-label="Предыдущее фото"
            >
              <img src={ChevronRight} alt="" className={styles.chevronLeft} />
            </button>
          )}
          renderRightNav={(onClick, disabled) => (
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={onClick}
              disabled={disabled}
              aria-label="Следующее фото"
            >
              <img src={ChevronRight} alt="" className={styles.chevronRight} />
            </button>
          )}
        />
      </div>

      {thumbnails.length > 0 && (
        <div className={styles.thumbnails}>
          {thumbnails.map((src, index) => {
            const imageIndex = index + 1
            const showCount = index === 2 && hiddenCount > 0

            return (
              <button
                key={`${src}-${imageIndex}`}
                type="button"
                className={styles.thumbnail}
                aria-label={`Показать фото ${imageIndex + 1}`}
                onClick={() => {
                  galleryRef.current?.slideToIndex(imageIndex)
                }}
              >
                <img src={src} alt="" />

                {showCount && (
                  <span className={styles.moreImages} aria-hidden="true">
                    +{hiddenCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
