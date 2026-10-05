import { useState } from 'react'
import checkIcon from '../../assets/check.svg'
import dashIcon from '../../assets/dash.svg'
import './Checkbox.css'

type CheckboxState = 'default' | 'opened' | 'checked'
type CheckboxMode = 'open' | 'check'

interface CheckboxProps {
  state: CheckboxState
  text: string
  mode: CheckboxMode
}

export const Checkbox = ({ state, text, mode }: CheckboxProps) => {
  const [currentState, setCurrentState] = useState<CheckboxState>(state)

  const handleClick = () => {
    if (mode === 'open') {
      setCurrentState(currentState === 'default' ? 'opened' : 'default')
      return
    }

    setCurrentState(currentState === 'default' ? 'checked' : 'default')
  }

  return (
    <label className="checkbox-wrapper">
      <span
        className={`checkbox checkbox_${currentState}`}
        onClick={handleClick}
      >
        {currentState === 'opened' && (
          <img className="checkboxicon" src={dashIcon} alt="" />
        )}

        {currentState === 'checked' && (
          <img className="checkboxicon" src={checkIcon} alt="" />
        )}
      </span>

      <span className="checkbox__text" onClick={handleClick}>
        {text}
      </span>
    </label>
  )
}