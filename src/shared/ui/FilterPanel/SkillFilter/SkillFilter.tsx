import { memo, useMemo } from 'react'
import { Title } from '@/shared/ui/Title'
import { Checkbox } from '@/shared/ui/checkbox/Checkbox'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { OpenFilterButton } from '../OpenFilterButton'
import {
  selectCategoryCount,
  selectIsAllCategoriesOpen,
  selectIsCategoryExpanded,
  selectSkillCount,
  toggleAllCategories,
  toggleCategory,
  toggleCategoryExpanded,
  toggleSkill,
} from './model/skillFilterSlice'
import styles from './SkillFilter.module.css'

/** Сколько категорий показываем, пока список не раскрыт кнопкой «Все категории». */
const DEFAULT_VISIBLE_CATEGORIES = 6

type SkillCategory = (typeof skills)[number]

interface SkillItemProps {
  skillId: string
  title: string
}

/** Строка подкатегории. Подписана только на свой счётчик — лишних ререндеров нет. */
const SkillItem = memo(({ skillId, title }: SkillItemProps) => {
  const dispatch = useAppDispatch()
  const isSelected = useAppSelector((state) => selectSkillCount(state, skillId) > 0)

  return (
    <li className={styles.skill}>
      <Checkbox
        text={title}
        checked={isSelected}
        onChange={() => dispatch(toggleSkill(skillId))}
      />
    </li>
  )
})

SkillItem.displayName = 'SkillItem'

interface CategoryItemProps {
  category: SkillCategory
}

/** Строка категории со стрелкой раскрытия и чекбоксом с частичным выбором. */
const CategoryItem = memo(({ category }: CategoryItemProps) => {
  const dispatch = useAppDispatch()
  const isExpanded = useAppSelector((state) => selectIsCategoryExpanded(state, category.id))
  const selectedCount = useAppSelector((state) => selectCategoryCount(state, category.id))

  const totalCount = category.skills.length
  const isAllSelected = totalCount > 0 && selectedCount === totalCount
  const isPartiallySelected = selectedCount > 0 && !isAllSelected

  return (
    <li className={styles.category}>
      <div className={styles.categoryHeader}>
        <Checkbox
          ariaLabel={category.title}
          checked={isAllSelected}
          indeterminate={isPartiallySelected}
          onChange={() => dispatch(toggleCategory(category.id))}
        />
        <button
          type="button"
          className={styles.categoryTitle}
          onClick={() => dispatch(toggleCategoryExpanded(category.id))}
        >
          {category.title}
        </button>
        <OpenFilterButton
          isOpen={isExpanded}
          className={styles.arrow}
          aria-label={`${isExpanded ? 'Скрыть' : 'Показать'} подкатегории: ${category.title}`}
          onClick={() => dispatch(toggleCategoryExpanded(category.id))}
        />
      </div>

      <div className={styles.skillsWrap} data-open={isExpanded}>
        <ul className={styles.skills}>
          {category.skills.map((skill) => (
            <SkillItem key={skill.id} skillId={skill.id} title={skill.title} />
          ))}
        </ul>
      </div>
    </li>
  )
})

CategoryItem.displayName = 'CategoryItem'

export const SkillFilter = () => {
  const dispatch = useAppDispatch()
  const isAllCategoriesOpen = useAppSelector(selectIsAllCategoriesOpen)

  const hasHiddenCategories = skills.length > DEFAULT_VISIBLE_CATEGORIES

  const visibleCategories = useMemo<readonly SkillCategory[]>(() => {
    if (!hasHiddenCategories || isAllCategoriesOpen) {
      return skills
    }

    return skills.slice(0, DEFAULT_VISIBLE_CATEGORIES)
  }, [hasHiddenCategories, isAllCategoriesOpen])

  return (
    <section className={styles.skillFilter} aria-label="Фильтр по навыкам">
      <Title size="H3" className={styles.title}>
        Навыки
      </Title>

      <ul className={styles.categories}>
        {visibleCategories.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </ul>

      <OpenFilterButton
        isOpen={isAllCategoriesOpen}
        className={styles.showAll}
        onClick={() => dispatch(toggleAllCategories())}
      >
        Все категории
      </OpenFilterButton>
    </section>
  )
}
