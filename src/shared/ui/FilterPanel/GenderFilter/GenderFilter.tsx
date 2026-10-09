import { RadioGroup } from '@/shared/ui/RadioGroup'
import type { RadioOption } from '@/shared/ui/RadioGroup'
import { Title } from '@/shared/ui/Title'
import styles from './GenderFilter.module.css'

export type GenderValue = 'any' | 'male' | 'female'

const GENDER_OPTIONS: RadioOption<GenderValue>[] = [
  { label: 'Не имеет значения', value: 'any' },
  { label: 'Мужской', value: 'male' },
  { label: 'Женский', value: 'female' },
]

interface GenderFilterProps {
  value: GenderValue
  onChange: (value: GenderValue) => void
}

export const GenderFilter = ({ value, onChange }: GenderFilterProps) => (
  <div className={styles.genderFilter}>
    <Title size='H3' className={styles.title}>
      Пол автора
    </Title>
    <RadioGroup name='gender' options={GENDER_OPTIONS} value={value} onChange={onChange} />
  </div>
)