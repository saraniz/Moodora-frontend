import type { ComponentProps } from "react";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

/** A labelled text input with an optional error. Works with react-hook-form's register(). */
export function Field({ label, error, id, ...input }: FieldProps) {
  const fieldId = id ?? input.name;
  return (
    <div className="field-group">
      <label htmlFor={fieldId}>{label}</label>
      <input
        {...input}
        id={fieldId}
        className="field"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
      {error && (
        <small id={`${fieldId}-error`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
