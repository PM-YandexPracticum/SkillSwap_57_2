import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillForm, type SkillFormValue } from './SkillForm'

afterEach(cleanup)

const CATEGORY_LABEL = 'Категория навыка, которому хотите научиться'
const SKILL_LABEL = 'Навык, которому хотите научиться'

describe('SkillForm', () => {
  it('allows skills first and limits categories to their parents', async () => {
    const user = userEvent.setup()
    render(<SkillForm />)
    await user.click(screen.getByRole('button', { name: SKILL_LABEL }))
    const skillList = within(screen.getByRole('group', { name: SKILL_LABEL }))
    await user.click(skillList.getByRole('checkbox', { name: 'Английский' }))
    await user.click(skillList.getByRole('checkbox', { name: 'Приготовление еды' }))
    await user.click(screen.getByRole('button', { name: CATEGORY_LABEL }))
    const categoryList = within(screen.getByRole('group', { name: CATEGORY_LABEL }))
    expect(categoryList.getAllByRole('checkbox')).toHaveLength(2)
    expect(categoryList.getByRole('checkbox', { name: 'Иностранные языки' })).toBeInTheDocument()
    expect(categoryList.getByRole('checkbox', { name: 'Дом и уют' })).toBeInTheDocument()
  })

  it('filters skills by categories and clears skills when their category is removed', async () => {
    const user = userEvent.setup()
    render(<SkillForm />)
    await user.click(screen.getByRole('button', { name: CATEGORY_LABEL }))
    await user.click(screen.getByRole('checkbox', { name: 'Иностранные языки' }))
    await user.click(screen.getByRole('button', { name: SKILL_LABEL }))
    expect(screen.queryByRole('checkbox', { name: 'Приготовление еды' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Английский' }))
    await user.click(screen.getByRole('button', { name: CATEGORY_LABEL }))
    await user.click(screen.getByRole('checkbox', { name: 'Иностранные языки' }))
    await user.click(screen.getByRole('button', { name: SKILL_LABEL }))
    expect(screen.getByRole('checkbox', { name: 'Английский' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Приготовление еды' })).toBeInTheDocument()
  })

  it('supports keyboard selection in controlled mode', async () => {
    const user = userEvent.setup()
    const Example = () => {
      const [value, setValue] = useState<SkillFormValue>({ categoryIds: [], subcategoryIds: [] })
      return <SkillForm value={value} onChange={setValue} />
    }
    render(<Example />)
    await user.click(screen.getByRole('button', { name: SKILL_LABEL }))
    screen.getByRole('checkbox', { name: 'Английский' }).focus()
    await user.keyboard(' ')
    expect(screen.getByRole('checkbox', { name: 'Английский' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: CATEGORY_LABEL }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    await user.click(screen.getByRole('checkbox', { name: 'Иностранные языки' }))
    await user.click(screen.getByRole('button', { name: SKILL_LABEL }))
    expect(screen.getByRole('checkbox', { name: 'Английский' })).toBeChecked()
  })
})
