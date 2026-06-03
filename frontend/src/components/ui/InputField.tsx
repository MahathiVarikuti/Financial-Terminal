interface InputFieldProps {
  label: string
  id: string
  type?: string
  value: string | number
  onChange: (val: string) => void
  placeholder?: string
  error?: string
  helper?: string
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  required?: boolean
}

export function InputField({
  label, id, type = 'text', value, onChange, placeholder,
  error, helper, prefix, suffix, min, max, step, disabled, required,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-cyan-600 text-sm font-bold pointer-events-none">{prefix}</span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            input-base
            ${prefix ? 'pl-7' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error ? 'border-rose-500/60 focus:border-rose-400' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-3 text-cyan-600 text-sm font-bold pointer-events-none">{suffix}</span>
        )}
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
      {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  )
}
