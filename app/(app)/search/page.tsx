'use client';

import React, { useState, useEffect } from 'react';
import { searchDocuments } from '@/lib/api/search';
import { PaginatedSearchResult } from '@/lib/types/search';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<PaginatedSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (q: string, p: number, active: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchDocuments(q, p);
      if (active) {
        setResults(data);
      }
    } catch (err) {
      if (active) {
        setError('Failed to fetch search results. Please verify your connection.');
        setResults(null);
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      fetchResults(query.trim(), page, active);
    }, 450); // 450ms debounce

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, page]);

  const handleRetry = () => {
    let active = true;
    fetchResults(query.trim(), page, active);
  };

  const hasResults = results && results.items.length > 0;
  const isNoResults = results && results.items.length === 0 && query.trim() !== '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#E8ECE9] pb-4">
        <h1 className="text-3xl font-bold text-[#1C222E] font-serif">Semantic Vault Search</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">
          Perform a semantic lookup directly across text snippets processed in your personal archive.
        </p>
      </div>

      {/* Input query bar */}
      <SearchBar value={query} onChange={setQuery} />

      {/* Results View */}
      <div className="mt-8">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4 max-w-3xl mx-auto py-10 flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-[#4F6D60]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-500 font-sans">Scanning personal vault indexes...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <svg className="h-10 w-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700 font-sans font-medium mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-[#4F6D60] hover:bg-[#4F6D60]/90 text-white font-medium py-1.5 px-4 rounded text-xs transition-colors font-sans"
            >
              Retry Search
            </button>
          </div>
        )}

        {/* Empty State / Prompt */}
        {!query.trim() && !loading && !error && (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-[#E8ECE9] rounded-xl shadow-sm max-w-3xl mx-auto">
            <svg className="h-12 w-12 text-[#4F6D60] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-bold text-[#1C222E] font-serif mb-2">Search your documents</h3>
            <p className="text-sm text-gray-500 max-w-md font-sans">
              Type keywords or full natural language queries to instantly locate relevant source paragraphs.
            </p>
          </div>
        )}

        {/* No Results Found */}
        {isNoResults && !loading && !error && (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-[#E8ECE9] rounded-xl shadow-sm max-w-3xl mx-auto">
            <svg className="h-12 w-12 text-[#C5A059] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-[#1C222E] font-serif mb-2">No results found</h3>
            <p className="text-sm text-gray-500 max-w-md font-sans">
              We couldn't find any matches for "{query}" inside your ready vault documents. Try adjusting your query keywords.
            </p>
          </div>
        )}

        {/* Show Results List */}
        {hasResults && !loading && !error && results && (
          <div className="space-y-6">
            <SearchResults results={results.items} />

            {/* Pagination Controls */}
            {results.pages > 1 && (
              <div className="flex items-center justify-between max-w-3xl mx-auto pt-6 border-t border-[#E8ECE9]">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="bg-white border border-[#E8ECE9] hover:bg-[#FAF9F6] text-gray-700 font-medium py-1.5 px-4 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 font-sans">
                  Page {page} of {results.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, results.pages))}
                  disabled={page === results.pages}
                  className="bg-white border border-[#E8ECE9] hover:bg-[#FAF9F6] text-gray-700 font-medium py-1.5 px-4 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
