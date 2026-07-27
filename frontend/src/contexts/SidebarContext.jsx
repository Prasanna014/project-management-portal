import React, { createContext, useContext, useState } from "react";

export const SIDEBAR_EXPANDED_WIDTH  = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
  drawerWidth: SIDEBAR_EXPANDED_WIDTH,
});

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const toggle = () => setCollapsed((c) => !c);
  const drawerWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, drawerWidth }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
