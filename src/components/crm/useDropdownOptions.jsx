import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Custom hook to fetch dropdown options by set name
 * @param {string} setName - The name of the option set (e.g., 'Customer Types')
 * @returns {{ options: Array, isLoading: boolean, getActiveOptions: Function }}
 */
export function useDropdownOptions(setName) {
  const { data: optionSets = [], isLoading } = useQuery({
    queryKey: ['dropdownOptionSets'],
    queryFn: () => base44.entities.DropdownOptionSet.list(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const optionSet = optionSets.find((set) => set.name === setName);
  const options = optionSet?.options || [];

  const getActiveOptions = () => {
    return options
      .filter((opt) => opt.is_active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  return {
    options,
    isLoading,
    getActiveOptions,
  };
}

/**
 * Custom hook to fetch all dropdown option sets at once
 * @returns {{ optionSets: Object, isLoading: boolean, getOptions: Function }}
 */
export function useAllDropdownOptions() {
  const { data: optionSetsList = [], isLoading } = useQuery({
    queryKey: ['dropdownOptionSets'],
    queryFn: () => base44.entities.DropdownOptionSet.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Convert to a map for easy access
  const optionSets = optionSetsList.reduce((acc, set) => {
    acc[set.name] = set.options || [];
    return acc;
  }, {});

  const getOptions = (setName, activeOnly = true) => {
    const options = optionSets[setName] || [];
    if (activeOnly) {
      return options
        .filter((opt) => opt.is_active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return options.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  return {
    optionSets,
    isLoading,
    getOptions,
  };
}