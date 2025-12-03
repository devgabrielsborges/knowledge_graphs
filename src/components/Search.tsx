'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Plus, Loader2 } from 'lucide-react';
import { searchPapers } from '@/lib/api';
import { Paper } from '@/types';

interface SearchProps {
  onAddPaper: (paper: Paper) => void;
}

const Search = ({ onAddPaper }: SearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const papers = await searchPapers(searchQuery);
      setResults(papers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, 500);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    performSearch(query);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 w-80 shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-800 shrink-0">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Search Papers</h2>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keywords, title..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          results.map((paper) => (
            <div key={paper.paperId} className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:shadow-md dark:hover:bg-neutral-800 transition-all">
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">{paper.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {paper.year} • {paper.authors[0]?.name} {paper.authors.length > 1 && `+ ${paper.authors.length - 1} others`}
              </p>
              <button
                onClick={() => onAddPaper(paper)}
                className="flex items-center justify-center w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add to Graph
              </button>
            </div>
          ))
        )}
        {!loading && results.length === 0 && query && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">No results found</p>
        )}
      </div>
    </div>
  );
};

export default Search;
