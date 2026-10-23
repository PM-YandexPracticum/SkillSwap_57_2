import type { Skill, User } from '@/shared/types'
import { skills as skillCategories } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import type { SkillsListItem } from '@/shared/ui/SkillsList/SkillsList'

/** Соответствие «название подкатегории → её ID»: в фильтре навыков лежат ID подкатегорий. */
const SUBCATEGORY_IDS = new Map<string, string>()
/** ID подкатегории → название и ID категории: нужны для тегов интересов. */
const SUBCATEGORIES = new Map<string, { title: string; categoryId: string }>()
for (const category of skillCategories) {
  for (const skill of category.skills) {
    SUBCATEGORY_IDS.set(skill.title, skill.id)
    SUBCATEGORIES.set(skill.id, { title: skill.title, categoryId: category.id })
  }
}

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

/**
 * ID навыков пользователя превращаем в теги: категория нужна для цвета тега.
 */
export const toSkillItems = (skillIds: string[], skills: Skill[]): SkillsListItem[] =>
  skillIds.flatMap((skillId) => {
    const skill = skills.find((item) => item.id === skillId)
    if (!skill) return []

    const categoryId = skillCategories.find((category) => category.title === skill.category)?.id
    return [{ id: skill.id, title: skill.title, category: categoryId }]
  })

/**
 * Интересы пользователя — подкатегории, которым он хочет научиться:
 * из регистрации (learningSubcategoryIds) и из выбранных навыков (learn).
 * У новых пользователей learn пустой, поэтому одного источника недостаточно.
 */
export const getInterestSubcategoryIds = (user: User, skills: Skill[]): string[] =>
  Array.from(
    new Set([...(user.learningSubcategoryIds ?? []), ...toSubcategoryIds(user.learn, skills)]),
  )

/**
 * Интересы для блока «Хочет научиться»: названия навыков из learn
 * и названия подкатегорий, выбранных при регистрации.
 */
export const getInterestSkillItems = (user: User, skills: Skill[]): SkillsListItem[] => {
  const learned = toSkillItems(user.learn, skills)
  const learnedSubcategoryIds = new Set(toSubcategoryIds(user.learn, skills))

  const declared = (user.learningSubcategoryIds ?? []).flatMap((subcategoryId) => {
    // Навык из learn уже показан, повторять его подкатегорию не нужно.
    if (learnedSubcategoryIds.has(subcategoryId)) return []

    const subcategory = SUBCATEGORIES.get(subcategoryId)
    return subcategory
      ? [{ id: subcategoryId, title: subcategory.title, category: subcategory.categoryId }]
      : []
  })

  return [...learned, ...declared]
}
