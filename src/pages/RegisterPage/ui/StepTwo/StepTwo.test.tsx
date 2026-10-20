import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StepTwo, initialStepTwoValue, type StepTwoValue } from '.'

const onChange = vi.fn(),
  onBack = vi.fn(),
  onContinue = vi.fn()
const city = { id: 'spb', title: 'Санкт-Петербург' }
const renderStep = (value: StepTwoValue = { ...initialStepTwoValue, name: 'Павел' }) =>
  render(
    <StepTwo
      value={value}
      cities={[city]}
      onChange={onChange}
      onBack={onBack}
      onContinue={onContinue}
    />,
  )
beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe('StepTwo', () => {
  it.each(['', '   '])('blocks an empty or whitespace-only name, but allows going back', (name) => {
    renderStep({ ...initialStepTwoValue, name })
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(screen.getByText('Введите ваше имя')).toBeInTheDocument()
    expect(onContinue).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }))
    expect(onBack).toHaveBeenCalledOnce()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('retains controlled data after remount and submits a trimmed name', () => {
    const value: StepTwoValue = {
      ...initialStepTwoValue,
      name: ' Павел ',
      birthDate: new Date(2000, 0, 2),
      gender: 'male',
      city,
      likes: { categoryIds: ['languages'], subcategoryIds: ['english', 'french'] },
    }
    const view = renderStep(value)
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }))
    view.unmount()
    renderStep(value)
    expect(screen.getByLabelText('Имя')).toHaveValue(' Павел ')
    expect(screen.getByLabelText('Дата рождения')).toHaveValue('02.01.2000')
    expect(screen.getByRole('combobox', { name: 'Город' })).toHaveValue(city.title)
    expect(screen.getByRole('button', { name: 'Пол' })).toHaveTextContent('Мужской')
    expect(
      screen.getByRole('button', { name: 'Подкатегория навыка, которому хотите научиться' }),
    ).toHaveTextContent('Английский, Французский')
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onContinue).toHaveBeenCalledWith({ ...value, name: 'Павел' })
  })

  it.each(['31.02.2020', '01.01.2099'])('blocks invalid manually entered dates: %s', (text) => {
    renderStep()
    fireEvent.change(screen.getByLabelText('Дата рождения'), { target: { value: text } })
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(screen.getByText('Введите корректную дату рождения')).toBeInTheDocument()
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('blocks future dates and rejected avatar files', () => {
    const view = renderStep({
      ...initialStepTwoValue,
      name: 'Павел',
      birthDate: new Date(2099, 0, 1),
    })
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(onContinue).not.toHaveBeenCalled()
    view.unmount()
    renderStep()
    fireEvent.change(screen.getByLabelText('Выбрать аватар'), {
      target: { files: [new File(['text'], 'wrong.txt', { type: 'text/plain' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(screen.getByText('Можно загружать только изображения JPEG или PNG')).toBeInTheDocument()
    expect(onContinue).not.toHaveBeenCalled()
  })
})
