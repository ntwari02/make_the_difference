import { useState, useEffect, useCallback } from 'react';

// Custom hook for API calls
export const useApi = <T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

// Custom hook for local storage
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Custom hook for debouncing
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for pagination
export const usePagination = (totalItems: number, itemsPerPage: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
  };
};

// Custom hook for form handling
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: (values: T) => Record<string, string>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const setFieldTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateField = (name: keyof T, value: any) => {
    if (validationSchema) {
      const fieldErrors = validationSchema({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] || '' }));
    }
  };

  const validateForm = () => {
    if (validationSchema) {
      const formErrors = validationSchema(values);
      setErrors(formErrors);
      return Object.keys(formErrors).length === 0;
    }
    return true;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const setFormValues = (newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm,
    setFormValues,
    isValid: Object.keys(errors).length === 0,
  };
};

// Custom hook for permissions
export const usePermissions = (userRole?: string) => {
  const hasPermission = (resource: string, action: string): boolean => {
    // This would typically check against a permissions matrix
    // For now, we'll implement basic role-based checks
    if (!userRole) return false;
    
    const permissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      instructor: ['courses:read', 'courses:write', 'students:read'],
      student: ['courses:read', 'profile:write'],
      // Add more role permissions as needed
    };

    const userPermissions = permissions[userRole] || [];
    return userPermissions.includes('*') || userPermissions.includes(`${resource}:${action}`);
  };

  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(userRole || '');
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
  };
};

export default {
  useApi,
  useLocalStorage,
  useDebounce,
  usePagination,
  useForm,
  usePermissions,
};
