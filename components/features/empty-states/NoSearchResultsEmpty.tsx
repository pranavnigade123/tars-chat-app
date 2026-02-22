"use client";

import { SearchX } from "lucide-react";
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
    <EmptyState
      icon={<SearchX className="h-16 w-16 md:h-20 md:w-20" />}
      title="No users found"
      message={`No users match '${searchQuery}'. Try a different search term or browse all users.`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "secondary",
      }}
    />
  );
}
