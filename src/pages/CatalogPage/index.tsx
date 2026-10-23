import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { loadCities } from '@/entities/city/model/citiesSlice'
import { fetchSkills } from '@/entities/skill/model/skillsSlice'
import { fetchUsers } from '@/entities/user/model/usersSlice'
import { selectCurrentUser } from '@/features/auth/model/authSelectors'
import {
  addFavorite,
  removeFavorite,
  selectFavoriteIds,
} from '@/features/favorites/model/favoritesSlice'
import { useSearchQuery } from '@/features/search/model/searchQueryContext'
import { useSkillSearch } from '@/features/search/model/useSkillSearch'
import { useRequireAuth } from '@/features/auth/model/useRequireAuth'
import { getSkillPath } from '@/shared/lib/helpers'
import { AddFilterButton } from '@/shared/ui/AddFilterButton'
import { Card } from '@/shared/ui/Card'
import { toggleSkill } from '@/shared/ui/FilterPanel/SkillFilter'
import { FiltersPanel } from '@/shared/ui/FiltersPanel'
import type { FiltersValue } from '@/shared/ui/FiltersPanel'
import { Section } from '@/shared/ui/Section'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  buildCatalogCards,
  getInterestSkillItems,
  getRecommendedCards,
  matchesCatalogCard,
  toSkillItems,
} from './model/catalog'
import type { CatalogCard } from './model/catalog'
import { getActiveFilters, hasActiveFilters, type ActiveFilter } from './model/activeFilters'
import styles from './CatalogPage.module.css'

const INITIAL_FILTERS: FiltersValue = {
  direction: 'all',
  skillIds: [],
  gender: 'any',
  cityIds: [],
}

export default function CatalogPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { requireAuth } = useRequireAuth()

  const [filters, setFilters] = useState<FiltersValue>(INITIAL_FILTERS)

  const { searchValue } = useSearchQuery()
  const favoriteIds = useAppSelector(selectFavoriteIds)
  const authUser = useAppSelector(selectCurrentUser)
  const users = useAppSelector((state) => state.users.items)
  const usersStatus = useAppSelector((state) => state.users.status)
  const skills = useAppSelector((state) => state.skills.items)
  const skillsStatus = useAppSelector((state) => state.skills.status)
  const cities = useAppSelector((state) => state.cities.items)

  useEffect(() => {
    if (skillsStatus === 'idle') void dispatch(fetchSkills())
    if (usersStatus === 'idle') void dispatch(fetchUsers())
    if (cities.length === 0) void dispatch(loadCities())
  }, [cities.length, dispatch, skillsStatus, usersStatus])

  const cards = useMemo(() => buildCatalogCards(users, skills), [skills, users])

  // Поиск из Header фильтрует карточки по названию навыка.
  const { filteredSkills: searchedCards, normalizedQuery } = useSkillSearch(cards, searchValue)

  const visibleCards = useMemo(
    () => [
      ...new Map(
        searchedCards
          .filter((card) => matchesCatalogCard(card, filters))
          .map((card) => [card.id, card]),
      ).values(),
    ],
    [filters, searchedCards],
  )
  const isFiltering = searchValue.trim().length > 0 || hasActiveFilters(filters)
  const activeFilters = useMemo(() => getActiveFilters(filters, cities), [filters, cities])
  const resultKey = `${normalizedQuery}:${JSON.stringify(filters)}`

  const removeFilter = (filter: ActiveFilter) => {
    if (filter.kind === 'skill') {
      dispatch(toggleSkill(filter.value))
      return
    }
    setFilters((current) => {
      if (filter.kind === 'direction') return { ...current, direction: 'all' }
      if (filter.kind === 'gender') return { ...current, gender: 'any' }
      return { ...current, cityIds: current.cityIds.filter((id) => id !== filter.value) }
    })
  }

  const popularCards = useMemo(
    () => [...visibleCards].sort((first, second) => second.user.likesCount - first.user.likesCount),
    [visibleCards],
  )

  const newCards = useMemo(
    () =>
      [...visibleCards].sort(
        (first, second) =>
          new Date(second.user.createdAt).getTime() - new Date(first.user.createdAt).getTime(),
      ),
    [visibleCards],
  )

  // Для рекомендаций сопоставляем навыки и интересы с профилем залогиненного пользователя.
  const currentUser = useMemo(() => {
    if (!authUser) return null
    return users.find((user) => user.id === authUser.id || user.email === authUser.email) ?? null
  }, [authUser, users])

  const recommendedCards = useMemo(
    () => getRecommendedCards(visibleCards, currentUser, skills),
    [currentUser, skills, visibleCards],
  )

  // В избранном храним id карточки — id пользователя: один навык могут преподавать
  // несколько человек, поэтому id навыка не позволяет восстановить нужного автора.
  const toggleFavorite = useCallback(
    (cardId: string, isLiked: boolean) => {
      if (!requireAuth()) return
      dispatch(isLiked ? addFavorite(cardId) : removeFavorite(cardId))
    },
    [dispatch, requireAuth],
  )

  const renderCard = (card: CatalogCard) => (
    <Card
      key={card.id}
      user={card.user}
      teach={toSkillItems(card.user.teach, skills)}
      learn={getInterestSkillItems(card.user, skills)}
      isLiked={favoriteIds.includes(card.id)}
      onLikeChange={(isLiked) => toggleFavorite(card.id, isLiked)}
      onDetailsClick={() => navigate(getSkillPath(card.skill.id, card.user.id))}
    />
  )

  const isLoading =
    usersStatus === 'idle' ||
    usersStatus === 'loading' ||
    skillsStatus === 'idle' ||
    skillsStatus === 'loading'
  const isFailed = usersStatus === 'failed' || skillsStatus === 'failed'

  return (
    <main className={styles.wrapper}>
      <FiltersPanel value={filters} onChange={setFilters} />

      <div className={styles.content}>
        {isLoading ? (
          <p className={styles.message} role="status">
            Загрузка…
          </p>
        ) : isFailed ? (
          <p className={styles.message} role="alert">
            Не удалось загрузить каталог. Попробуйте обновить страницу.
          </p>
        ) : isFiltering ? (
          <div className={styles.results}>
            {activeFilters.length > 0 && (
              <div className={styles.activeFilters} aria-label="Выбранные фильтры">
                {activeFilters.map((filter) => (
                  <AddFilterButton
                    key={`${filter.kind}:${filter.value}`}
                    aria-label={`Снять фильтр: ${filter.label}`}
                    onRemove={() => removeFilter(filter)}
                  >
                    {filter.label}
                  </AddFilterButton>
                ))}
              </div>
            )}
            <Section
              key={resultKey}
              title={`Подходящие предложения: ${visibleCards.length}`}
              showLookAllButton={false}
              initialVisibleCount={6}
            >
              {visibleCards.map(renderCard)}
            </Section>
            {visibleCards.length === 0 && <p className={styles.message}>Ничего не найдено</p>}
          </div>
        ) : visibleCards.length === 0 ? (
          <p className={styles.message}>Ничего не найдено</p>
        ) : (
          <div className={styles.sections}>
            <Section title="Популярное">{popularCards.map(renderCard)}</Section>

            <Section title="Новое">{newCards.map(renderCard)}</Section>

            <Section title="Рекомендуем" showLookAllButton={false}>
              {recommendedCards.map(renderCard)}
            </Section>
          </div>
        )}
      </div>
    </main>
  )
}
