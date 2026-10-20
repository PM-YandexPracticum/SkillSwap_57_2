import { useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { SearchQueryContext } from '@/features/search/model/searchQueryContext'
import { Footer } from '@/shared/ui/Footer/Footer'
import { Header } from '@/shared/ui/Header/Header'

export function MainLayout() {
  const [searchValue, setSearchValue] = useState('')
  const searchQuery = useMemo(() => ({ searchValue, setSearchValue }), [searchValue])

  return (
    <SearchQueryContext.Provider value={searchQuery}>
      <div>
        <Header searchValue={searchValue} onSearchChange={setSearchValue} />
        <Outlet />
        <Footer />
      </div>
    </SearchQueryContext.Provider>
  )
}
