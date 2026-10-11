import { ru } from 'date-fns/locale'
import DatePicker, { type DatePickerProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import calendarIcon from '@/shared/assets/images/calendar.svg'
import './DatePicker.css'

export type CustomDatePickerProps = DatePickerProps

export const CustomDatePicker = (props: CustomDatePickerProps) => (
  <div className='custom-date-picker'>
    <DatePicker
      {...props}
      locale={ru}
      dateFormat='dd.MM.yyyy'
      placeholderText='ДД.ММ.ГГГГ'
      calendarStartDay={1}
      showIcon
      icon={<img src={calendarIcon} alt='' />}
      showPopperArrow={false}
      className='custom-date-picker__input'
      calendarClassName='custom-date-picker__calendar'
      popperClassName='custom-date-picker__popper'
    />
  </div>
)
