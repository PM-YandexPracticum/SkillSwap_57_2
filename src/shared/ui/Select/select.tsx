import './Select.css'
import arrowIcon from '../../assets/arrow.svg'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  options: SelectOption[]
  placeholder: string
  multiple?: boolean
  error?: string
  width: number
}

export function Select({
  label,
  options, //логика выбора нужна будет при интеграции 
  placeholder,
  multiple = false, //логика выбора нужна будет при интеграции 
  error,
  width,
}: SelectProps) {
  return (
    <div className="select-wrapper">
      <label className="selectlabel">{label}</label>

      <div className="select" style={{ width }}>
        <span className="selectplaceholder">{placeholder}</span>
        <img className="selectarrow" src={arrowIcon} alt='' />
      </div>

      {error && <span className="selecterror">{error}</span>}
    </div>
  )
}