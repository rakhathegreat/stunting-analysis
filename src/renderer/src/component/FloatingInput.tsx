import React from 'react';

interface FloatingInputProps {
  id: string;
  label: string;
  value?: string | number;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        placeholder=" "
        className={`peer w-full border border-gray-300 placeholder-transparent px-6 py-3 text-base rounded-md focus:outline-none focus:border-blue-600 md:py-4 ${disabled ? ' text-gray-500' : 'text-gray-900'}`}
      />
      <label
        htmlFor={id}
        className="absolute left-5 text-gray-500 bg-white px-1 transition-all duration-200
          top-1/2 -translate-y-1/2

          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:-translate-y-1/2
          peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-400

          peer-focus:-top-2
          peer-focus:left-2
          peer-focus:-translate-y-0
          peer-focus:text-xs
          peer-focus:text-blue-600

          peer-[:not(:placeholder-shown)]:-top-2
          peer-[:not(:placeholder-shown)]:left-2
          peer-[:not(:placeholder-shown)]:-translate-y-0
          peer-[:not(:placeholder-shown)]:text-xs
          peer-[:not(:placeholder-shown)]:text-blue-600"
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;
