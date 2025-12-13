import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/components/common/useDebounce';
import { Search } from 'lucide-react';

const sampleItems = [
  'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry',
  'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon',
  'Mango', 'Orange', 'Papaya', 'Raspberry', 'Strawberry'
];

export default function SearchShowcase() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filteredItems = sampleItems.filter((item) =>
    item.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" data-component="searchCard">
      <div>
        <h3 className="text-lg font-display mb-2">Search & Debounce</h3>
        <p className="text-sm text-muted-foreground">
          Optimized search with 300ms debounce delay
        </p>
      </div>

      <div className="space-y-4" data-element="search-input">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Current value: <code className="px-2 py-1 bg-muted rounded">{search || '(empty)'}</code>
        </div>

        <div className="text-sm text-muted-foreground">
          Debounced value: <code className="px-2 py-1 bg-muted rounded">{debouncedSearch || '(empty)'}</code>
        </div>

        <div data-element="search-results" className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">
            Results ({filteredItems.length})
          </h4>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item}
                className="px-3 py-2 rounded-lg bg-muted text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}