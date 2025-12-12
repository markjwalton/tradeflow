/**
 * Mock data generators for development and testing
 */

export const mockGenerators = {
  /**
   * Generate random project data
   */
  project: (overrides = {}) => ({
    name: randomFromArray([
      'Victorian House Restoration',
      'Modern Office Complex',
      'Residential Extension',
      'Historic Building Conservation',
      'Commercial Renovation',
      'Bespoke Kitchen Design',
    ]),
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    status: randomFromArray(['Planning', 'Active', 'On Hold', 'Completed']),
    projectType: randomFromArray(['New Build', 'Extension', 'Renovation', 'Conservation', 'Commercial']),
    startDate: randomDate(-180, 0),
    estimatedEndDate: randomDate(30, 365),
    location: randomFromArray([
      '123 High Street, London',
      '45 Park Avenue, Manchester',
      '78 Queen Road, Bristol',
      '90 King Street, Edinburgh',
    ]),
    budget: randomNumber(50000, 500000),
    currentSpend: randomNumber(10000, 100000),
    isHighPriority: randomBoolean(0.3),
    ...overrides,
  }),

  /**
   * Generate random task data
   */
  task: (projectId, overrides = {}) => ({
    projectId,
    name: randomFromArray([
      'Site Survey',
      'Planning Permission',
      'Foundation Work',
      'Electrical Installation',
      'Plumbing',
      'Painting & Decorating',
      'Final Inspection',
    ]),
    description: 'Task description with details about the work required.',
    status: randomFromArray(['To Do', 'In Progress', 'Blocked', 'Completed', 'Snagging']),
    priority: randomFromArray(['Low', 'Medium', 'High', 'Critical']),
    startDate: randomDate(-30, 30),
    dueDate: randomDate(30, 90),
    estimatedHours: randomNumber(4, 40),
    actualHours: randomNumber(2, 35),
    ...overrides,
  }),

  /**
   * Generate random customer data
   */
  customer: (overrides = {}) => ({
    name: randomName(),
    company: randomBoolean(0.6) ? randomCompany() : '',
    email: randomEmail(),
    phone: randomPhone(),
    address: randomAddress(),
    notes: randomBoolean(0.5) ? 'Important client with multiple projects.' : '',
    ...overrides,
  }),

  /**
   * Generate random team member data
   */
  teamMember: (overrides = {}) => ({
    name: randomName(),
    email: randomEmail(),
    phone: randomPhone(),
    role: randomFromArray(['Architect', 'Project Manager', 'Carpenter', 'Electrician', 'Plumber', 'Designer']),
    skills: randomSubset(['Carpentry', 'Electrical', 'Plumbing', 'Design', 'CAD', 'Project Management'], 2, 4),
    availability: randomFromArray(['available', 'busy', 'on_leave', 'unavailable']),
    annual_holiday_days: 25,
    holidays_used: randomNumber(0, 15),
    ...overrides,
  }),

  /**
   * Generate random roadmap item data
   */
  roadmapItem: (overrides = {}) => ({
    title: randomFromArray([
      'User Authentication System',
      'Advanced Reporting Dashboard',
      'Mobile App Integration',
      'Payment Processing',
      'Notification System',
      'File Upload Manager',
    ]),
    description: 'Detailed description of the feature or requirement.',
    category: randomFromArray(['idea', 'requirement', 'feature', 'improvement', 'bug_fix']),
    priority: randomFromArray(['low', 'medium', 'high', 'critical']),
    status: randomFromArray(['backlog', 'planned', 'in_progress', 'completed']),
    source: randomFromArray(['user', 'ai_assistant', 'discussion']),
    tags: randomSubset(['frontend', 'backend', 'database', 'ui', 'api', 'security'], 1, 3),
    ...overrides,
  }),
};

// Helper functions
function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

function randomDate(daysOffset, daysRange) {
  const start = new Date();
  start.setDate(start.getDate() + daysOffset);
  const end = new Date(start);
  end.setDate(end.getDate() + daysRange);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomName() {
  const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Isabella', 'Henry', 'Charlotte'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`;
}

function randomCompany() {
  const prefixes = ['Tech', 'Digital', 'Creative', 'Modern', 'Smart'];
  const suffixes = ['Solutions', 'Designs', 'Studios', 'Group', 'Partners'];
  return `${randomFromArray(prefixes)} ${randomFromArray(suffixes)}`;
}

function randomEmail() {
  const domains = ['example.com', 'test.com', 'demo.com'];
  const name = randomName().toLowerCase().replace(' ', '.');
  return `${name}@${randomFromArray(domains)}`;
}

function randomPhone() {
  return `07${randomNumber(100, 999)} ${randomNumber(100, 999)}${randomNumber(100, 999)}`;
}

function randomAddress() {
  const streets = ['High Street', 'Park Avenue', 'Queen Road', 'King Street', 'Church Lane'];
  const cities = ['London', 'Manchester', 'Bristol', 'Edinburgh', 'Birmingham'];
  return `${randomNumber(1, 200)} ${randomFromArray(streets)}, ${randomFromArray(cities)}`;
}

function randomSubset(array, minItems, maxItems) {
  const count = randomNumber(minItems, Math.min(maxItems, array.length));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}