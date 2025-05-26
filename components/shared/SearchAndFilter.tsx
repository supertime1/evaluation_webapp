'use client';

import { Button } from '@/components/ui/button';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  label: string;
  value: string;
  active: boolean;
}

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onFilterChange?: (value: string) => void;
  className?: string;
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  className = ''
}: SearchAndFilterProps) {
  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>
      
      {/* Filter Buttons */}
      {filters.length > 0 && (
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={filter.active ? "default" : "outline"}
              onClick={() => onFilterChange?.(filter.value)}
              className="h-10"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
} 