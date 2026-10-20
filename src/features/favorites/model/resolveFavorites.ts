import type { Skill, User } from '@/shared/types'

export interface ResolvedFavorite {
  /** Идентификатор, который хранится в избранном. */
  favoriteId: string
  skill: Skill
  author: User
}

/**
 * Карточка каталога — это пользователь, поэтому в избранном хранится его id.
 * Для старых записей и лайков со страницы навыка поддерживаем id навыка:
 * тогда автором считается первый пользователь, который этот навык преподаёт.
 */
export const resolveFavorites = (
  favoriteIds: readonly string[],
  users: readonly User[],
  skills: readonly Skill[],
): ResolvedFavorite[] =>
  favoriteIds.flatMap((favoriteId) => {
    const user = users.find((item) => item.id === favoriteId)

    if (user) {
      const skill = user.teach
        .map((skillId) => skills.find((item) => item.id === skillId))
        .find((item): item is Skill => Boolean(item))

      return skill ? [{ favoriteId, skill, author: user }] : []
    }

    const skill = skills.find((item) => item.id === favoriteId)
    if (!skill) return []

    const author = users.find((item) => item.teach.includes(skill.id))
    return author ? [{ favoriteId, skill, author }] : []
  })
