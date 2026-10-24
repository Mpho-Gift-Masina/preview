import type { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  half?: boolean;
  children: ReactNode;
}

/** Label + input + error message for checkout forms. `half` makes it half width on larger screens. */
export function Field({ id, label, error, optional, half, children }: Props) {
  return (
    <div className={`field ${half ? 'field--half' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

/** ARIA wiring that links an input to its Field error message. */
export function errorProps(id: string, error?: string) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-err` : undefined,
  };
}
