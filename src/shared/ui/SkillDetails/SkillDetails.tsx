import { Button } from '@/shared/ui/Button'
import { Title } from '@/shared/ui/Title'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import { ImageGallery } from '@/shared/ui/ImageGallery'
import editIcon from '@/shared/assets/images/edit.svg'

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
      isSubmitting?: boolean
    }
  | {
      variant: 'skill'
      onExchange: () => void
    }
)

export function SkillDetails(props: SkillDetailsProps) {
  const { title, category, subcategory, description, images } = props

  const categoryData = skills.find((item) => item.title === category)

  const subcategoryData = categoryData?.skills.find((item) => item.title === subcategory)

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
              <Button variant="secondary" onClick={props.onEdit} disabled={props.isSubmitting}>
                Редактировать
                <img src={editIcon} alt="" className={styles.editIcon} />
              </Button>

              <Button variant="primary" onClick={props.onDone} disabled={props.isSubmitting}>
                {props.isSubmitting ? 'Сохраняем…' : 'Готово'}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={props.onExchange}>
              Предложить обмен
            </Button>
          )}
        </div>
      </div>

      <ImageGallery images={images} showArrows />
    </div>
  )
}
