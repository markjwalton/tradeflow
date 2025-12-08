import React, { useState } from "react";
import { 
  Layout, Type, MousePointer, Square, FormInput, 
  Navigation as NavIcon, BarChart3, Bell, ChevronDown, ChevronRight,
  Mail, Settings, Users, Home, Star, Zap, Package, Plus, Edit, Trash2,
  BookOpen, Figma, Database, Grid3X3, Sparkles, Wrench, Download, Eye,
  Copy, Search, RefreshCw, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

// Typography
import { H1, H2, H3, H4, H5, H6, BodyText, MutedText, SmallText, LargeText, CodeText, LinkText, Caption } from "@/components/library/Typography";

// Buttons
import { PrimaryButton, SecondaryButton, OutlineButton, DestructiveButton, GhostButton, LinkButton, IconButton, LoadingButton, ButtonGroup, SplitButton } from "@/components/library/Buttons";

// Cards
import { BasicCard, ActionCard, FeatureCard, StatsCard, ProductCard, ProfileCard, TestimonialCard, ImageCard } from "@/components/library/Cards";

// Forms
import { TextField, TextAreaField, SelectField, CheckboxField, RadioField, SwitchField, SearchField, EmailField, PasswordField, DatePickerField } from "@/components/library/Forms";

// Layouts
import { Container, Section, Grid, Stack, Row, TwoColumn, EmptyState } from "@/components/library/Layouts";

// Navigation
import { NavItem, NavGroup, Breadcrumb, TabsNav, Pagination, Steps } from "@/components/library/Navigation";

// Data Display
import { DataList, KeyValue, StatusBadge, UserAvatar, ProgressBar, SimpleTable, TagList, TimelineItem, Metric } from "@/components/library/DataDisplay";

// Feedback
import { SuccessAlert, ErrorAlert, WarningAlert, InfoAlert, LoadingSpinner, SkeletonLoader, ToastNotification, UploadProgress, StatusDot, EmptyPlaceholder } from "@/components/library/Feedback";

// Tab definitions - each tab shows specific categories
const tabs = [
  { id: "all", label: "All Components", icon: BookOpen, categories: ["typography", "buttons", "cards", "forms", "layouts", "navigation", "dataDisplay", "feedback"] },
  { id: "tokens", label: "Design Tokens", icon: Sparkles, categories: [] },
  { id: "typography", label: "Typography", icon: Type, categories: ["typography"] },
  { id: "buttons", label: "Buttons", icon: MousePointer, categories: ["buttons"] },
  { id: "cards", label: "Cards", icon: Square, categories: ["cards"] },
  { id: "forms", label: "Forms", icon: FormInput, categories: ["forms"] },
  { id: "layout", label: "Layout", icon: Layout, categories: ["layouts"] },
  { id: "navigation", label: "Navigation", icon: NavIcon, categories: ["navigation"] },
  { id: "data", label: "Data Display", icon: Database, categories: ["dataDisplay"] },
  { id: "feedback", label: "Feedback", icon: Bell, categories: ["feedback"] },
];

// Component categories for navigation
const categories = [
  { id: "typography", label: "Typography", icon: Type, count: 13, color: "bg-primary" },
  { id: "buttons", label: "Buttons", icon: MousePointer, count: 11, color: "bg-secondary" },
  { id: "cards", label: "Cards", icon: Square, count: 8, color: "bg-accent" },
  { id: "forms", label: "Forms", icon: FormInput, count: 10, color: "bg-midnight-900" },
  { id: "layouts", label: "Layouts", icon: Layout, count: 12, color: "bg-primary" },
  { id: "navigation", label: "Navigation", icon: NavIcon, count: 8, color: "bg-secondary" },
  { id: "dataDisplay", label: "Data Display", icon: BarChart3, count: 9, color: "bg-accent" },
  { id: "feedback", label: "Feedback", icon: Bell, count: 11, color: "bg-midnight-900" },
];

// Section wrapper component - Matching Figma style
function ShowcaseSection({ id, title, description, count, children }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <section id={id} className="mb-6 scroll-mt-24 bg-card rounded-xl border border-border overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted transition-fast"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-display text-midnight-900">
            {title}
          </h3>
        </div>
        <ChevronDown className={cn("h-5 w-5 transition-transform", !expanded && "-rotate-90")} />
      </button>
      {expanded && (
        <div className="px-6 pb-6">
          {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
          <div className="space-y-6">{children}</div>
        </div>
      )}
    </section>
  );
}

// Component demo wrapper - Matching Figma card style
function ComponentDemo({ title, children, code }) {
  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-medium text-midnight-900">{title}</p>}
      <div className="p-4 bg-muted rounded-lg border border-border">
        {children}
      </div>
    </div>
  );
}

export default function ComponentShowcase() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get("tab") || "all";

    const [activeCategory, setActiveCategory] = useState("typography");
    const [activeMainTab, setActiveMainTab] = useState(tabFromUrl);

    // Update tab when URL changes - use popstate and manual check
    React.useEffect(() => {
      const updateTabFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab") || "all";
        setActiveMainTab(tab);
      };

      // Listen for browser back/forward
      window.addEventListener('popstate', updateTabFromUrl);

      // Also check on interval for programmatic navigation
      const interval = setInterval(updateTabFromUrl, 100);

      return () => {
        window.removeEventListener('popstate', updateTabFromUrl);
        clearInterval(interval);
      };
    }, []);
  
  // Get visible categories based on active tab
  const activeTabConfig = tabs.find(t => t.id === activeMainTab);
  const visibleCategories = activeTabConfig?.categories || [];
  
  // Form states
  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [switchValue, setSwitchValue] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");
  const [currentPage, setCurrentPage] = useState(3);
  const [currentStep, setCurrentStep] = useState(1);

  const scrollToSection = (id) => {
    setActiveCategory(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-midnight-900">
                Component Library
              </h1>
              <p className="text-sm text-muted-foreground">
                Production-ready components using Sturij design tokens
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Typography Section */}
        {visibleCategories.includes("typography") && (
          <ShowcaseSection
            id="typography"
          title="Typography"
          count={13}
          description="Semantic text components with consistent styling"
        >
          <ComponentDemo title="Headings (H1-H6)">
            <Stack spacing="md">
              <H1>Heading 1 - Degular Display</H1>
              <H2>Heading 2 - Section Titles</H2>
              <H3>Heading 3 - Subsections</H3>
              <H4>Heading 4 - Card Titles</H4>
              <H5>Heading 5 - Small Headings</H5>
              <H6>Heading 6 - Smallest</H6>
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Body Text Variants">
            <Stack spacing="md">
              <LargeText>Large Text - Emphasized body text for introductions</LargeText>
              <BodyText>Body Text - Main content using Mrs Eaves XL Serif font</BodyText>
              <MutedText>Muted Text - Secondary content with reduced emphasis</MutedText>
              <SmallText>Small Text - Captions and labels</SmallText>
              <Caption>Caption - Image captions and footnotes (italic)</Caption>
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Special Text">
            <Stack spacing="md">
              <div>
                <CodeText>const component = "CodeText";</CodeText>
              </div>
              <div>
                <LinkText href="#">LinkText - Clickable links with hover effects</LinkText>
              </div>
            </Stack>
          </ComponentDemo>
        </ShowcaseSection>
        )}

        {/* Buttons Section */}
        {visibleCategories.includes("buttons") && (
          <ShowcaseSection
            id="buttons"
          title="Buttons"
          count={11}
          description="All button variants with loading and disabled states"
        >
          <ComponentDemo title="Primary Buttons">
            <Row spacing="md" wrap>
              <PrimaryButton size="sm">Small</PrimaryButton>
              <PrimaryButton>Medium</PrimaryButton>
              <PrimaryButton size="lg">Large</PrimaryButton>
              <PrimaryButton disabled>Disabled</PrimaryButton>
            </Row>
          </ComponentDemo>

          <ComponentDemo title="Button Variants">
            <Row spacing="md" wrap>
              <PrimaryButton>Primary</PrimaryButton>
              <SecondaryButton>Secondary</SecondaryButton>
              <OutlineButton>Outline</OutlineButton>
              <DestructiveButton>Destructive</DestructiveButton>
              <GhostButton>Ghost</GhostButton>
              <LinkButton>Link</LinkButton>
            </Row>
          </ComponentDemo>

          <ComponentDemo title="Icon & Loading Buttons">
            <Row spacing="md" wrap>
              <IconButton aria-label="Settings"><Settings className="h-5 w-5" /></IconButton>
              <IconButton variant="primary" aria-label="Add"><Plus className="h-5 w-5" /></IconButton>
              <IconButton variant="secondary" aria-label="Edit"><Edit className="h-5 w-5" /></IconButton>
              <LoadingButton loading>Loading...</LoadingButton>
              <LoadingButton>Not Loading</LoadingButton>
            </Row>
          </ComponentDemo>

          <ComponentDemo title="Button Groups">
            <Stack spacing="md">
              <ButtonGroup>
                <PrimaryButton>Left</PrimaryButton>
                <PrimaryButton>Center</PrimaryButton>
                <PrimaryButton>Right</PrimaryButton>
              </ButtonGroup>
              <SplitButton onDropdownClick={() => alert("Dropdown clicked")}>
                Save Changes
              </SplitButton>
            </Stack>
          </ComponentDemo>
        </ShowcaseSection>
        )}

        {/* Cards Section */}
        {visibleCategories.includes("cards") && (
          <ShowcaseSection
            id="cards"
          title="Cards"
          count={8}
          description="Flexible card layouts for different use cases"
        >
          <ComponentDemo title="Basic & Action Cards">
            <Grid columns={2} gap="lg">
              <BasicCard title="Basic Card" description="A simple container for content">
                <BodyText>Card content goes here.</BodyText>
              </BasicCard>
              <ActionCard
                title="Action Card"
                description="Click to navigate or trigger action"
                icon={<Zap className="h-5 w-5" />}
                onClick={() => alert("Clicked!")}
              />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Feature Cards">
            <Grid columns={3} gap="md">
              <FeatureCard
                title="Standard Feature"
                description="Feature description here"
                icon={<Package className="h-6 w-6" />}
              />
              <FeatureCard
                title="Highlighted"
                description="Important feature"
                icon={<Star className="h-6 w-6" />}
                highlight
              />
              <FeatureCard
                title="Another Feature"
                description="More details"
                icon={<Zap className="h-6 w-6" />}
              />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Stats Cards">
            <Grid columns={4} gap="md">
              <StatsCard label="Revenue" value="$45,231" change={12.5} icon={<BarChart3 className="h-5 w-5" />} />
              <StatsCard label="Users" value="2,543" change={-3.2} icon={<Users className="h-5 w-5" />} />
              <StatsCard label="Orders" value="1,234" change={8.1} icon={<Package className="h-5 w-5" />} />
              <StatsCard label="Conversion" value="3.24%" icon={<Zap className="h-5 w-5" />} />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Profile & Testimonial Cards">
            <Grid columns={2} gap="lg">
              <ProfileCard
                name="Sarah Johnson"
                role="Product Designer"
                bio="Creating beautiful experiences for users."
                actions={<PrimaryButton size="sm">Connect</PrimaryButton>}
              />
              <TestimonialCard
                quote="This component library has saved us countless hours of development time."
                author="James Wilson"
                role="Engineering Lead"
                rating={5}
              />
            </Grid>
          </ComponentDemo>
        </ShowcaseSection>
        )}

        {/* Forms Section */}
        {visibleCategories.includes("forms") && (
          <ShowcaseSection
            id="forms"
          title="Forms"
          count={10}
          description="Form fields with labels and validation support"
        >
          <ComponentDemo title="Text Inputs">
            <Grid columns={2} gap="lg">
              <TextField
                label="Text Field"
                placeholder="Enter text..."
                value={textValue}
                onChange={setTextValue}
                hint="Helper text appears here"
              />
              <TextField
                label="With Error"
                placeholder="Enter text..."
                value=""
                error="This field is required"
                required
              />
              <EmailField
                label="Email"
                value=""
                onChange={() => {}}
              />
              <PasswordField
                label="Password"
                value=""
                onChange={() => {}}
              />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="TextArea & Date">
            <Grid columns={2} gap="lg">
              <TextAreaField
                label="Message"
                placeholder="Write your message..."
                rows={4}
              />
              <DatePickerField
                label="Select Date"
                value=""
                onChange={() => {}}
              />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Select, Search & Radio">
            <Grid columns={3} gap="lg">
              <SelectField
                label="Category"
                options={["Design", "Development", "Marketing"]}
                value={selectValue}
                onChange={setSelectValue}
              />
              <SearchField
                placeholder="Search..."
                value={searchValue}
                onChange={setSearchValue}
              />
              <RadioField
                label="Options"
                options={["Option 1", "Option 2", "Option 3"]}
                value={radioValue}
                onChange={setRadioValue}
              />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Checkbox & Switch">
            <Grid columns={2} gap="lg">
              <CheckboxField
                label="Accept terms"
                description="I agree to the terms and conditions"
                checked={checkboxValue}
                onChange={setCheckboxValue}
              />
              <SwitchField
                label="Email notifications"
                description="Receive updates via email"
                checked={switchValue}
                onChange={setSwitchValue}
              />
            </Grid>
          </ComponentDemo>
        </ShowcaseSection>
        )}

        {/* Layouts Section */}
        {visibleCategories.includes("layouts") && (
          <ShowcaseSection
            id="layouts"
          title="Layouts"
          count={12}
          description="Responsive layout primitives for page structure"
        >
          <ComponentDemo title="Grid System">
            <Stack spacing="lg">
              <div>
                <MutedText className="mb-2">3-Column Grid</MutedText>
                <Grid columns={3} gap="md">
                  <div className="p-4 bg-primary/10 rounded-lg text-center">Column 1</div>
                  <div className="p-4 bg-primary/10 rounded-lg text-center">Column 2</div>
                  <div className="p-4 bg-primary/10 rounded-lg text-center">Column 3</div>
                </Grid>
              </div>
              <div>
                <MutedText className="mb-2">4-Column Grid</MutedText>
                <Grid columns={4} gap="md">
                  <div className="p-4 bg-secondary/10 rounded-lg text-center">1</div>
                  <div className="p-4 bg-secondary/10 rounded-lg text-center">2</div>
                  <div className="p-4 bg-secondary/10 rounded-lg text-center">3</div>
                  <div className="p-4 bg-secondary/10 rounded-lg text-center">4</div>
                </Grid>
              </div>
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Two Column Layout">
            <TwoColumn
              ratio="2:1"
              gap="lg"
              left={
                <div className="p-6 bg-primary/10 rounded-lg">
                  <H5>Main Content (2fr)</H5>
                  <MutedText>Primary content area</MutedText>
                </div>
              }
              right={
                <div className="p-6 bg-secondary/10 rounded-lg">
                  <H5>Sidebar (1fr)</H5>
                  <MutedText>Secondary content</MutedText>
                </div>
              }
            />
          </ComponentDemo>

          <ComponentDemo title="Stack & Row">
            <Grid columns={2} gap="lg">
              <div>
                <MutedText className="mb-2">Stack (Vertical)</MutedText>
                <Stack spacing="sm">
                  <div className="p-3 bg-primary/10 rounded">Item 1</div>
                  <div className="p-3 bg-primary/10 rounded">Item 2</div>
                  <div className="p-3 bg-primary/10 rounded">Item 3</div>
                </Stack>
              </div>
              <div>
                <MutedText className="mb-2">Row (Horizontal)</MutedText>
                <Row spacing="sm">
                  <div className="p-3 bg-secondary/10 rounded">Item 1</div>
                  <div className="p-3 bg-secondary/10 rounded">Item 2</div>
                  <div className="p-3 bg-secondary/10 rounded">Item 3</div>
                </Row>
              </div>
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Empty State">
            <EmptyState
              title="No items yet"
              description="Get started by creating your first item."
              action={<PrimaryButton><Plus className="h-4 w-4 mr-2" />Create Item</PrimaryButton>}
            />
          </ComponentDemo>
        </ShowcaseSection>
        )}

        {/* Navigation Section */}
        {visibleCategories.includes("navigation") && (
          <ShowcaseSection
            id="navigation"
          title="Navigation"
          count={8}
          description="Navigation patterns and wayfinding components"
        >
          <ComponentDemo title="Nav Items & Groups">
            <div className="max-w-xs bg-card rounded-lg border border-border p-3">
              <NavGroup title="Main Menu">
                <NavItem icon={<Home className="h-4 w-4" />} label="Dashboard" active />
                <NavItem icon={<Users className="h-4 w-4" />} label="Team" badge="3" />
                <NavItem icon={<Package className="h-4 w-4" />} label="Projects" />
                <NavItem icon={<Settings className="h-4 w-4" />} label="Settings" />
              </NavGroup>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Breadcrumb">
            <Breadcrumb
              items={[
                { label: "Home", href: "#" },
                { label: "Projects", href: "#" },
                { label: "Project Alpha" },
              ]}
            />
          </ComponentDemo>

          <ComponentDemo title="Tabs">
            <Stack spacing="lg">
              <div>
                <MutedText className="mb-2">Underline Style</MutedText>
                <TabsNav
                  tabs={[
                    { value: "tab1", label: "Overview" },
                    { value: "tab2", label: "Analytics", count: 12 },
                    { value: "tab3", label: "Settings" },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </div>
              <div>
                <MutedText className="mb-2">Pills Style</MutedText>
                <TabsNav
                  variant="pills"
                  tabs={[
                    { value: "tab1", label: "Overview" },
                    { value: "tab2", label: "Analytics" },
                    { value: "tab3", label: "Settings" },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </div>
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Pagination & Steps">
            <Stack spacing="lg">
              <div>
                <MutedText className="mb-2">Pagination</MutedText>
                <Pagination
                  currentPage={currentPage}
                  totalPages={10}
                  onPageChange={setCurrentPage}
                />
              </div>
              <div>
                <MutedText className="mb-2">Steps</MutedText>
                <Steps
                  currentStep={currentStep}
                  steps={[
                    { label: "Details", description: "Basic info" },
                    { label: "Review", description: "Check details" },
                    { label: "Complete", description: "Finish" },
                  ]}
                />
              </div>
            </Stack>
          </ComponentDemo>
        </ShowcaseSection>
        )}

        {/* Data Display Section */}
        {visibleCategories.includes("dataDisplay") && (
          <ShowcaseSection
            id="dataDisplay"
          title="Data Display"
          count={9}
          description="Components for showing information beautifully"
        >
          <ComponentDemo title="Metrics & Stats">
            <Grid columns={4} gap="md">
              <Metric label="Total Revenue" value="$124,500" prefix="" trend="up" trendValue="+12.5%" />
              <Metric label="Active Users" value="8,942" trend="up" trendValue="+5.2%" />
              <Metric label="Bounce Rate" value="24.3" suffix="%" trend="down" trendValue="-2.1%" />
              <Metric label="Avg. Duration" value="4:32" />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Data List & Key-Value">
            <Grid columns={2} gap="lg">
              <DataList
                items={[
                  { label: "Full Name", value: "John Doe" },
                  { label: "Email", value: "john@example.com" },
                  { label: "Role", value: "Administrator" },
                  { label: "Status", value: "Active" },
                ]}
              />
              <Stack spacing="sm">
                <KeyValue label="Project" value="Alpha" inline />
                <KeyValue label="Status" value="In Progress" inline />
                <KeyValue label="Due Date" value="Dec 15, 2024" inline />
              </Stack>
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Status Badges & Avatars">
            <Stack spacing="lg">
              <Row spacing="md" wrap>
                <StatusBadge status="success" label="Active" />
                <StatusBadge status="warning" label="Pending" />
                <StatusBadge status="error" label="Failed" />
                <StatusBadge status="info" label="Processing" />
                <StatusBadge status="neutral" label="Draft" />
              </Row>
              <Row spacing="md">
                <UserAvatar name="John Doe" status="online" />
                <UserAvatar name="Jane Smith" status="busy" />
                <UserAvatar name="Bob Wilson" status="away" />
                <UserAvatar name="Alice Brown" status="offline" />
              </Row>
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Progress Bar">
            <Stack spacing="md">
              <ProgressBar value={75} label="Upload Progress" showValue color="primary" />
              <ProgressBar value={45} label="Project Complete" showValue color="secondary" />
              <ProgressBar value={90} label="Storage Used" showValue color="warning" />
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Tags & Table">
            <Stack spacing="lg">
              <TagList tags={["React", "TypeScript", "Tailwind", "Design System", "Components"]} />
              <SimpleTable
                columns={[
                  { header: "Name", accessor: "name" },
                  { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.statusType} label={row.status} /> },
                  { header: "Role", accessor: "role" },
                ]}
                data={[
                  { name: "John Doe", status: "Active", statusType: "success", role: "Admin" },
                  { name: "Jane Smith", status: "Pending", statusType: "warning", role: "Editor" },
                  { name: "Bob Wilson", status: "Inactive", statusType: "neutral", role: "Viewer" },
                ]}
                striped
              />
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Timeline">
            <div className="max-w-md">
              <TimelineItem
                title="Project Started"
                description="Initial kickoff meeting completed"
                date="Dec 1, 2024"
                icon={<Star className="h-4 w-4" />}
              />
              <TimelineItem
                title="Design Phase"
                description="Wireframes and mockups approved"
                date="Dec 5, 2024"
                icon={<Edit className="h-4 w-4" />}
              />
              <TimelineItem
                title="Development"
                description="Sprint 1 in progress"
                date="Dec 10, 2024"
                icon={<Zap className="h-4 w-4" />}
                isLast
              />
            </div>
          </ComponentDemo>
        </ShowcaseSection>
        )}

        {/* Feedback Section */}
        {visibleCategories.includes("feedback") && (
          <ShowcaseSection
            id="feedback"
          title="Feedback"
          count={11}
          description="User feedback and notification components"
        >
          <ComponentDemo title="Alerts">
            <Stack spacing="md">
              <SuccessAlert title="Success!" message="Your changes have been saved successfully." />
              <ErrorAlert title="Error" message="Something went wrong. Please try again." />
              <WarningAlert title="Warning" message="Your session will expire in 5 minutes." />
              <InfoAlert title="Info" message="New features are now available." />
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Toast Notifications">
            <Grid columns={2} gap="md">
              <ToastNotification type="success" title="Saved" message="Changes saved successfully" />
              <ToastNotification type="error" title="Error" message="Failed to save changes" />
              <ToastNotification type="warning" title="Warning" message="Check your connection" />
              <ToastNotification type="info" title="Update" message="New version available" />
            </Grid>
          </ComponentDemo>

          <ComponentDemo title="Loading States">
            <Row spacing="xl" align="start">
              <Stack spacing="sm" align="center">
                <MutedText>Spinners</MutedText>
                <Row spacing="md">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                </Row>
              </Stack>
              <Stack spacing="sm">
                <MutedText>Skeleton - Text</MutedText>
                <SkeletonLoader variant="text" lines={3} />
              </Stack>
              <Stack spacing="sm">
                <MutedText>Skeleton - Avatar</MutedText>
                <SkeletonLoader variant="avatar" />
              </Stack>
            </Row>
          </ComponentDemo>

          <ComponentDemo title="Status Dots & Upload Progress">
            <Stack spacing="lg">
              <Row spacing="lg">
                <StatusDot status="success" label="Online" pulse />
                <StatusDot status="warning" label="Away" />
                <StatusDot status="error" label="Offline" />
                <StatusDot status="info" label="Busy" />
              </Row>
              <Stack spacing="md">
                <UploadProgress fileName="document.pdf" progress={75} status="uploading" />
                <UploadProgress fileName="image.png" progress={100} status="complete" />
                <UploadProgress fileName="video.mp4" progress={35} status="error" />
              </Stack>
            </Stack>
          </ComponentDemo>

          <ComponentDemo title="Empty Placeholder">
            <EmptyPlaceholder
              icon={<Mail className="h-8 w-8" />}
              title="No messages"
              description="When you receive messages, they will appear here."
              action={<PrimaryButton size="sm">Compose</PrimaryButton>}
            />
          </ComponentDemo>
        </ShowcaseSection>
        )}


      </div>
    </div>
  );
}