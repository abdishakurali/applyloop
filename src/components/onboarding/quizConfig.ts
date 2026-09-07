// Every screen's copy, in recorded order. Question/option text is
// reproduced verbatim from the source recording, including the
// fabricated stats/testimonials/comparison-chart interstitials — an
// explicit, confirmed product decision (see the plan doc). The trailing
// pricing-paywall screen from the recording is omitted: Applyloop has no
// pricing model. The recording's email-field-then-Google-button screen
// collapses into the wizard's final step, which renders the real
// Google/LinkedIn OAuth buttons directly.

export type QuestionScreen = {
  type: "question";
  id: string;
  question: string;
  options: string[];
  multi?: boolean;
};

export type SliderScreen = {
  type: "slider";
  id: string;
  question: string;
};

export type LocationScreen = {
  type: "location";
  id: string;
  question: string;
  regions?: string[];
};

export type TagsScreen = {
  type: "tags";
  id: string;
  question: string;
  helper: string;
};

export type InterstitialScreen = {
  type: "interstitial";
  id: string;
  headline: string;
  body?: string;
  variant?: "chart" | "bullets" | "bars" | "testimonial" | "loading";
  bullets?: string[];
  bars?: { label: string; pct: number; highlight?: boolean }[];
  stats?: string[];
};

export type QuizScreen =
  | QuestionScreen
  | SliderScreen
  | LocationScreen
  | TagsScreen
  | InterstitialScreen;

export const QUIZ_SCREENS: QuizScreen[] = [
  {
    type: "question",
    id: "goal",
    question: "What would you like to do?",
    options: [
      "Build your resume & cover letters",
      "Apply to jobs automatically",
      "Get AI help during interviews",
    ],
  },
  {
    type: "question",
    id: "search_approach",
    question: "How are you approaching your job search right now?",
    options: ["Actively searching", "Open to opportunities", "Just exploring"],
  },
  {
    type: "interstitial",
    id: "stat_65",
    headline: "65% of our members find a job within the 1st month",
    body: "Our members hear back 3x faster than the average candidate",
    variant: "chart",
  },
  {
    type: "question",
    id: "motivation",
    question: "What are you looking for?",
    multi: true,
    options: [
      "Urgent income for my basic needs",
      "First full-time job for career start",
      "Extra source of income",
      "Better work-life balance",
      "Secure, long-term job in my field",
      "To move up in my career",
      "Career switch to something new",
    ],
  },
  {
    type: "interstitial",
    id: "thanks_goals",
    headline: "Thanks for sharing your goals!",
  },
  {
    type: "question",
    id: "tried_ai",
    question: "Have you ever tried smart tools like AI to help your job search?",
    options: ["Yes", "Not sure", "No"],
  },
  {
    type: "question",
    id: "work_type",
    question: "What type of work are you open to?",
    options: ["Full-time", "Part-time", "Contract", "Internship"],
  },
  {
    type: "slider",
    id: "min_salary",
    question: "What's your desired minimum annual salary?",
  },
  {
    type: "question",
    id: "job_type",
    question: "What type of jobs do you prefer?",
    options: ["Fully remote", "Hybrid", "In-office"],
  },
  {
    type: "question",
    id: "remote_perk",
    question: "What do you like most about working remotely?",
    options: ["No commute", "Flexible schedule", "Work from anywhere", "Better focus", "More family time"],
  },
  {
    type: "location",
    id: "remote_location",
    question: "Where would you like to work remotely?",
    regions: ["North America", "South America", "Europe", "Asia", "Oceania", "Africa", "Worldwide"],
  },
  {
    type: "location",
    id: "onsite_location",
    question: "Where would you like to work on-site?",
  },
  {
    type: "question",
    id: "work_auth",
    question: "What's your work authorization status?",
    options: [
      "EU/EEA Citizen",
      "Permanent Residence Permit",
      "US Citizen",
      "National Work Visa/Permit",
      "Not authorized",
    ],
  },
  {
    type: "tags",
    id: "job_titles",
    question: "What job titles are you interested in?",
    helper: "Type a title, press Enter…",
  },
  {
    type: "question",
    id: "education",
    question: "What is your highest level of education?",
    options: [
      "No formal education",
      "High school",
      "Associate",
      "Bachelor's",
      "Master's",
      "Professional degree (JD, MD, etc.)",
      "Doctoral",
    ],
  },
  {
    type: "question",
    id: "professional_level",
    question: "What's your current professional level?",
    options: ["Entry", "Junior (<2 years)", "Middle (2-4 years)", "Senior (5+ years)", "Lead/Manager", "Director", "VP/C-level"],
  },
  {
    type: "question",
    id: "lower_roles",
    question: "Are you open to lower-level roles?",
    options: ["Yes, if necessary", "Maybe, if it's a good fit", "No, I only want my level or higher"],
  },
  {
    type: "question",
    id: "last_change",
    question: "When was your last job change?",
    options: [
      "Within the past year",
      "1-3 years ago",
      "More than 3 years ago",
      "I've never changed jobs",
      "I'm looking for my first job",
    ],
  },
  {
    type: "interstitial",
    id: "brutal_market",
    headline: "The job market got brutal",
    variant: "bullets",
    bullets: [
      "Hundreds of applicants per role",
      "Most resumes never reach a human",
      "80% of listings are stale or fake",
      "Endless repetitive application forms",
    ],
  },
  {
    type: "interstitial",
    id: "solved_puzzle",
    headline: "We've solved the job search puzzle",
    body: "We've analyzed 200 million jobs for over 1,084,240 users to match you to the right jobs, faster.",
  },
  {
    type: "question",
    id: "relate_applications",
    question: 'Do you relate to the following statement? "Every job I like on LinkedIn already has 200+ applications."',
    options: ["No", "Yes"],
  },
  {
    type: "question",
    id: "relate_blackhole",
    question: 'Do you relate to the following statement? "I\'m afraid my resume just disappears into a black hole."',
    options: ["No", "Yes"],
  },
  {
    type: "question",
    id: "schedule",
    question: "What schedule do you prefer?",
    options: ["Flexible hours", "9 to 5 fixed schedule"],
  },
  {
    type: "question",
    id: "company_size",
    question: "What company size do you prefer?",
    options: ["Startup", "Mid-size", "Corporation"],
  },
  {
    type: "question",
    id: "benefits",
    question: "What benefits matter most to you?",
    multi: true,
    options: [
      "Health insurance",
      "401k / pension",
      "Paid time off",
      "Remote flexibility",
      "Stock options",
      "Learning budget",
      "Parental leave",
      "Gym / wellness",
    ],
  },
  {
    type: "interstitial",
    id: "hidden_jobs",
    headline: "Access 750k+ hidden jobs monthly",
    body: "Most job openings are never publicly listed.",
  },
  {
    type: "interstitial",
    id: "smarter_match",
    headline: "A smarter way to find jobs",
    body: "Our matching beats generic job boards on relevance",
    variant: "bars",
    bars: [
      { label: "LinkedIn / Indeed", pct: 38 },
      { label: "Our match", pct: 91, highlight: true },
    ],
  },
  {
    type: "question",
    id: "time_available",
    question: "How much time can you spend applying daily?",
    options: ["3-4 hours", "1-2 hours", "30-60 mins", "10-30 mins", "Too busy to apply"],
  },
  {
    type: "question",
    id: "blockers",
    question: "What stops you from applying to more jobs?",
    multi: true,
    options: [
      "I don't have enough time",
      "Forms are exhausting",
      "Too many options to track",
      "Deadlines pass too quickly",
      "Lose track of applications",
      "Get distracted from applying",
    ],
  },
  {
    type: "interstitial",
    id: "matching_loading",
    headline: "Matching you with jobs based on your profile",
    variant: "loading",
    stats: ["Categories & experience", "Work preferences", "Location & remote", "Personal goals"],
  },
  {
    type: "interstitial",
    id: "social_proof",
    headline: "443 people received interview invitations this week",
    body: "152 people found jobs this month",
    variant: "testimonial",
  },
];
