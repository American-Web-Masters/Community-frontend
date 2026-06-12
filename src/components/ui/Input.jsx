import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = '',
  error = null,
  icon: Icon = null,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            ${Icon ? 'pl-12' : 'pl-4'} 
            pr-4 py-4 
            bg-white/80 
            backdrop-blur-sm 
            border border-white/30 
            rounded-xl 
            text-gray-800 
            placeholder-gray-400
            focus:outline-none 
            focus:ring-1 
            focus:ring-primary-500 
            focus:border-primary-500
            transition-all duration-200
            shadow-sm
            ${error ? 'border-red-400 focus:ring-red-500/50' : ''}
            w-full
            ${className} !important
          `}
          {...props}
        />
        {props.endContent && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {props.endContent}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;