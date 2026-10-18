import { FormEvent, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import '@/shared/ui/DatePicker/DatePicker.css'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { CustomDatePicker } from '@/shared/ui/DatePicker/CustomDatePicker'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import editIcon from '@/shared/assets/images/edit.svg'
import galleryEditIcon from '@/shared/assets/images/gallery-edit.svg'
import calendarIcon from '@/shared/assets/images/calendar.svg'
import styles from './PersonalData.module.css'

export interface PersonalDataValue {
  email: string
  name: string
  birthDate: string
  gender: string
  city: string
  aboutMe: string
  avatarUrl?: string
}

interface PersonalDataProps {
  value: PersonalDataValue
}

const genderOptions = [
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
  { value: 'unspecified', label: 'Не указан' },
]

const cityOptions = [
  { value: 'moscow', label: 'Москва' },
  { value: 'saint-petersburg', label: 'Санкт-Петербург' },
]

export function PersonalData({ value }: PersonalDataProps) {
  const [email, setEmail] = useState(value.email)
  const [name, setName] = useState(value.name)
  const [aboutMe, setAboutMe] = useState(value.aboutMe)
  const [isSaved, setIsSaved] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaved(true)
  }

  return (
    <section className={styles.section} aria-labelledby="personal-data-title">
      <h1 id="personal-data-title" className={styles.visuallyHidden}>Личные данные</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Почта"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          endIcon={<img src={editIcon} alt="" />}
          onEndIconClick={() => undefined}
        />
        <button className={styles.passwordLink} type="button">Изменить пароль</button>

        <Input
          label="Имя"
          value={name}
          onChange={(event) => setName(event.target.value)}
          endIcon={<img src={editIcon} alt="" />}
          onEndIconClick={() => undefined}
        />

        <div className={styles.row}>
          <div className={styles.dateField}>
            <span className={styles.fieldLabel}>Дата рождения</span>
            <div className={styles.dateControl}>
              <span>{value.birthDate}</span>
              <img src={calendarIcon} alt="" aria-hidden="true" />
              <div className={styles.datePickerOverlay} aria-label="Выбрать дату рождения">
                <CustomDatePicker />
              </div>
            </div>
          </div>

          <Select
            label="Пол"
            options={genderOptions}
            placeholder={value.gender}
            width={200}
          />
        </div>

        <Select
          label="Город"
          options={cityOptions}
          placeholder={value.city}
          width={422}
        />

        <Textarea
          label="О себе"
          value={aboutMe}
          onChange={(event) => setAboutMe(event.target.value)}
          showPostfix
        />

        <Button className={styles.saveButton} type="submit">Сохранить</Button>
        {isSaved && <p className={styles.savedMessage} role="status">Данные сохранены</p>}
      </form>

      <div className={styles.avatarArea}>
        <Avatar
          src={value.avatarUrl}
          alt={`Аватар пользователя ${value.name}`}
          size="big"
        />
        <button className={styles.avatarButton} type="button" aria-label="Изменить аватар">
          <img src={galleryEditIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
