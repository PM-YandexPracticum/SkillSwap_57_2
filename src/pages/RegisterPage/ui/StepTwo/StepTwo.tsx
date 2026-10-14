import { useId, useState, type FormEvent } from 'react'
import { endOfDay, format, isValid, parse } from 'date-fns'
import type { City } from '@/shared/types'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { CustomDatePicker } from '@/shared/ui/DatePicker'
import { CityForm } from '@/shared/ui/Form/CityForm'
import { SkillForm } from '@/shared/ui/Form/SkillForm'
import { ImageUpload } from '@/shared/ui/ImageUpload'
import type { StepTwoValue } from './model'
import styles from './StepTwo.module.css'

interface StepTwoProps {
  value: StepTwoValue
  cities: City[]
  onChange: (value: StepTwoValue) => void
  onBack: () => void
  onContinue: (value: StepTwoValue) => void
}

const genderOptions = [
  { value: 'unspecified', label: 'Не указан' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
]

export function StepTwo({ value, cities, onChange, onBack, onContinue }: StepTwoProps) {
  const dateId = useId()
  const [submitted, setSubmitted] = useState(false)
  const [invalidDateInput, setInvalidDateInput] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const today = endOfDay(new Date())
  const nameError = value.name.trim() ? undefined : 'Введите ваше имя'
  const invalidDate =
    invalidDateInput ||
    (value.birthDate !== null && (!isValid(value.birthDate) || value.birthDate > today))
  const dateError = invalidDate ? 'Введите корректную дату рождения' : undefined
  const update = (patch: Partial<StepTwoValue>) => onChange({ ...value, ...patch })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    if (nameError || dateError || avatarError) return
    onContinue({ ...value, name: value.name.trim() })
  }

  return (
    <form
      className={styles.form}
      aria-label="Данные пользователя"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className={styles.avatar}>
        <ImageUpload
          variant="avatar"
          value={value.avatar}
          onChange={(avatar) => update({ avatar })}
          onError={setAvatarError}
        />
      </div>
      <Input
        label="Имя"
        placeholder="Введите ваше имя"
        autoComplete="given-name"
        value={value.name}
        onChange={(event) => update({ name: event.currentTarget.value })}
        error={submitted ? nameError : undefined}
      />
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={dateId}>Дата рождения</label>
          <CustomDatePicker
            id={dateId}
            placeholderText="дд.мм.гггг"
            strictParsing
            maxDate={today}
            selected={value.birthDate && isValid(value.birthDate) ? value.birthDate : null}
            onChange={(birthDate: Date | null) => {
              setInvalidDateInput(false)
              update({ birthDate })
            }}
            onInputError={() => setInvalidDateInput(true)}
            onChangeRaw={(event) => {
              if (!(event?.target instanceof HTMLInputElement)) return
              const text = event.target.value
              const parsed = parse(text, 'dd.MM.yyyy', new Date())
              setInvalidDateInput(
                Boolean(
                  text &&
                  (!isValid(parsed) || format(parsed, 'dd.MM.yyyy') !== text || parsed > today),
                ),
              )
            }}
            ariaInvalid={invalidDate ? 'true' : 'false'}
            ariaDescribedBy={dateError ? `${dateId}-error` : undefined}
          />
          {dateError && (
            <p id={`${dateId}-error`} role="alert" className={styles.error}>
              {dateError}
            </p>
          )}
        </div>
        <Select
          label="Пол"
          placeholder="Не указан"
          options={genderOptions}
          value={value.gender}
          onChange={(gender) =>
            update({ gender: gender === 'male' || gender === 'female' ? gender : 'unspecified' })
          }
        />
      </div>
      <CityForm cities={cities} value={value.city} onChange={(city) => update({ city })} />
      <SkillForm
        value={value.learningSkills}
        onChange={(learningSkills) => update({ learningSkills })}
        skillLabel="Подкатегория навыка, которому хотите научиться"
        skillPlaceholder="Выберите подкатегорию"
      />
      <div className={styles.actions}>
        <Button variant="secondary" type="button" onClick={onBack}>
          Назад
        </Button>
        <Button type="submit">Продолжить</Button>
      </div>
    </form>
  )
}
