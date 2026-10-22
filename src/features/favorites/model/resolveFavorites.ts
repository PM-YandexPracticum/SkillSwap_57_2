import type { Skill, User } from '@/shared/types'

export interface ResolvedFavorite {
  /** Идентификатор, который хранится в избранном — id пользователя. */
  favoriteId: string
  skill: Skill
  author: User
}

/**
 * Карточка каталога — это пользователь, поэтому в избранном хранится только его id.
 * Отметки старого формата (id навыка) не поддерживаются: их сбрасывает favoritesSlice.
 */
export const resolveFavorites = (
  favoriteIds: readonly string[],
  users: readonly User[],
  skills: readonly Skill[],
): ResolvedFavorite[] =>
  favoriteIds.flatMap((favoriteId) => {
    const author = users.find((item) => item.id === favoriteId)
    if (!author) return []

    const skill = author.teach
      .map((skillId) => skills.find((item) => item.id === skillId))
      .find((item): item is Skill => Boolean(item))

    return skill ? [{ favoriteId, skill, author }] : []
  })
