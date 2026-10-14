import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import DatePicker, { type DatePickerProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import calendarIcon from '@/shared/assets/images/calendar.svg'
import './DatePicker.css'

export type CustomDatePickerProps = DatePickerProps

const months = Array.from({ length: 12 }, (_, month) =>
  format(new Date(2000, month, 1), 'LLLL', { locale: ru }),
)

export const CustomDatePicker = (props: CustomDatePickerProps) => (
  <div className="custom-date-picker">
    <DatePicker
      {...props}
      locale={ru}
      dateFormat="dd.MM.yyyy"
      placeholderText={props.placeholderText ?? 'ДД.ММ.ГГГГ'}
      calendarStartDay={1}
      showIcon
      toggleCalendarOnIconClick
      icon={<img src={calendarIcon} alt="" />}
      showPopperArrow={false}
      className="custom-date-picker__input"
      calendarClassName="custom-date-picker__calendar"
      popperClassName="custom-date-picker__popper"
      renderCustomHeader={({ date, changeMonth, changeYear }) => {
        const firstYear = props.minDate?.getFullYear() ?? Math.min(1900, date.getFullYear())
        const lastYear = props.maxDate?.getFullYear() ?? Math.max(2100, date.getFullYear())
        const years = Array.from(
          { length: Math.max(0, lastYear - firstYear + 1) },
          (_, index) => firstYear + index,
        )

        return (
          <div className="custom-date-picker__header">
            <select
              aria-label="Месяц"
              className="custom-date-picker__select"
              value={date.getMonth()}
              onChange={(event) => changeMonth(Number(event.target.value))}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              aria-label="Год"
              className="custom-date-picker__select"
              value={date.getFullYear()}
              onChange={(event) => changeYear(Number(event.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )
      }}
    />
  </div>
)
