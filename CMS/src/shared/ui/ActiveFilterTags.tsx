import { X } from 'lucide-react';

interface ActiveFilter<K extends string = string> {
  key: K;
  label: string;
  value: string;
}

interface ActiveFilterTagsProps<K extends string = string> {
  filters: ActiveFilter<K>[];
  onRemove: (key: K) => void;
}

export function ActiveFilterTags<K extends string = string>({
  filters,
  onRemove,
}: ActiveFilterTagsProps<K>) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <div
          key={filter.key}
          className="flex items-center space-x-1 text-blue-600 font-bold"
        >
          <span className="text-sm pb-1 border-b-2 border-blue-600">
            {filter.label}: {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.key)}
            className="hover:bg-blue-50 rounded-full p-0.5 transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
