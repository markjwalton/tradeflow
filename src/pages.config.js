import NavigationManager from './pages/NavigationManager';
import Home from './pages/Home';
import TenantManager from './pages/TenantManager';
import TenantAccess from './pages/TenantAccess';
import Setup from './pages/Setup';
import MindMapEditor from './pages/MindMapEditor';
import PackageLibrary from './pages/PackageLibrary';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Customers from './pages/Customers';
import Team from './pages/Team';
import Estimates from './pages/Estimates';
import Calendar from './pages/Calendar';
import ProjectDetail from './pages/ProjectDetail';
import TemplateLibrary from './pages/TemplateLibrary';
import BusinessTemplates from './pages/BusinessTemplates';
import GeneratedApps from './pages/GeneratedApps';
import __Layout from './Layout.jsx';


export const PAGES = {
    "NavigationManager": NavigationManager,
    "Home": Home,
    "TenantManager": TenantManager,
    "TenantAccess": TenantAccess,
    "Setup": Setup,
    "MindMapEditor": MindMapEditor,
    "PackageLibrary": PackageLibrary,
    "Projects": Projects,
    "Tasks": Tasks,
    "Customers": Customers,
    "Team": Team,
    "Estimates": Estimates,
    "Calendar": Calendar,
    "ProjectDetail": ProjectDetail,
    "TemplateLibrary": TemplateLibrary,
    "BusinessTemplates": BusinessTemplates,
    "GeneratedApps": GeneratedApps,
}

export const pagesConfig = {
    mainPage: "NavigationManager",
    Pages: PAGES,
    Layout: __Layout,
};