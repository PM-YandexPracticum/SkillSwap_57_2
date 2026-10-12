import { useState } from 'react'

import { Button } from '@/shared/ui/Button'
import { Title } from '@/shared/ui/Title'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import chevronRight from '@/shared/assets/images/chevron-right.svg' // удалить после реализации галлереи

// import { ImageGallery } from '@/shared/ui/ImageGallery'
// import { ImageCarousel } from '@/shared/ui/ImageCarousel'

import styles from './SkillDetails.module.scss'

type SkillDetailsProps = {
  title: string
  category: string
  subcategory: string
  description: string
  images: string[]
} & (
  | {
      variant: 'preview'
      onEdit: () => void
      onDone: () => void
    }
  | {
      variant: 'skill'
      onExchange: () => void
    }
)

export function SkillDetails(props: SkillDetailsProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const { title, category, subcategory, description, images } = props

  const categoryData = skills.find((item) => item.title === category)

  const subcategoryData = categoryData?.skills.find((item) => item.title === subcategory)

  const changeImage = (direction: number) => {
    if (images.length === 0) return

    setActiveImageIndex((index) => (index + direction + images.length) % images.length)
  }

  return (
    <div className={styles.details}>
      <div className={styles.content}>
        <Title size="H1" className={styles.title}>
          {title}
        </Title>

        <p className={styles.category}>
          {categoryData?.title ?? category}
          {' / '}
          {subcategoryData?.title ?? subcategory}
        </p>

        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          {props.variant === 'preview' ? (
            <>
              <Button variant="secondary" onClick={props.onEdit}>
                Редактировать
              </Button>

              <Button variant="primary" onClick={props.onDone}>
                Готово
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={props.onExchange}>
              Предложить обмен
            </Button>
          )}
        </div>
      </div>

          {/* временная галлерея, заменить после реализации галлереи */}
      <div className={styles.gallery}>  
        {images.length > 0 && (
          <>
            <div className={styles.mainImage}>
              <img src={images[activeImageIndex] ?? images[0]} alt={title} />

              {images.length > 1 && (
                <div className={styles.galleryControls}>
                  <button
                    type="button"
                    onClick={() => changeImage(-1)}
                    aria-label="Предыдущее изображение"
                  >
                    <img src={chevronRight} alt="" className={styles.chevronLeft} />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeImage(1)}
                    aria-label="Следующее изображение"
                  >
                    <img src={chevronRight} alt="" className={styles.chevronRight} />
                  </button>
                </div>
              )}
            </div>

            <div className={styles.thumbnails}>
              {images.slice(0, 3).map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={styles.thumbnail}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Показать изображение ${index + 1}`}
                >
                  <img src={image} alt="" />

                  {index === 2 && images.length > 3 && (
                    <span className={styles.moreImages}>+{images.length - 3}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
