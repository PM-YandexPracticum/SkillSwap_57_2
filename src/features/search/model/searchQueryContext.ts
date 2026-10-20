import { createContext, useContext } from 'react'

export interface SearchQueryContextValue {
  searchValue: string
  setSearchValue: (value: string) => void
}

/** Значение по умолчанию нужно, чтобы страница работала и без провайдера (например, в тестах). */
export const SearchQueryContext = createContext<SearchQueryContextValue>({
  searchValue: '',
  setSearchValue: () => {},
})

export const useSearchQuery = () => useContext(SearchQueryContext)
