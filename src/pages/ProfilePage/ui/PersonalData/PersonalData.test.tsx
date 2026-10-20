import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/shared/types'
import { PersonalData } from './PersonalData'

vi.mock('@/shared/assets/images/eye.svg?react', () => ({ default: () => <svg /> }))
vi.mock('@/shared/assets/images/eye-slash.svg?react', () => ({ default: () => <svg /> }))

const user: User = {
  id: 'user_1', name: 'Иван', email: 'ivan@example.com', avatar: null,
  aboutMe: 'Привет', gender: 'male', city: 'moscow', birthDate: '1994-04-06',
  createdAt: '2025-01-01', likesCount: 0, likesCard: [], teach: [], learn: [],
}
const cities = [
  { id: 'moscow', title: 'Москва' },
  { id: 'kazan', title: 'Казань' },
]

afterEach(cleanup)

describe('PersonalData', () => {
  it('sends edited fields and the selected city to saving', () => {
    const onSave = vi.fn()
    render(<PersonalData value={user} cities={cities} onSave={onSave} />)
    expect(screen.getByLabelText('Дата рождения')).toHaveValue('06.04.1994')
    expect(screen.getByRole('button', { name: 'Пол' })).toHaveTextContent('Мужской')
    expect(screen.getByRole('button', { name: 'Город' })).toHaveTextContent('Москва')
    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Новое имя' } })
    fireEvent.click(screen.getByRole('button', { name: 'Город' }))
    fireEvent.click(screen.getByRole('option', { name: 'Казань' }))
    fireEvent.click(screen.getByRole('button', { name: 'Пол' }))
    fireEvent.click(screen.getByRole('option', { name: 'Женский' }))
    fireEvent.click(screen.getByRole('button', { name: 'Изменить пароль' }))
    fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'new-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user_1', name: 'Новое имя', city: 'kazan', gender: 'female', birthDate: '1994-04-06' }),
      'new-secret',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Данные сохранены')
  })

  it('shows an error and no success message if saving fails', async () => {
    const onSave = vi.fn(() => { throw new Error('Хранилище недоступно') })
    render(<PersonalData value={user} cities={cities} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(
      'Не удалось сохранить данные. Проверьте доступное место в браузере и попробуйте ещё раз.',
    ))
    expect(screen.queryByText('Данные сохранены')).not.toBeInTheDocument()
  })
})
