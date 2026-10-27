import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export { Sidebar, TopBar };

// Default Navbar export combines Sidebar & TopBar for full DevTrack navigation
export const Navbar = ({ mobileSidebarOpen, onToggleMobileSidebar, collapsed, onToggleCollapse }) => {
  return (
    <>
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => onToggleMobileSidebar && onToggleMobileSidebar(false)}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </>
  );
};

export default Navbar;
