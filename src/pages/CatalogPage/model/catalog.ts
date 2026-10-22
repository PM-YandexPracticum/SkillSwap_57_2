import type { ComponentProps } from 'react'

import {
  getInterestSkillItems,
  getInterestSubcategoryIds,
  toSkillItems,
  toSubcategoryIds,
} from '@/shared/lib/subcategories'
import type { Skill, User } from '@/shared/types'
import type { FiltersValue } from '@/shared/ui/FiltersPanel'
import type { FilterableCatalogItem } from '@/shared/ui/FiltersPanel/matchesFilters'
import { matchesFilters } from '@/shared/ui/FiltersPanel/matchesFilters'
import type { SkillsList } from '@/shared/ui/SkillsList'

export type SkillItems = ComponentProps<typeof SkillsList>['skills']

export { getInterestSkillItems, getInterestSubcategoryIds, toSkillItems, toSubcategoryIds }

export interface CatalogCard {
  /** id пользователя: карточка уникальна и не повторяется в секциях. */
  id: string
  /** Название навыка, по которому работает useSkillSearch. */
  title: string
  user: User
  skill: Skill
  /** ID подкатегорий, которые пользователь может преподавать. */
  teachSkillIds: string[]
  /** ID подкатегорий, которым пользователь хочет научиться. */
  learnSkillIds: string[]
}

/**
 * Одна карточка — один пользователь и его предложение (первый существующий навык из teach).
 * Пользователи без навыка не попадают в каталог.
 */
export const buildCatalogCards = (users: User[], skills: Skill[]): CatalogCard[] =>
  users.flatMap((user) => {
    const skill = user.teach
      .map((skillId) => skills.find((item) => item.id === skillId))
      .find((item): item is Skill => Boolean(item))

    if (!skill) return []

    return [
      {
        id: user.id,
        title: skill.title,
        user,
        skill,
        teachSkillIds: toSubcategoryIds(user.teach, skills),
        // Интересы берём из обоих источников: learningSubcategoryIds и learn.
        learnSkillIds: getInterestSubcategoryIds(user, skills),
      },
    ]
  })

/**
 * Карточка подходит, если её навыки совпадают с выбранным направлением.
 * Для «Всё» проверяем оба направления: «могу научить» и «хочу научиться».
 */
export const matchesCatalogCard = (card: CatalogCard, filters: FiltersValue): boolean => {
  const directions: Exclude<FiltersValue['direction'], 'all'>[] =
    filters.direction === 'all' ? ['teach', 'learn'] : [filters.direction]

  return directions.some((direction) => {
    // В FilterableCatalogItem нет значения «не указан», поэтому такую карточку
    // отсекаем только при явно выбранном поле.
    if (card.user.gender === 'unspecified' && filters.gender !== 'any') return false

    const item: FilterableCatalogItem = {
      direction,
      skillIds: direction === 'teach' ? card.teachSkillIds : card.learnSkillIds,
      gender: card.user.gender === 'female' ? 'female' : 'male',
      cityId: card.user.city,
    }

    return matchesFilters(item, filters)
  })
}

/**
 * «Точное совпадение» — взаимный обмен:
 * другой пользователь может научить тому, чему я хочу научиться,
 * а я могу научить тому, что интересует его.
 */
export const findExactMatches = (
  cards: CatalogCard[],
  currentUser: User | null,
  skills: Skill[],
): CatalogCard[] => {
  if (!currentUser) return []

  const myInterests = getInterestSubcategoryIds(currentUser, skills)
  const myTeach = toSubcategoryIds(currentUser.teach, skills)

  if (myInterests.length === 0 || myTeach.length === 0) return []

  return cards.filter((card) => {
    if (card.id === currentUser.id) return false

    const candidateInterests = getInterestSubcategoryIds(card.user, skills)

    const canTeachMe = card.teachSkillIds.some((id) => myInterests.includes(id))
    const canLearnFromMe = myTeach.some((id) => candidateInterests.includes(id))

    return canTeachMe && canLearnFromMe
  })
}

/** Перемешивание Фишера — Йетса: порядок рекомендаций для гостя. */
export const shuffleCards = (cards: CatalogCard[]): CatalogCard[] => {
  const result = [...cards]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentCard = result[index]
    result[index] = result[randomIndex]
    result[randomIndex] = currentCard
  }

  return result
}

/**
 * Рекомендации: гостю показываем перемешанные карточки, авторизованному —
 * отсортированные по интересам. Взаимные совпадения идут первыми,
 * но их отсутствие не оставляет секцию пустой.
 */
export const getRecommendedCards = (
  cards: CatalogCard[],
  currentUser: User | null,
  skills: Skill[],
): CatalogCard[] => {
  if (!currentUser) return shuffleCards(cards)

  const exactMatchIds = new Set(findExactMatches(cards, currentUser, skills).map((card) => card.id))
  const myInterests = getInterestSubcategoryIds(currentUser, skills)

  const interestScore = (card: CatalogCard) =>
    card.teachSkillIds.filter((id) => myInterests.includes(id)).length

  return [...cards].sort((first, second) => {
    const byExactMatch = Number(exactMatchIds.has(second.id)) - Number(exactMatchIds.has(first.id))
    if (byExactMatch !== 0) return byExactMatch

    const byInterest = interestScore(second) - interestScore(first)
    if (byInterest !== 0) return byInterest

    return second.user.likesCount - first.user.likesCount
  })
}
