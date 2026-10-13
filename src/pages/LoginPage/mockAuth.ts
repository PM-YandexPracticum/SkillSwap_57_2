/**
 * Учебная заглушка авторизации.
 *
 * Реальная логика ещё не реализована (features/auth/model/authSlice.ts,
 * authUtils.ts, store/index.ts), поэтому здесь мы мокаем ответ бэкенда,
 * чтобы можно было проверить валидацию формы и состояние ошибки.
 *
 * Демо-доступ (для проверки успешного входа):
 *   email  — demo@skillswap.ru
 *   пароль — Skillswap123
 *
 * TODO: заменить на вызов реального экшена авторизации
 * (например, `dispatch(login({ email, password }))`).
 */

export const DEMO_LOGPASS = {
  email: 'demo@skillswap.ru',
  password: 'Skillswap123',
} as const

export const INVALID_CREDENTIALS_MESSAGE =
  'Email или пароль введён неверно. Пожалуйста проверьте правильность введённых данных'

/** Имитация сетевой задержки, мс */
const MOCK_DELAY = 600

/**
 * Мок-функция входа. Успешно резолвится только для демо-пары,
 * иначе отклоняется с сообщением об ошибке.
 */
export async function mockLogin(email: string, password: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))

  const isDemoUser =
    email.trim().toLowerCase() === DEMO_LOGPASS.email && password === DEMO_LOGPASS.password

  if (!isDemoUser) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE)
  }
}
