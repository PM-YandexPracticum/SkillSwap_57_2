import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import arrowIcon from '@/shared/assets/images/chevron-down.svg'
import styles from './ImageCarousel.module.css'

const THUMBS_COUNT = 3

interface ImageCarouselProps {
  images: string[]
  alt?: string
}

export const ImageCarousel = ({ images, alt = 'Фото навыка' }: ImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return undefined

    const handleSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', handleSelect)
    emblaApi.on('reInit', handleSelect)

    return () => {
      emblaApi.off('select', handleSelect)
      emblaApi.off('reInit', handleSelect)
    }
  }, [emblaApi])

  if (images.length === 0) return null

  // Превью: следующие по порядку фото после выбранного, максимум THUMBS_COUNT
  const thumbIndexes = Array.from(
    { length: Math.min(THUMBS_COUNT, images.length - 1) },
    (_, offset) => (selectedIndex + 1 + offset) % images.length,
  )
  const hiddenCount = images.length - 1 - thumbIndexes.length

  return (
    <div className={styles.imageCarousel}>
      <div className={styles.main}>
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.container}>
            {images.map((src, index) => (
              <div key={src} className={styles.slide}>
                <img className={styles.image} src={src} alt={`${alt} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <div className={styles.controls}>
            <button
              type='button'
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={scrollPrev}
              aria-label='Предыдущее фото'
            >
              <img className={styles.arrowIcon} src={arrowIcon} alt='' />
            </button>
            <button
              type='button'
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={scrollNext}
              aria-label='Следующее фото'
            >
              <img className={styles.arrowIcon} src={arrowIcon} alt='' />
            </button>
          </div>
        )}
      </div>
      {thumbIndexes.length > 0 && (
        <div className={styles.thumbs}>
          {thumbIndexes.map((imageIndex, position) => (
            <button
              key={imageIndex}
              type='button'
              className={styles.thumb}
              onClick={() => emblaApi?.scrollTo(imageIndex)}
              aria-label={`Показать фото ${imageIndex + 1}`}
            >
              <img className={styles.image} src={images[imageIndex]} alt='' />
              {position === thumbIndexes.length - 1 && hiddenCount > 0 && (
                <span className={styles.more}>+{hiddenCount}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}