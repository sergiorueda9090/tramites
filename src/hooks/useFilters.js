import { useState, useCallback, useMemo } from 'react';

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateMultipleFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback(
    (key) => {
      setFilters((prev) => ({
        ...prev,
        [key]: initialFilters[key] || '',
      }));
      setAppliedFilters((prev) => ({
        ...prev,
        [key]: initialFilters[key] || '',
      }));
    },
    [initialFilters]
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const activeFilters = useMemo(() => {
    return Object.entries(appliedFilters)
      .filter(([, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      })
      .map(([key, value]) => ({ key, value }));
  }, [appliedFilters]);

  const hasActiveFilters = useMemo(() => {
    return activeFilters.length > 0;
  }, [activeFilters]);

  const hasUnappliedChanges = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(appliedFilters);
  }, [filters, appliedFilters]);

  const filterData = useCallback(
    (data, filterFunctions = {}) => {
      return data.filter((item) => {
        return activeFilters.every(({ key, value }) => {
          // If there's a custom filter function for this key, use it
          if (filterFunctions[key]) {
            return filterFunctions[key](item, value);
          }

          // Default filtering logic
          const itemValue = item[key];
          if (itemValue === null || itemValue === undefined) return false;

          // String comparison (case-insensitive)
          if (typeof value === 'string' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }

          // Array comparison (item value should be in array)
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }

          // Exact match
          return itemValue === value;
        });
      });
    },
    [activeFilters]
  );

  return {
    // State
    filters,
    appliedFilters,
    // Computed
    activeFilters,
    hasActiveFilters,
    hasUnappliedChanges,
    // Actions
    updateFilter,
    updateMultipleFilters,
    applyFilters,
    clearFilters,
    clearFilter,
    resetFilters,
    filterData,
    // Direct setter for complex cases
    setFilters,
  };
};

export default useFilters;
