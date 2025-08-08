"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search examples..." }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleToggle = React.useCallback(() => {
    if (isExpanded) {
      if (query) {
        setQuery("");
        onSearch("");
      }
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isExpanded, query, onSearch]);

  const handleClear = React.useCallback(() => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  const handleClose = React.useCallback(() => {
    if (!query) {
      setIsExpanded(false);
    }
  }, [query]);

  React.useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  React.useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    const handleScroll = () => {
      handleClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isExpanded, handleClose]);

  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (query) {
        setQuery("");
        onSearch("");
      } else {
        setIsExpanded(false);
      }
    }
  }, [query, onSearch]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center">
      <div
        className={`
          flex items-center gap-2 transition-all duration-300 ease-in-out
          ${isExpanded 
            ? "w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg" 
            : "w-auto"
          }
        `}
      >
        <button
          onClick={isExpanded && query ? handleClear : handleToggle}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={isExpanded && query ? "Clear search" : isExpanded ? "Close search" : "Open search"}
        >
          {isExpanded && query ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Search className="w-5 h-5 text-gray-600" />
          )}
        </button>
        
        {isExpanded && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </div>
      
      {!isExpanded && (
        <span className="ml-2 text-sm text-gray-600 hidden sm:inline">
          Search
        </span>
      )}
    </div>
  );
}