import { createContext, useContext, useState } from 'react';

const PageHeaderContext = createContext(null);

export const usePageHeader = () => useContext(PageHeaderContext);

export function PageHeaderProvider({ children }) {
  const [actions, setActions] = useState([]);

  return (
    <PageHeaderContext.Provider value={{ actions, setActions }}>
      {children}
    </PageHeaderContext.Provider>
  );
}