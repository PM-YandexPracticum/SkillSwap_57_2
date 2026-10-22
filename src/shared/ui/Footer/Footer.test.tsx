import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SkillPage from '@/pages/SkillPage'
import { ROUTES } from '@/shared/lib/constants'
import { Footer } from './Footer'

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={ROUTES.SKILLS} element={<SkillPage />} />
        <Route path="*" element={<Footer />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Footer skills navigation', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each(['/', '/skill/skill_1', '/favorites', '/profile?section=personal', '/missing'])(
    'opens the all-skills page from %s',
    async (path) => {
      renderRoute(path)
      const link = screen.getByRole('link', { name: 'Все навыки' })
      expect(link).toHaveAttribute('href', '/skills')
      await userEvent.click(link)
      expect(screen.getByRole('heading', { level: 1, name: 'Все навыки' })).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    },
  )

  it('renders all categories on a direct visit without offer data or dead subcategory links', () => {
    // No Redux provider: this directory must work independently of offer/user loading.
    renderRoute('/skills')
    for (const name of [
      'Бизнес и карьера',
      'Творчество и искусство',
      'Иностранные языки',
      'Образование и развитие',
      'Дом и уют',
      'Здоровье и лайфстайл',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument()
    }
    expect(screen.getByText('Английский')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Английский' })).not.toBeInTheDocument()
    expect(screen.queryByText('Навык не найден')).not.toBeInTheDocument()
  })
})
