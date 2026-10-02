import './Checkbox.css';

type CheckboxState = 'default' | 'opened' | 'checked';

interface CheckboxProps {
  state: CheckboxState;
}

export const Checkbox = ({ state }: CheckboxProps) => {
  return (
    <div className={`checkbox checkbox_${state}`}>
      {state === 'opened' && <span>−</span>}
      {state === 'checked' && <span>✓</span>}
    </div>
  );
};