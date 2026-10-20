import type { ComponentProps } from 'react'

import type { Skill, User } from '@/shared/types'
import type { FiltersValue } from '@/shared/ui/FiltersPanel'
import type { FilterableCatalogItem } from '@/shared/ui/FiltersPanel/matchesFilters'
import { matchesFilters } from '@/shared/ui/FiltersPanel/matchesFilters'
import { skills as skillCategories } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import type { SkillsList } from '@/shared/ui/SkillsList'

export type SkillItems = ComponentProps<typeof SkillsList>['skills']

/** Соответствие «название подкатегории → её ID»: в фильтре навыков лежат ID подкатегорий. */
const SUBCATEGORY_IDS = new Map<string, string>()
for (const category of skillCategories) {
  for (const skill of category.skills) {
    SUBCATEGORY_IDS.set(skill.title, skill.id)
  }
}

/** ID навыков пользователя превращаем в теги: категория нужна для цвета тега. */
export const toSkillItems = (skillIds: string[], skills: Skill[]): SkillItems =>
  skillIds.flatMap((skillId) => {
    const skill = skills.find((item) => item.id === skillId)
    if (!skill) return []

    const categoryId = skillCategories.find((category) => category.title === skill.category)?.id
    return [{ id: skill.id, title: skill.title, category: categoryId }]
  })

/**
 * У пользователя хранятся ID конкретных предложений (skill_1),
 * а в фильтре навыков — ID подкатегорий (music, english).
 */
export const toSubcategoryIds = (skillIds: string[], skills: Skill[]): string[] =>
  skillIds.flatMap((skillId) => {
    const skill = skills.find((item) => item.id === skillId)
    if (!skill) return []

    const subcategoryId = SUBCATEGORY_IDS.get(skill.subcategory)
    return subcategoryId ? [subcategoryId] : []
  })

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
        learnSkillIds: toSubcategoryIds(user.learn, skills),
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
 * Интересы пользователя — подкатегории, которым он хочет научиться:
 * из регистрации (learningSubcategoryIds) и из выбранных навыков (learn).
 */
export const getInterestSubcategoryIds = (user: User, skills: Skill[]): string[] =>
  Array.from(
    new Set([...(user.learningSubcategoryIds ?? []), ...toSubcategoryIds(user.learn, skills)]),
  )

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
