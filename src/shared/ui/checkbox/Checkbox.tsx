import './Checkbox.css';
import checkIcon from '../../../assets/images/check.svg'
import dashIcon from '../../../assets/images/dash.svg'

type CheckboxState = 'default' | 'opened' | 'checked';

interface CheckboxProps {
  state: CheckboxState;
}

export const Checkbox = ({ state }: CheckboxProps) => {
  return (
    <div className={`checkbox checkbox_${state}`}>
      {state === 'opened' && (<img className="checkbox__icon" src={dashIcon} alt='' />)}
      {state === 'checked' && (<img className="checkbox__icon" src={checkIcon} alt='' />)}
    </div>
  );
};