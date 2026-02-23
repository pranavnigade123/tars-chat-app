"use client";

import { SearchX, RefreshCw } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface NoSearchResultsEmptyProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export function NoSearchResultsEmpty({
  searchQuery,
  onClearSearch,
}: NoSearchResultsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[50vh]">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 sm:p-10">
          <SearchX className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" strokeWidth={1.5} />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        No users found
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-2 max-w-md leading-relaxed">
        We couldn't find anyone matching <span className="font-semibold text-gray-900">"{searchQuery}"</span>
      </p>
      <p className="text-sm text-gray-500 mb-8 max-w-md">
        Try adjusting your search or browse all available users
      </p>
      
      {/* Action */}
      <button
        onClick={onClearSearch}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Clear Search</span>
      </button>
    </div>
  );
}
