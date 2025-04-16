"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery.trim());
  };

  return (
    <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          onSearch(e.target.value.trim());
        }}
        placeholder="Buscar productos..."
        className="w-full px-4 py-2 pl-10 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#BB6A8C] focus:border-[#BB6A8C] bg-white"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BB6A8C] h-5 w-5" />
    </form>
  );
}