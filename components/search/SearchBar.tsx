import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search your documents..." }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center border border-[#E8ECE9] rounded-lg bg-white p-3 shadow-sm focus-within:border-[#4F6D60] focus-within:ring-1 focus-within:ring-[#4F6D60] transition-all">
        {/* Search icon */}
        <svg className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-[#1C222E] font-sans placeholder-gray-400"
        />

        {/* Clear query button */}
        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
export default SearchBar;
