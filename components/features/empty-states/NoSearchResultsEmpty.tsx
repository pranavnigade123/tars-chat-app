"use client";

import { SearchX, RefreshCw } from "lucide-react";

interface NoSearchResultsEmptyProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export function NoSearchResultsEmpty({
  searchQuery,
  onClearSearch,
}: NoSearchResultsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      {/* Icon */}
      <div className="mb-4">
        <div className="rounded-2xl bg-gray-100 dark:bg-[#2a2a2a] p-5">
          <SearchX className="h-10 w-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No results found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        No users match "{searchQuery}"
      </p>
      
      {/* Action */}
      <button
        onClick={onClearSearch}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-[#333333] active:scale-95 transition-all"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Clear Search</span>
      </button>
    </div>
  );
}
