import NavigationManager from './pages/NavigationManager';
import Home from './pages/Home';
import TenantManager from './pages/TenantManager';
import TenantAccess from './pages/TenantAccess';
import __Layout from './Layout.jsx';


export const PAGES = {
    "NavigationManager": NavigationManager,
    "Home": Home,
    "TenantManager": TenantManager,
    "TenantAccess": TenantAccess,
}

export const pagesConfig = {
    mainPage: "NavigationManager",
    Pages: PAGES,
    Layout: __Layout,
};