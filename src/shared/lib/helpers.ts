/**
 * Ссылка на страницу навыка.
 * authorId нужен, когда один навык преподают несколько человек:
 * без него страница покажет первого автора из списка.
 */
export function getSkillPath(skillId: string, authorId?: string): string {
  return authorId
    ? `/skill/${skillId}?author=${encodeURIComponent(authorId)}`
    : `/skill/${skillId}`
}

/** Форматирует дату в читаемый вид */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

/** Обрезает строку до maxLength символов */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '...'
}

/** Генерирует уникальный id */
export function generateId(): string {
  return crypto.randomUUID()
}

/** Склоняет слово в зависимости от числа перед ним */
export function plural(count: number, many: string, one: string, two: string): string {
  const lastTwoNumbers = count % 100
  const lastNumber = count % 10
  if (lastTwoNumbers >= 11 && lastTwoNumbers <= 14) {
    return `${count} ${many}`
  }

  if (lastNumber === 1) {
    return `${count} ${one}`
  }

  if (lastNumber >= 2 && lastNumber <= 4) {
    return `${count} ${two}`
  }

  return `${count} ${many}`
}

/** Возвращает возраст на данный момент */
export function getAge(birthday: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthday.getFullYear()

  const birthdayHasNotPassed =
    today.getMonth() < birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())

  if (birthdayHasNotPassed) {
    age -= 1
  }

  return age
}
