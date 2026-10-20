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
import { getSkillPath } from '@/shared/lib/helpers'
import { Card } from '@/shared/ui/Card'
import { FiltersPanel } from '@/shared/ui/FiltersPanel'
import type { FiltersValue } from '@/shared/ui/FiltersPanel'
import { Section } from '@/shared/ui/Section'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  buildCatalogCards,
  findExactMatches,
  matchesCatalogCard,
  toSkillItems,
} from './model/catalog'
import type { CatalogCard } from './model/catalog'
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
  const { filteredSkills: searchedCards } = useSkillSearch(cards, searchValue)

  const visibleCards = useMemo(
    () => searchedCards.filter((card) => matchesCatalogCard(card, filters)),
    [filters, searchedCards],
  )

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

  // «Точные совпадения» — взаимный обмен навыками с текущим пользователем.
  const currentUser = useMemo(() => {
    if (!authUser) return null
    return users.find((user) => user.id === authUser.id || user.email === authUser.email) ?? null
  }, [authUser, users])

  const exactMatchCards = useMemo(
    () => findExactMatches(visibleCards, currentUser, skills),
    [currentUser, skills, visibleCards],
  )

  const isSearchActive = searchValue.trim().length > 0

  // В избранном храним id карточки — id пользователя: один навык могут преподавать
  // несколько человек, поэтому id навыка не позволяет восстановить нужного автора.
  const toggleFavorite = useCallback(
    (cardId: string, isLiked: boolean) => {
      dispatch(isLiked ? addFavorite(cardId) : removeFavorite(cardId))
    },
    [dispatch],
  )

  const renderCard = (card: CatalogCard) => (
    <Card
      key={card.id}
      user={card.user}
      teach={toSkillItems(card.user.teach, skills)}
      learn={toSkillItems(card.user.learn, skills)}
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
      <FiltersPanel onChange={setFilters} />

      <div className={styles.content}>
        {isLoading ? (
          <p className={styles.message} role="status">
            Загрузка…
          </p>
        ) : isFailed ? (
          <p className={styles.message} role="alert">
            Не удалось загрузить каталог. Попробуйте обновить страницу.
          </p>
        ) : (
          <>
            {isSearchActive && (
              <p className={styles.searchResults} aria-live="polite">
                Найдено карточек: {visibleCards.length}
              </p>
            )}

            {visibleCards.length === 0 ? (
              <p className={styles.message}>
                {isSearchActive
                  ? 'Ничего не найдено по запросу и выбранным фильтрам.'
                  : 'Ничего не найдено по выбранным фильтрам.'}
              </p>
            ) : (
              <div className={styles.sections}>
                <Section title="Популярное">{popularCards.map(renderCard)}</Section>

                <Section title="Новое">{newCards.map(renderCard)}</Section>

                {exactMatchCards.length > 0 && (
                  <Section title="Рекомендуем" showLookAllButton={false}>
                    {exactMatchCards.map(renderCard)}
                  </Section>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
