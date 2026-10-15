import { ROUTES } from '@/shared/lib/constants'

/** Принимаем только внутренний адрес; сохраняем также параметры и якорь. */
export function getReturnTo(state: unknown): string {
  if (!state || typeof state !== 'object' || !('from' in state)) return ROUTES.HOME
  const from = state.from
  if (!from || typeof from !== 'object' || !('pathname' in from)) return ROUTES.HOME
  const { pathname } = from
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return ROUTES.HOME
  if (pathname.startsWith('//') || /[\\\s?#]/.test(pathname)) return ROUTES.HOME

  const url = new URL(pathname, 'https://skillswap.local')
  if (url.pathname.startsWith('//')) return ROUTES.HOME
  if ([ROUTES.LOGIN, ROUTES.REGISTER].some((path) => url.pathname.replace(/\/+$/, '') === path)) {
    return ROUTES.HOME
  }
  const search = 'search' in from && typeof from.search === 'string' ? from.search : ''
  const hash = 'hash' in from && typeof from.hash === 'string' ? from.hash : ''
  return url.pathname + (search.startsWith('?') ? search : '') + (hash.startsWith('#') ? hash : '')
}
