// context/FilterContext.tsx
import React, { createContext, useContext, useState } from "react";
import { FilterOptions } from "@/types/jobs";

interface FilterContextType {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    machine: null,
    material: null,
    crewSkill: null,
    job: null,
    product: null,
    search: "",
    status: null,
  });

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
};
