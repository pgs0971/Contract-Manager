import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUpIcon, ChevronDownIcon, SelectorIcon } from '../components/Icons';

type SortDirection = 'ascending' | 'descending';

interface SortConfig<T> {
  key: keyof T | string; // Allow string for calculated keys like 'incurred'
  direction: SortDirection;
}

/**
 * A custom hook to manage table sorting logic.
 * @param items The array of items to sort.
 * @param initialConfig The initial sorting configuration.
 * @param customSorters An object of functions for custom sorting logic (e.g., for calculated columns).
 */
export const useSortableTable = <T extends {}>(
  items: T[],
  initialConfig: SortConfig<T> | null = null,
  customSorters?: { [key: string]: (a: T, b: T) => number }
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialConfig);

  const requestSort = useCallback((key: keyof T | string) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Use custom sorter if available
        if (customSorters && customSorters[sortConfig.key as string]) {
          const customSortResult = customSorters[sortConfig.key as string](a, b);
          return sortConfig.direction === 'ascending' ? customSortResult : -customSortResult;
        }

        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];

        if (aValue === undefined || aValue === null || aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (bValue === undefined || bValue === null || aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig, customSorters]);

  const getSortIcon = useCallback((key: keyof T | string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <SelectorIcon className="w-4 h-4 ml-1 text-text-muted/50" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ChevronUpIcon className="w-4 h-4 ml-1" /> 
      : <ChevronDownIcon className="w-4 h-4 ml-1" />;
  }, [sortConfig]);

  return { sortedItems, requestSort, getSortIcon };
};
