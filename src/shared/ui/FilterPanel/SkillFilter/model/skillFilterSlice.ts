import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'

export interface SkillFilterState {
  /** id выбранных подкатегорий (навыков) */
  selectedSkillIds: string[]
  /** id раскрытых категорий */
  expandedCategoryIds: string[]
  /** раскрыт ли полный список категорий («Все категории») */
  isAllCategoriesOpen: boolean
}

const initialState: SkillFilterState = {
  selectedSkillIds: [],
  expandedCategoryIds: [],
  isAllCategoriesOpen: false,
}

const skillFilterSlice = createSlice({
  name: 'skillFilter',
  initialState,
  reducers: {
    toggleSkill(state, action: PayloadAction<string>) {
      const index = state.selectedSkillIds.indexOf(action.payload)

      if (index === -1) {
        state.selectedSkillIds.push(action.payload)
      } else {
        state.selectedSkillIds.splice(index, 1)
      }
    },
    toggleCategory(state, action: PayloadAction<string>) {
      const category = skills.find((item) => item.id === action.payload)

      if (!category) {
        return
      }

      const categorySkillIds: string[] = category.skills.map((skill) => skill.id)
      const isFullySelected = categorySkillIds.every((id) => state.selectedSkillIds.includes(id))

      if (isFullySelected) {
        state.selectedSkillIds = state.selectedSkillIds.filter(
          (id) => !categorySkillIds.includes(id),
        )
      } else {
        const selected = new Set(state.selectedSkillIds)
        categorySkillIds.forEach((id) => selected.add(id))
        state.selectedSkillIds = Array.from(selected)
      }
    },
    toggleCategoryExpanded(state, action: PayloadAction<string>) {
      const index = state.expandedCategoryIds.indexOf(action.payload)

      if (index === -1) {
        state.expandedCategoryIds.push(action.payload)
      } else {
        state.expandedCategoryIds.splice(index, 1)
      }
    },
    toggleAllCategories(state) {
      state.isAllCategoriesOpen = !state.isAllCategoriesOpen
    },
    clearSkillFilter(state) {
      state.selectedSkillIds = []
      state.expandedCategoryIds = []
      state.isAllCategoriesOpen = false
    },
  },
})

export const {
  toggleSkill,
  toggleCategory,
  toggleCategoryExpanded,
  toggleAllCategories,
  clearSkillFilter,
} = skillFilterSlice.actions

export const skillFilterReducer = skillFilterSlice.reducer

// Минимальная форма стейта, чтобы селекторы не тянули RootState из store
// (иначе получился бы циклический импорт shared → store).
type StateWithSkillFilter = { skillFilter: SkillFilterState }

export const selectSelectedSkillIds = (state: StateWithSkillFilter) =>
  state.skillFilter.selectedSkillIds

export const selectExpandedCategoryIds = (state: StateWithSkillFilter) =>
  state.skillFilter.expandedCategoryIds

export const selectIsAllCategoriesOpen = (state: StateWithSkillFilter) =>
  state.skillFilter.isAllCategoriesOpen

export const selectIsCategoryExpanded = (state: StateWithSkillFilter, categoryId: string) =>
  state.skillFilter.expandedCategoryIds.includes(categoryId)

/** Счётчик выбранных элементов для одной подкатегории (0 или 1). */
export const selectSkillCount = (state: StateWithSkillFilter, skillId: string) =>
  state.skillFilter.selectedSkillIds.includes(skillId) ? 1 : 0

/** Счётчик выбранных подкатегорий внутри категории (сумма дочерних). */
export const selectCategoryCount = (state: StateWithSkillFilter, categoryId: string) => {
  const category = skills.find((item) => item.id === categoryId)

  if (!category) {
    return 0
  }

  return category.skills.reduce(
    (count, skill) => (state.skillFilter.selectedSkillIds.includes(skill.id) ? count + 1 : count),
    0,
  )
}

export interface SkillFilterCounters {
  /** Количество выбранных подкатегорий по каждой категории */
  byCategory: Record<string, number>
  /** Количество выбранных элементов по каждой подкатегории (0 или 1) */
  bySkill: Record<string, number>
  /** Общее количество выбранных подкатегорий */
  total: number
}

/**
 * Все счётчики фильтра одним мемоизированным проходом.
 * Скрыты в UI, но хранятся в стейте для будущего общего фильтра.
 */
export const selectCounters = createSelector(
  [selectSelectedSkillIds],
  (selectedSkillIds): SkillFilterCounters => {
    const selected = new Set(selectedSkillIds)
    const bySkill: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    let total = 0

    for (const category of skills) {
      let categoryCount = 0

      for (const skill of category.skills) {
        const count = selected.has(skill.id) ? 1 : 0
        bySkill[skill.id] = count
        categoryCount += count
      }

      byCategory[category.id] = categoryCount
      total += categoryCount
    }

    return { byCategory, bySkill, total }
  },
)
