// Server-only reference list backing /api/roles. Job titles don't really
// change in realtime the way places do, so unlike locations (live
// geocoding via Nominatim) this is a broad static reference searched
// through a live endpoint — no free, keyless, truly live title-taxonomy
// API exists to wire up instead.
export const JOB_TITLES = [
  // Engineering
  "Software Engineer", "Senior Software Engineer", "Staff Software Engineer",
  "Principal Engineer", "Frontend Engineer", "Backend Engineer",
  "Full-Stack Engineer", "Mobile Engineer", "iOS Engineer", "Android Engineer",
  "DevOps Engineer", "Platform Engineer", "Site Reliability Engineer",
  "Infrastructure Engineer", "Security Engineer", "QA Engineer",
  "Test Automation Engineer", "Embedded Systems Engineer", "Firmware Engineer",
  "Data Engineer", "Machine Learning Engineer", "AI Engineer",
  "Computer Vision Engineer", "Solutions Architect", "Systems Architect",
  "Engineering Manager", "Director of Engineering", "VP of Engineering",
  "CTO",
  // Data & Analytics
  "Data Scientist", "Senior Data Scientist", "Data Analyst",
  "Business Intelligence Analyst", "Analytics Engineer", "Research Scientist",
  "Quantitative Analyst",
  // Product & Design
  "Product Manager", "Senior Product Manager", "Group Product Manager",
  "Director of Product", "VP of Product", "Product Owner",
  "Product Designer", "Senior Product Designer", "UX Designer",
  "UI Designer", "UX Researcher", "Design Lead", "Design Manager",
  "Design Systems Engineer", "Graphic Designer", "Brand Designer",
  "Motion Designer", "Industrial Designer",
  // Program & Project Management
  "Technical Program Manager", "Program Manager", "Project Manager",
  "Scrum Master", "Agile Coach", "Chief of Staff",
  // Sales & Marketing
  "Account Executive", "Sales Development Representative",
  "Business Development Representative", "Sales Manager",
  "Director of Sales", "VP of Sales", "Customer Success Manager",
  "Account Manager", "Marketing Manager", "Growth Marketer",
  "Performance Marketing Manager", "Content Strategist", "Content Writer",
  "SEO Specialist", "Social Media Manager", "Brand Manager",
  "Product Marketing Manager", "Demand Generation Manager",
  // Operations & Finance
  "Operations Manager", "Business Operations Analyst", "Supply Chain Manager",
  "Logistics Coordinator", "Office Manager", "Executive Assistant",
  "Financial Analyst", "Senior Financial Analyst", "Accountant",
  "Controller", "Finance Manager", "CFO", "Investment Analyst",
  "Bookkeeper",
  // People & Legal
  "Recruiter", "Technical Recruiter", "HR Business Partner",
  "HR Generalist", "People Operations Manager", "Talent Acquisition Manager",
  "Learning & Development Manager", "Paralegal", "Corporate Counsel",
  "Compliance Officer",
  // Customer & Support
  "Customer Support Specialist", "Customer Support Manager",
  "Technical Support Engineer", "Solutions Engineer", "Sales Engineer",
  "Implementation Specialist", "Onboarding Specialist",
  // Healthcare
  "Registered Nurse", "Nurse Practitioner", "Physician",
  "Physician Assistant", "Medical Assistant", "Pharmacist",
  "Physical Therapist", "Occupational Therapist", "Clinical Research Coordinator",
  // Education
  "Teacher", "Professor", "Instructional Designer", "Curriculum Developer",
  "Academic Advisor", "School Counselor",
  // Manufacturing & Trades
  "Mechanical Engineer", "Electrical Engineer", "Civil Engineer",
  "Manufacturing Engineer", "Quality Assurance Manager",
  "Plant Manager", "Electrician", "Plumber", "Construction Manager",
  // Hospitality & Retail
  "Store Manager", "Retail Associate", "Restaurant Manager", "Chef",
  "Event Coordinator", "Hotel Manager",
  // Leadership
  "Founder", "Co-Founder", "CEO", "COO", "General Manager",
].sort((a, b) => a.localeCompare(b));
