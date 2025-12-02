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
import EntityLibrary from './pages/EntityLibrary';
import PageLibrary from './pages/PageLibrary';
import FeatureLibrary from './pages/FeatureLibrary';
import WorkflowDesigner from './pages/WorkflowDesigner';
import WorkflowLibrary from './pages/WorkflowLibrary';
import FormBuilder from './pages/FormBuilder';
import FormTemplates from './pages/FormTemplates';
import ChecklistBuilder from './pages/ChecklistBuilder';
import ChecklistTemplates from './pages/ChecklistTemplates';
import WebsiteEnquiryForm from './pages/WebsiteEnquiryForm';
import AppointmentHub from './pages/AppointmentHub';
import AppointmentConfirm from './pages/AppointmentConfirm';
import AppointmentManager from './pages/AppointmentManager';
import InterestOptionsManager from './pages/InterestOptionsManager';
import SystemSpecification from './pages/SystemSpecification';
import ERDEditor from './pages/ERDEditor';
import ProjectDetails from './pages/ProjectDetails';
import ProjectForm from './pages/ProjectForm';
import ProjectsOverview from './pages/ProjectsOverview';
import PromptSettings from './pages/PromptSettings';
import RoadmapManager from './pages/RoadmapManager';
import RoadmapJournal from './pages/RoadmapJournal';
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
    "EntityLibrary": EntityLibrary,
    "PageLibrary": PageLibrary,
    "FeatureLibrary": FeatureLibrary,
    "WorkflowDesigner": WorkflowDesigner,
    "WorkflowLibrary": WorkflowLibrary,
    "FormBuilder": FormBuilder,
    "FormTemplates": FormTemplates,
    "ChecklistBuilder": ChecklistBuilder,
    "ChecklistTemplates": ChecklistTemplates,
    "WebsiteEnquiryForm": WebsiteEnquiryForm,
    "AppointmentHub": AppointmentHub,
    "AppointmentConfirm": AppointmentConfirm,
    "AppointmentManager": AppointmentManager,
    "InterestOptionsManager": InterestOptionsManager,
    "SystemSpecification": SystemSpecification,
    "ERDEditor": ERDEditor,
    "ProjectDetails": ProjectDetails,
    "ProjectForm": ProjectForm,
    "ProjectsOverview": ProjectsOverview,
    "PromptSettings": PromptSettings,
    "RoadmapManager": RoadmapManager,
    "RoadmapJournal": RoadmapJournal,
}

export const pagesConfig = {
    mainPage: "NavigationManager",
    Pages: PAGES,
    Layout: __Layout,
};