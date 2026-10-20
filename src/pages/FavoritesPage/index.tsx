import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'

import { loadCities } from '@/entities/city/model/citiesSlice'
import { fetchSkills } from '@/entities/skill/model/skillsSlice'
import { fetchUsers } from '@/entities/user/model/usersSlice'
import { removeFavorite, selectFavoriteIds } from '@/features/favorites/model/favoritesSlice'
import { resolveFavorites } from '@/features/favorites/model/resolveFavorites'
import { ROUTES } from '@/shared/lib/constants'
import { getSkillPath } from '@/shared/lib/helpers'
import type { Skill, User } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { FiltersPanel } from '@/shared/ui/FiltersPanel'
import type { FiltersValue } from '@/shared/ui/FiltersPanel'
import { Footer } from '@/shared/ui/Footer/Footer'
import { Header } from '@/shared/ui/Header/Header'
import { skills as skillCategories } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import { SkillsList } from '@/shared/ui/SkillsList'
import { Title } from '@/shared/ui/Title'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './FavoritesPage.module.css'

type SkillItems = ComponentProps<typeof SkillsList>['skills']

const toSkillItems = (skillIds: string[], skills: Skill[]): SkillItems =>
  skillIds.flatMap((skillId) => {
    const skill = skills.find((item) => item.id === skillId)
    if (!skill) return []

    const categoryId = skillCategories.find((category) => category.title === skill.category)?.id
    return [{ id: skill.id, title: skill.title, category: categoryId }]
  })

/** Соответствие «название подкатегории → её ID»: нужно для сопоставления с фильтром навыков. */
const SUBCATEGORY_IDS = new Map<string, string>()
for (const category of skillCategories) {
  for (const skill of category.skills) {
    SUBCATEGORY_IDS.set(skill.title, skill.id)
  }
}

/**
 * В фильтре навыков лежат ID подкатегорий (music, english),
 * а у пользователя — ID конкретных предложений (skill_1).
 */
const toSubcategoryIds = (skillIds: string[], skills: Skill[]): string[] =>
  skillIds.flatMap((skillId) => {
    const skill = skills.find((item) => item.id === skillId)
    if (!skill) return []

    const subcategoryId = SUBCATEGORY_IDS.get(skill.subcategory)
    return subcategoryId ? [subcategoryId] : []
  })

/**
 * Карточка проходит, если набор навыков подходит хотя бы под одно направление:
 * «могу научить» или «хочу научиться». Остальные группы фильтров — общие.
 */
const matchesDirection = (
  direction: 'teach' | 'learn',
  subcategoryIds: string[],
  author: User,
  filters: FiltersValue,
): boolean => {
  if (filters.direction !== 'all' && filters.direction !== direction) return false

  if (filters.skillIds.length > 0 && !filters.skillIds.some((id) => subcategoryIds.includes(id))) {
    return false
  }

  if (filters.gender !== 'any' && author.gender !== filters.gender) return false

  if (filters.cityIds.length > 0 && !filters.cityIds.includes(author.city)) return false

  return true
}

const FavoritesPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<FiltersValue>({
    direction: 'all',
    skillIds: [],
    gender: 'any',
    cityIds: [],
  })

  const favoriteIds = useAppSelector(selectFavoriteIds)
  const skills = useAppSelector((state) => state.skills.items)
  const skillsStatus = useAppSelector((state) => state.skills.status)
  const users = useAppSelector((state) => state.users.items)
  const usersStatus = useAppSelector((state) => state.users.status)
  const cities = useAppSelector((state) => state.cities.items)

  useEffect(() => {
    if (skillsStatus === 'idle') void dispatch(fetchSkills())
    if (usersStatus === 'idle') void dispatch(fetchUsers())
    if (cities.length === 0) void dispatch(loadCities())
  }, [cities.length, dispatch, skillsStatus, usersStatus])

  const favoriteCards = useMemo(
    () => resolveFavorites(favoriteIds, users, skills),
    [favoriteIds, skills, users],
  )

  const isDataLoading =
    skillsStatus === 'idle' ||
    skillsStatus === 'loading' ||
    usersStatus === 'idle' ||
    usersStatus === 'loading'

  // Фильтры применяются к уже собранным карточкам избранного.
  const visibleCards = useMemo(
    () =>
      favoriteCards.filter(
        ({ author }) =>
          matchesDirection('teach', toSubcategoryIds(author.teach, skills), author, filters) ||
          matchesDirection('learn', toSubcategoryIds(author.learn, skills), author, filters),
      ),
    [favoriteCards, filters, skills],
  )

  const hasFavorites = favoriteIds.length > 0
  const isFilteredEmpty = hasFavorites && !isDataLoading && visibleCards.length === 0

  const handleRemove = useCallback(
    (favoriteId: string, isLiked: boolean) => {
      if (!isLiked) dispatch(removeFavorite(favoriteId))
    },
    [dispatch],
  )

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <FiltersPanel onChange={setFilters} />

          <section className={styles.content}>
            <Title size="H2" className={styles.heading}>
              Избранное
            </Title>

            {!hasFavorites ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>В избранном пока ничего нет.</p>
                <Button onClick={() => navigate(ROUTES.HOME)}>Вернуться в каталог</Button>
              </div>
            ) : isDataLoading ? (
              <p className={styles.message} role="status">
                Загрузка…
              </p>
            ) : isFilteredEmpty ? (
              <p className={styles.message}>Ничего не найдено по выбранным фильтрам.</p>
            ) : (
              <div className={styles.grid}>
                {visibleCards.map(({ favoriteId, skill, author }) => (
                  <Card
                    key={favoriteId}
                    user={author}
                    teach={toSkillItems(author.teach, skills)}
                    learn={toSkillItems(author.learn, skills)}
                    isLiked
                    onLikeChange={(isLiked) => handleRemove(favoriteId, isLiked)}
                    onDetailsClick={() => navigate(getSkillPath(skill.id, author.id))}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default FavoritesPage
