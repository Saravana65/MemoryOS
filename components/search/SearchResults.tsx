import React from 'react';
import { SearchResultItem } from '@/lib/types/search';
import { SearchResultCard } from './SearchResultCard';

interface SearchResultsProps {
  results: SearchResultItem[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {results.map((result) => (
        <SearchResultCard key={result.document_id} result={result} />
      ))}
    </div>
  );
};
export default SearchResults;
