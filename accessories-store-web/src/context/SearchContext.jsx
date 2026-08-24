import { createContext, useContext, useState } from "react";  
  
const SearchContext = createContext(null);  
  
export function SearchProvider({ children }) {  
  const [searchQuery, setSearchQuery] = useState("");  
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);  
  return (  
    <SearchContext.Provider  
      value={{ searchQuery, setSearchQuery, shouldFocusSearch, setShouldFocusSearch }}  
    >  
      {children}  
    </SearchContext.Provider>  
  );  
}  
  
export function useSearch() {  
  return useContext(SearchContext);  
}