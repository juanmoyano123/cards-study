/**
 * Form Validation Hook
 * Provides real-time validation for forms
 */

import { useState, useCallback, useMemo } from 'react';

// Validation rules
export const validators = {
  required: (value: string) => {
    if (!value || value.trim() === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  match: (otherValue: string, fieldName: string) => (value: string) => {
    if (!value) return null;
    if (value !== otherValue) {
      return `${fieldName} do not match`;
    }
    return null;
  },

  password: (value: string) => {
    if (!value) return null;
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    // Optional: Add more password requirements
    // if (!/[A-Z]/.test(value)) {
    //   return 'Password must contain at least one uppercase letter';
    // }
    // if (!/[0-9]/.test(value)) {
    //   return 'Password must contain at least one number';
    // }
    return null;
  },
};

type ValidatorFn = (value: string) => string | null;

interface FieldConfig {
  validators: ValidatorFn[];
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
  isValid: boolean;
}

interface FormState {
  [key: string]: FieldState;
}

export function useFormValidation<T extends Record<string, FieldConfig>>(config: T) {
  const fieldNames = Object.keys(config) as (keyof T)[];

  const initialState: FormState = {};
  fieldNames.forEach((name) => {
    initialState[name as string] = {
      value: '',
      error: null,
      touched: false,
      isValid: false,
    };
  });

  const [fields, setFields] = useState<FormState>(initialState);

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      const fieldConfig = config[name as keyof T];
      if (!fieldConfig) return null;

      for (const validator of fieldConfig.validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    },
    [config]
  );

  const setValue = useCallback(
    (name: string, value: string) => {
      const fieldConfig = config[name as keyof T];
      const shouldValidate = fieldConfig?.validateOnChange !== false;

      setFields((prev) => {
        const error = shouldValidate && prev[name]?.touched ? validateField(name, value) : null;
        return {
          ...prev,
          [name]: {
            ...prev[name],
            value,
            error,
            isValid: error === null,
          },
        };
      });
    },
    [config, validateField]
  );

  const setTouched = useCallback(
    (name: string) => {
      setFields((prev) => {
        const error = validateField(name, prev[name]?.value || '');
        return {
          ...prev,
          [name]: {
            ...prev[name],
            touched: true,
            error,
            isValid: error === null,
          },
        };
      });
    },
    [validateField]
  );

  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newFields: FormState = {};

    fieldNames.forEach((name) => {
      const value = fields[name as string]?.value || '';
      const error = validateField(name as string, value);
      newFields[name as string] = {
        ...fields[name as string],
        touched: true,
        error,
        isValid: error === null,
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, fieldNames, validateField]);

  const reset = useCallback(() => {
    setFields(initialState);
  }, []);

  const getFieldProps = useCallback(
    (name: string) => ({
      value: fields[name]?.value || '',
      error: fields[name]?.touched ? fields[name]?.error : undefined,
      onChangeText: (value: string) => setValue(name, value),
      onBlur: () => setTouched(name),
    }),
    [fields, setValue, setTouched]
  );

  const isFormValid = useMemo(() => {
    return fieldNames.every((name) => {
      const field = fields[name as string];
      return field?.touched && field?.isValid;
    });
  }, [fields, fieldNames]);

  const values = useMemo(() => {
    const result: Record<string, string> = {};
    fieldNames.forEach((name) => {
      result[name as string] = fields[name as string]?.value || '';
    });
    return result as { [K in keyof T]: string };
  }, [fields, fieldNames]);

  return {
    fields,
    values,
    setValue,
    setTouched,
    validateAll,
    reset,
    getFieldProps,
    isFormValid,
  };
}

// Password strength calculator
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: 'Weak', color: '#EF4444' };
  } else if (score <= 4) {
    return { score, label: 'Fair', color: '#F59E0B' };
  } else if (score <= 5) {
    return { score, label: 'Good', color: '#3B82F6' };
  } else {
    return { score, label: 'Strong', color: '#10B981' };
  }
}
