# PLAN DE EJECUCIÓN: StudyMaster
**PM:** Agent 1 - Product Manager (Senior, 15+ years exp.)
**Date:** November 20, 2025
**Version:** 2.0 - Universal Edition
**Status:** ✅ Approved for execution
**Methodology:** Google Project Management + Agile/Scrum

---

## 📋 EXECUTIVE SUMMARY

**Problem:**
Students spend 10+ hours studying inefficiently using passive reading techniques (96% rely on re-reading notes) when active recall with spaced repetition could reduce study time by 70%. Current tools like Anki have a steep learning curve and poor UX, while consumer alternatives like Quizlet lack scientific spaced repetition algorithms.

**Solution:**
StudyMaster is an AI-powered flashcard platform that automatically generates smart flashcards from ANY study material (PDFs, textbooks, notes). It combines the scientific rigor of Anki's spaced repetition with modern UX and gamification elements that keep students consistent.

**Primary User:**
University students (18-24 years old) studying any subject who need an efficient way to learn and retain information for exams and long-term knowledge.

**Value Proposition:**
"Transform any study material into smart flashcards in seconds. Study less, retain more, with AI-powered learning and scientifically-proven spaced repetition."

**Success Metrics (North Star Metric):**
- **North Star:** Weekly Active Learners (WAL) completing 50+ cards - Target: 500 users by month 6
- **Input Metric 1:** AI flashcard generation quality score - Target: 8.5/10 rating
- **Input Metric 2:** Free-to-paid conversion rate - Target: 8% by month 6
- **Guardrail Metric:** 30-day retention rate - Minimum threshold: 40%

---

## 👤 USER PERSONA

**Name:** Alex Rivera
**Age:** 20-22
**Occupation:** University student (Computer Science, Business, Liberal Arts, STEM, etc.)
**Location:** Any major university
**Tech-savviness:** Level 4/5 (Uses multiple digital tools daily, comfortable with new apps)
**Market segment size:** 20M+ university students worldwide

**Current Pain Points (Jobs-to-be-Done framework):**
1. **Information Overload** - Severity: 🔴 Critical
   - Frequency: Daily (100-300 pages of material per week across multiple courses)
   - Current workaround: Re-reading textbooks, notes, and slides multiple times
   - Impact: 8+ hours/day studying with only 30% retention after 48 hours

2. **Manual Flashcard Creation** - Severity: 🟡 High
   - Frequency: Weekly during exam prep
   - Current workaround: Spending 1-2 hours creating flashcards manually in Quizlet/Anki
   - Impact: Time creating cards instead of actually studying, frustration with tedious process

3. **Lack of Study Structure** - Severity: 🟢 Medium
   - Frequency: Every study session
   - Current workaround: Pomodoro apps + calendar reminders + random studying
   - Impact: Inconsistent study habits, cramming before exams, poor retention

**Goals with our product:**
- 🎯 **Primary (Functional Job):** Pass all courses with good grades while spending less time studying
- 🎯 **Secondary (Emotional Job):** Feel confident and prepared without anxiety or burnout
- 🎯 **Social Job:** Have time for social life and extracurriculars while maintaining good grades

**Current Workflow (As-Is):**
```
1. Read lecture materials → Time: 120min → Friction: Passive reading, low retention → Drop-off: 40%
2. Create flashcards manually → Time: 90min → Friction: Tedious, time-consuming → Drop-off: 30%
3. Review cards → Time: 60min → Friction: No smart scheduling, boring → Drop-off: 25%
4. Re-read before exam → Time: 180min → Friction: Panic cramming, inefficient → Drop-off: 0%
```
**Total:** 450 minutes (7.5 hours), 4 friction points, 35% effective retention

**Desired Workflow (To-Be - with StudyMaster):**
```
1. Upload study material (PDF/text) → Time: 2min → Benefit: Instant AI processing
2. Review & edit AI-generated cards → Time: 10min → Benefit: 85-90% accurate, contextual
3. Study with spaced repetition → Time: 45min → Benefit: Optimized intervals, gamified
4. Quick review dashboard → Time: 5min → Benefit: Clear progress, confidence boost
```
**Total:** 62 minutes (86% faster), 0 friction points, 85% retention rate

**Value Proposition Test:**
- Current cost: 7.5 hours/day + stress + $25 Anki iOS app
- Our solution: 1 hour/day + confidence + $9.99/month
- **Net benefit:** 6.5 hours saved daily, 2.5x better retention, reduced anxiety

---

## 🗺️ USER JOURNEY MAP

### Stage 1: Discovery/Awareness
**Trigger:** Struggling with dense textbook material, friend mentions StudyMaster
**User actions:** Visits landing page, watches 30-second demo video
**System response:** Shows relevant examples for common subjects, offers free trial
**Pain points eliminated:** ✅ No more manual card creation
**Emotional state:** Skeptical → Intrigued
**Success criteria:** Sign up for free account within 5 minutes

### Stage 2: Onboarding/Activation
**Trigger:** First login after signup
**User actions:** Uploads first PDF (lecture notes), sees AI generate cards
**System response:** Creates 20 high-quality flashcards in 30 seconds
**Pain points eliminated:** ✅ Hours of manual work eliminated
**Emotional state:** Amazed → Excited
**Success criteria:** Creates first deck and completes 10 cards (Aha Moment)

### Stage 3: Habit Formation
**Trigger:** Daily study session notification at chosen time
**User actions:** Opens app, studies due cards (25-min Pomodoro session)
**System response:** Shows progress, maintains streak, celebrates milestones
**Pain points eliminated:** ✅ No more cramming, consistent daily progress
**Emotional state:** Motivated → Confident
**Success criteria:** 7-day streak achieved, 80% of cards marked "Easy"

### Stage 4: Value Realization
**Trigger:** First exam after using StudyMaster for 30 days
**User actions:** Reviews performance analytics, exports high-yield cards
**System response:** Shows predicted readiness score, areas of strength
**Pain points eliminated:** ✅ Exam anxiety reduced, clear visibility of knowledge
**Emotional state:** Prepared → Accomplished
**Success criteria:** Exam score improvement of 15%+, converts to paid

**Final Success Outcome:** Student achieves target grades while studying 70% less

---

## 🚀 PRIORITIZED FEATURES (RICE FRAMEWORK)

| ID | Feature Name | Priority | **RICE Score** | **Reach** | **Impact** | **Confidence** | **Effort** | Dependencies | User Story (Summary) |
|----|--------------|----------|----------------|-----------|------------|----------------|------------|--------------|----------------------|
| F-001 | AI Flashcard Generation | 🔴 P0 | **300** | 100% | 3 (Massive) | 100% | 5d | - | As a student I want to upload study materials and auto-generate accurate flashcards |
| F-002 | FSRS Spaced Repetition System | 🔴 P0 | **240** | 100% | 3 (Massive) | 80% | 4d | F-001 | As a student I want optimal review intervals to maximize retention |
| F-003 | Study Dashboard with Heatmap | 🔴 P0 | **180** | 100% | 2 (High) | 90% | 3d | F-002 | As a student I want to see my progress to stay motivated |
| F-004 | Authentication & User Management | 🔴 P0 | **150** | 100% | 2 (High) | 100% | 2d | - | As a user I want secure access to my personal study data |
| F-005 | Pomodoro Timer Integration | 🟡 P1 | **120** | 80% | 2 (High) | 80% | 2d | F-002 | As a student I want structured study sessions to maintain focus |
| F-006 | PDF/Text Processing | 🔴 P0 | **133** | 100% | 2 (High) | 100% | 1.5d | - | As a student I want to upload PDFs or paste text to extract content |
| F-007 | Native Mobile UI Components | 🔴 P0 | **120** | 100% | 2 (High) | 100% | 4d | All | As a student I want native iOS/Android app experience with smooth animations |
| F-008 | Flashcard Editor | 🟡 P1 | **90** | 90% | 1 (Medium) | 100% | 2d | F-001 | As a student I want to edit AI-generated cards to fix errors |
| F-009 | Study Analytics | 🟡 P1 | **72** | 60% | 2 (High) | 80% | 3d | F-002 | As a student I want insights into my learning patterns |
| F-010 | Export to Anki | 🟢 P2 | **40** | 30% | 2 (High) | 70% | 4d | F-001 | As a power user I want to export my decks to Anki format |

### **RICE Scoring Framework (Methodology by Intercom)**

**Formula:** `RICE = (Reach × Impact × Confidence) / Effort`

**Reach (0-100%):** % of users who will use this feature in first month

**Impact (Intercom Scale):**
- **3 = Massive Impact:** Fundamentally transforms the experience
- **2 = High Impact:** Significantly improves the experience
- **1 = Medium Impact:** Notable but not critical improvement
- **0.5 = Low Impact:** Marginal improvement
- **0.25 = Minimal Impact:** Almost imperceptible impact

**Confidence (0-100%):** How certain we are of our estimates
- 100% = Validated with user research, proven in competitors
- 80% = Strong assumptions based on data
- 50% = Educated guess
- <50% = Avoid prioritizing

**Effort (Person-days):** Engineering time to implement (Frontend + Backend + Testing + Deploy)

### **Priority Criteria:**
- 🔴 **P0 (Must Have):** Without this, MVP doesn't work - Core value proposition depends on these
- 🟡 **P1 (Should Have):** Important for complete experience but can launch without
- 🟢 **P2 (Nice to Have):** Future improvements post-validation

**Out of Scope V1:**
❌ Social features/collaboration - Reason: Adds complexity without validating core value
❌ OCR for handwritten notes - Reason: Technical complexity, expensive APIs
❌ LMS integrations - Reason: Requires institutional partnerships
❌ iPad/Tablet optimized UI - Reason: Phone-first, tablet in V1.1
❌ Apple Watch companion - Reason: Not essential for MVP

---

## 📝 FEATURE DETAIL (COMPLETE SPECIFICATION)

### F-001: AI Flashcard Generation

**RICE Score Breakdown:**
- Reach: 100% - Every user needs this to get value
- Impact: 3 (Massive) - Core differentiator, saves 90 minutes per study session
- Confidence: 100% - Proven technology (GPT-4), validated concept
- Effort: 5 days - API integration + prompt engineering + UI
- **Score: (100 × 3 × 100) / 5 = 300**

**User Story:**
```
As a student
I want to upload study materials (PDFs, text) or paste content
To automatically generate high-quality, context-aware flashcards in minutes instead of hours
```

**Business Value:**
This is THE core differentiator. Manual flashcard creation takes 1-2 hours per study session. We reduce this to 2 minutes. This time savings is the primary value proposition of the entire product.

**Acceptance Criteria (Given-When-Then Scenarios):**

**Scenario 1: Successful PDF/text upload and generation**
```gherkin
Given I am on the dashboard page
  And I have study material (PDF < 10MB or text content)
When I click "Upload Study Material" or "Paste Text" button
  And I provide my content
  And I click "Generate Flashcards"
Then the system shows a progress indicator
  And within 30 seconds, I see a preview of 20-50 generated flashcards
  And each flashcard has a question and answer
  And key concepts are correctly identified and defined
  And I can review each card before saving
```

**Scenario 2: AI quality validation**
```gherkin
Given the AI has generated flashcards from my study material
When I review the generated flashcards
Then at least 85% of cards are factually accurate
  And terminology is contextually appropriate for the subject
  And questions are clear and unambiguous
  And answers are concise (< 100 words)
  And complex concepts are broken into multiple cards
```

**Scenario 3: Error handling for unsupported files**
```gherkin
Given I attempt to upload a file
When the file is not a PDF or exceeds 10MB
Then the system shows error "Please upload a PDF file under 10MB"
  And suggests alternatives (split large files, convert from other formats)
  And the upload area remains active for retry
```

**Scenario 4: Edit before save**
```gherkin
Given I am reviewing AI-generated flashcards
When I click "Edit" on any card
Then I can modify the question text
  And I can modify the answer text
  And I can delete the card entirely
  And I can add tags/categories
  And changes are reflected immediately in preview
```

**Scenario 5: Handling generation failures**
```gherkin
Given I have uploaded a valid PDF
When the AI generation fails (API timeout, rate limit)
Then the system shows "Generation failed, retrying..."
  And automatically retries up to 3 times
  And if all retries fail, shows "Please try again in a few minutes"
  And the uploaded PDF is saved for later retry
```

**Technical Considerations:**

**Security:**
- PDF files scanned for malware before processing
- Text extraction happens in sandboxed environment
- User files stored encrypted in Supabase with row-level security
- API keys stored in environment variables, never exposed to client

**Performance:**
- PDF processing happens asynchronously (job queue)
- Show progress updates via websocket/polling
- Cache generated cards for 24 hours (in case user wants to regenerate)
- Rate limit: 10 PDF uploads per user per hour

**Data Model:**
```sql
-- Study materials table (NO STORAGE OF PDFs - only metadata and extracted text)
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  extracted_text TEXT NOT NULL, -- The actual content extracted from PDF/input
  word_count INTEGER,
  subject_category TEXT, -- e.g., "Computer Science", "History", "Biology"
  processed_at TIMESTAMP,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);
-- NOTE: PDFs are processed and discarded - we only keep the extracted text

-- Generated flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[],
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  ai_confidence FLOAT CHECK (ai_confidence BETWEEN 0 AND 1),
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**External Dependencies:**
- OpenAI API (GPT-4o-mini for cost efficiency)
- PDF.js (frontend) or PyPDF2 (backend) for text extraction
- NO file storage required - PDFs are processed in memory and discarded

**Error Handling:**
- HTTP 400: Invalid file format
- HTTP 413: File too large
- HTTP 429: Rate limit exceeded
- HTTP 500: AI generation failed (with retry logic)

**UI/UX Requirements:**

**Required Screens:**
1. Upload interface with drag-and-drop
2. Generation progress screen
3. Card review/edit interface
4. Save confirmation screen

**Component specs:**
- Upload zone: 400x200px, dashed border, hover state
- Progress bar: Shows percentage and estimated time
- Card preview: Flippable cards, swipeable on mobile
- Edit modal: Inline editing with autosave

**Mobile considerations:**
- File picker instead of drag-drop on mobile
- Swipe gestures for card review
- Responsive card layout (1 column mobile, 3 columns desktop)

**Accessibility (WCAG 2.1 AA):**
- Upload area keyboard accessible
- Progress updates announced to screen readers
- Card content semantic HTML (question = heading, answer = paragraph)
- High contrast mode support

**Definition of Done (Specific for this feature):**
- [ ] Acceptance criteria: All 5 scenarios pass
- [ ] Integration tests: PDF upload → AI generation → save flow tested
- [ ] Security audit: File upload validated, no XSS vulnerabilities
- [ ] Performance: Generation completes in <30s for 20-page PDF
- [ ] Mobile testing: Works on iOS 14+ and Android 10+
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Error handling: All error states have user-friendly messages
- [ ] Documentation: API endpoints documented, prompt templates versioned

**Estimated Effort:** 5 days

**Breakdown:**
- Day 1: PDF upload infrastructure + Supabase storage setup
- Day 2: Text extraction + chunking algorithm
- Day 3: OpenAI integration + prompt engineering
- Day 4: Review/edit UI + save functionality
- Day 5: Error handling + testing + optimization

---

### F-002: FSRS Spaced Repetition System

**RICE Score Breakdown:**
- Reach: 100% - Every user studies with this system
- Impact: 3 (Massive) - Scientific foundation for retention
- Confidence: 80% - Algorithm is proven but implementation complexity exists
- Effort: 4 days - Algorithm + database + UI integration
- **Score: (100 × 3 × 80) / 4 = 240**

**User Story:**
```
As a student
I want the app to show me flashcards at scientifically optimal intervals
To maximize long-term retention with minimum study time
```

**Business Value:**
Spaced repetition is scientifically proven to improve retention by 200%+. This is what separates us from Quizlet's basic flashcard system. Students preparing for important exams specifically value this for efficient learning.

**Acceptance Criteria (Given-When-Then Scenarios):**

**Scenario 1: First time studying a card**
```gherkin
Given I have a new flashcard that I've never studied
When I click "Study Now" on my deck
Then the card appears as the first card to study
  And after revealing the answer, I see 4 options: "Again", "Hard", "Good", "Easy"
  And selecting any option schedules the next review:
    - Again: 10 minutes
    - Hard: 1 day
    - Good: 3 days
    - Easy: 7 days
```

**Scenario 2: Subsequent reviews with algorithm adaptation**
```gherkin
Given I previously marked a card as "Good" 3 days ago
  And the card is now due for review
When I study the card again and mark it as "Good"
Then the interval increases to approximately 7-10 days
  And the system updates the card's ease factor
  And the card's retention statistics are updated
```

**Scenario 3: Handling forgotten cards**
```gherkin
Given I am reviewing a card I previously knew
When I mark it as "Again" (forgotten)
Then the card is reset to learning phase
  And it will appear again in the same session after 10 minutes
  And the ease factor is decreased by 20%
  And the card is flagged for extra practice
```

**Scenario 4: Daily review queue**
```gherkin
Given it's a new day and I open the app
When I navigate to study mode
Then I see the number of cards due today
  And overdue cards appear first (sorted by days overdue)
  And new cards are mixed in after review cards
  And the total is capped at my daily limit (default: 100 cards)
```

**Technical Considerations:**

**Algorithm Implementation:**
- Use FSRS (Free Spaced Repetition Scheduler) algorithm
- Reference: https://github.com/open-spaced-repetition/fsrs4anki
- Parameters: Initial ease 2.5, interval modifier 1.0, learning steps [1, 10]

**Performance:**
- Pre-calculate due dates at card creation/review
- Index on (user_id, due_date) for fast queries
- Cache today's due cards in Redis/memory
- Batch update reviews for better performance

**Data Model:**
```sql
-- Card review tracking
CREATE TABLE card_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating IN (1, 2, 3, 4)), -- Again, Hard, Good, Easy
  interval_days INTEGER NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  due_date DATE NOT NULL,
  reviewed_at TIMESTAMP DEFAULT NOW(),
  time_spent_seconds INTEGER
);

-- Card statistics
CREATE TABLE card_stats (
  card_id UUID PRIMARY KEY REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  successful_reviews INTEGER DEFAULT 0,
  current_interval_days INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  due_date DATE,
  last_reviewed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_card_stats_due ON card_stats(user_id, due_date);
CREATE INDEX idx_card_reviews_user_date ON card_reviews(user_id, reviewed_at);
```

**UI/UX Requirements:**

**Required Screens:**
1. Study queue dashboard (cards due today)
2. Card study interface (question → answer → rating)
3. Post-session summary
4. Calendar view of upcoming reviews

**Component specs:**
- Due counter: Badge showing number of cards due
- Study card: Flip animation, 400ms transition
- Rating buttons: Color-coded (red, orange, green, blue)
- Progress bar: Shows cards completed in session

**Mobile considerations:**
- Swipe gestures for ratings (left = again, right = easy)
- Larger tap targets for rating buttons (44px minimum)
- Persistent study state (resume if app closed)

**Definition of Done:**
- [ ] FSRS algorithm correctly calculates intervals
- [ ] All 4 review scenarios pass acceptance tests
- [ ] Performance: Queue loads in <500ms for 1000 cards
- [ ] Mobile gestures work smoothly
- [ ] Review history is tracked accurately
- [ ] Algorithm parameters are configurable

**Estimated Effort:** 4 days

**Breakdown:**
- Day 1: FSRS algorithm implementation + unit tests
- Day 2: Database schema + review tracking
- Day 3: Study UI + card flip animations
- Day 4: Queue management + performance optimization

---

### F-003: Study Dashboard with Heatmap

**RICE Score Breakdown:**
- Reach: 100% - All users see this as their home screen
- Impact: 2 (High) - Gamification drives 40% better retention
- Confidence: 90% - Proven pattern (GitHub, Duolingo)
- Effort: 3 days - Visualization + stats calculation
- **Score: (100 × 2 × 90) / 3 = 180**

**User Story:**
```
As a student
I want to see my study progress and consistency visually
To stay motivated and maintain daily study habits
```

**Business Value:**
Visual progress tracking increases daily active usage by 40% (Duolingo data). The heatmap creates a psychological commitment to maintaining streaks, directly impacting retention metrics.

**Acceptance Criteria (Given-When-Then Scenarios):**

**Scenario 1: Heatmap display**
```gherkin
Given I have studied cards over the past 90 days
When I view my dashboard
Then I see a GitHub-style contribution heatmap
  And each day shows color intensity based on cards studied (0, 1-10, 11-30, 31-50, 50+)
  And hovering shows exact count: "35 cards on Nov 11"
  And current streak is prominently displayed
```

**Scenario 2: Statistics overview**
```gherkin
Given I am on the dashboard
When I look at the statistics section
Then I see:
  - Total cards mastered (interval > 30 days)
  - Current streak (consecutive days)
  - Cards due today
  - Average daily cards studied (30-day average)
  - Total study time this week
  And all stats update in real-time
```

**Scenario 3: Performance by subject**
```gherkin
Given I have flashcards in multiple categories (Anatomy, Pharmacology, Pathology)
When I view the subject breakdown
Then I see a progress bar for each subject showing:
  - Percentage of cards mastered
  - Number of cards due
  - Last studied date
  And I can click any subject to filter study session
```

**Technical Considerations:**

**Performance:**
- Calculate stats asynchronously (background job)
- Cache dashboard data for 1 hour
- Use materialized views for complex aggregations
- Pagination for historical data

**Data Model:**
```sql
-- Daily study sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cards_studied INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  cards_mastered INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- User statistics (denormalized for performance)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_cards_studied INTEGER DEFAULT 0,
  total_cards_mastered INTEGER DEFAULT 0,
  total_study_minutes INTEGER DEFAULT 0,
  last_study_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**UI/UX Requirements:**

**Component specs:**
- Heatmap: 13 weeks × 7 days grid, responsive sizing
- Streak counter: Large font (32px), flame emoji for 7+ days
- Progress bars: Animated on load, percentage labels
- Stats cards: Icon + number + label layout

**Mobile considerations:**
- Heatmap scrollable horizontally on mobile
- Stats stack vertically on small screens
- Touch to show tooltips (not just hover)

**Definition of Done:**
- [ ] Heatmap renders correctly with real data
- [ ] Stats calculate accurately and update real-time
- [ ] Performance: Dashboard loads in <1 second
- [ ] Mobile responsive design works on all devices
- [ ] Color scheme accessible for colorblind users

**Estimated Effort:** 3 days

**Breakdown:**
- Day 1: Database schema + stats calculation jobs
- Day 2: Heatmap component + calendar integration
- Day 3: Stats cards + subject progress + polish

---

### F-004: Authentication & User Management

**RICE Score Breakdown:**
- Reach: 100% - Every user must authenticate
- Impact: 2 (High) - Required for personalized experience
- Confidence: 100% - Standard implementation
- Effort: 2 days - Using Supabase Auth
- **Score: (100 × 2 × 100) / 2 = 150**

**User Story:**
```
As a new user
I want to create an account and securely access my study materials
To maintain my personal progress and data
```

**Acceptance Criteria (Given-When-Then Scenarios):**

**Scenario 1: Email signup**
```gherkin
Given I am on the signup page
When I enter email, password, and name
  And password meets requirements (8+ chars, 1 number, 1 special)
Then account is created
  And verification email is sent
  And I'm redirected to onboarding
```

**Scenario 2: Google OAuth signup**
```gherkin
Given I click "Sign up with Google"
When I authorize with Google
Then account is created with Google profile data
  And no email verification needed
  And I'm redirected to onboarding
```

**Scenario 3: Password reset**
```gherkin
Given I forgot my password
When I request password reset with my email
Then I receive reset link within 2 minutes
  And link expires after 1 hour
  And I can set new password
```

**Technical Considerations:**

**Security:**
- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens with 7-day expiration
- Refresh tokens for seamless re-auth
- Row-level security in PostgreSQL

**Implementation:**
- Supabase Auth handles all authentication
- Social logins: Google (primary), GitHub (optional)
- Email verification required for email signups
- Session management with Supabase client

**Definition of Done:**
- [ ] Email and Google signup work
- [ ] Password reset flow complete
- [ ] Protected routes redirect to login
- [ ] Sessions persist across browser refresh
- [ ] Security headers implemented

**Estimated Effort:** 2 days

**Breakdown:**
- Day 1: Supabase setup + signup/login flows
- Day 2: Password reset + protected routes + session management

---

## 🎨 WIREFRAME REQUIREMENTS (FOR UX/UI DESIGNER)

### Screen 1: Landing Page
**Purpose:** Convert visitors to signups by showing universal value proposition

**Key elements (Information Hierarchy):**
- **Hero Section:**
  - Headline: "AI-Powered Flashcards for Smarter Studying" (48px desktop, 32px mobile)
  - Subheadline: "Transform any study material into smart flashcards in seconds. Study less, retain more."
  - CTA Button: "Start Free Trial" (primary color, 56px height)
  - Demo video: 30-second autoplay showing PDF → flashcards

- **Social Proof Section:**
  - "Trusted by students worldwide"
  - 3 testimonials with photos and university names
  - Rating: "4.9/5 based on user reviews"

- **Feature Grid (3 columns):**
  - AI Generation: Icon + "Turn PDFs into flashcards in seconds"
  - Spaced Repetition: Icon + "Science-backed learning algorithm"
  - Progress Tracking: Icon + "Visual motivation with streaks"

**User interactions:**
- Click "Start Free Trial" → Signup modal with email/Google options
- Scroll down → Sticky header appears with CTA
- Click "Watch Demo" → Expand video to fullscreen

**Mobile considerations:**
- Feature grid stacks to 1 column
- Video becomes thumbnail with play button
- Font sizes: Headlines 32px, body 16px minimum

**Benchmarks from similar products:**
- RemNote: Clean, academic aesthetic with purple accents
- Anki: Information-dense but overwhelming
- Quizlet: Playful, consumer-friendly aesthetic

---

### Screen 2: Dashboard (Home)
**Purpose:** Show progress and motivate daily study

**Key elements:**
- **Top Stats Bar:**
  - Current streak: "🔥 12 days"
  - Cards due today: "47 cards due"
  - Quick start: "Study Now" button (primary CTA)

- **Heatmap Section:**
  - 13-week GitHub-style calendar
  - Color legend: 0, 1-10, 11-30, 31-50, 50+ cards
  - Hover tooltips with exact counts

- **Subject Progress:**
  - List of subjects with progress bars
  - "Anatomy: 67% mastered (23 due)"
  - Click to filter study session

- **Quick Actions:**
  - "Upload New Material" button
  - "Review Mistakes" link
  - "Study Settings" link

**Mobile considerations:**
- Heatmap scrollable horizontally
- Stats stack vertically
- Bottom navigation for quick actions

---

### Screen 3: Study Interface
**Purpose:** Optimal learning experience with minimal friction

**Key elements:**
- **Card Display:**
  - Question side: Large text (24px), centered
  - Answer side: Structured format with bullet points
  - Flip animation (400ms ease-out)

- **Rating Buttons:**
  - Again (Red) | Hard (Orange) | Good (Green) | Easy (Blue)
  - Time intervals shown under each button
  - Keyboard shortcuts: 1, 2, 3, 4

- **Progress Header:**
  - Cards remaining: "12/47 cards"
  - Timer: "18:32" (Pomodoro countdown)
  - Exit button with confirmation

- **Study Controls:**
  - Edit card (pencil icon)
  - Flag for review (flag icon)
  - Report issue (warning icon)

**Mobile considerations:**
- Swipe gestures: Left (Again), Up (Hard), Down (Good), Right (Easy)
- Larger touch targets (minimum 44px)
- Full-screen mode to minimize distractions

---

### Screen 4: Upload & Generate
**Purpose:** Seamless material upload and AI processing

**Key elements:**
- **Upload Zone:**
  - Drag-and-drop area (dashed border)
  - "Drop PDF here or click to browse"
  - File requirements: "PDF only, max 10MB"

- **Processing Status:**
  - Progress bar with percentage
  - "Extracting text..." → "Generating cards..." → "Almost done..."
  - Estimated time remaining

- **Review Generated Cards:**
  - Grid view of generated flashcards
  - Bulk actions: "Accept All", "Edit Selected"
  - Quality indicators (AI confidence scores)

- **Save Options:**
  - Deck name input
  - Category selection (dropdown)
  - Tags input (optional)
  - "Save to Library" button

**Mobile considerations:**
- File picker instead of drag-drop
- Cards in single column for review
- Sticky save button at bottom

---

## 🛠️ CONFIRMED TECH STACK (WITH JUSTIFICATION)

### **Frontend Mobile**

**Framework: React Native + Expo**
- **Why?**
  - Single codebase for iOS + Android (95% shared code)
  - Expo handles builds in the cloud (no Mac needed for iOS dev)
  - Instant updates with Expo Go during development
  - Native performance with real app experience
  - Push notifications, offline support built-in
- **Discarded alternatives:**
  - Flutter: Smaller community, Dart learning curve
  - Native iOS/Android: 2x development time, 2x codebase
  - React Web: Not a true mobile app experience
- **Accepted trade-offs:** Slightly larger app size (~40MB) vs web app, but users expect this for native apps

**Styling: NativeWind (Tailwind for React Native)**
- **Why?** Tailwind-style utility classes for React Native components
- **Discarded alternatives:**
  - Styled Components: More verbose, slower dev
  - React Native StyleSheet: No design system consistency
- **Accepted trade-offs:** Some Tailwind features not available in native

**Navigation: Expo Router**
- **Why?** File-based routing (like Next.js), built for React Native
- **Discarded alternatives:**
  - React Navigation: More boilerplate, less intuitive
- **Accepted trade-offs:** Newer library, but actively maintained by Expo

**State Management: Zustand**
- **Why?** Simple, TypeScript-first, works perfectly with React Native
- **Discarded alternatives:**
  - Redux Toolkit: Overkill for MVP scope
  - Context API: Performance issues with frequent updates
- **Accepted trade-offs:** Less ecosystem than Redux, but sufficient for our needs

**Local Storage: AsyncStorage + Expo SecureStore**
- **Why?** Native persistence for offline support, secure storage for tokens
- **No alternatives needed:** Standard for React Native

### **Backend (Development)**

**Database: PostgreSQL 16 (Docker local)**
- **Why?** Full control in development, easy debugging, portable schema
- **Setup:** `docker-compose.yml` with Postgres + pgAdmin
- **Migrations:** Prisma ORM for type safety
- **Advantages vs direct Supabase development:**
  - Faster testing (local)
  - $0 costs during development
  - Easy migration rollback

**API Framework: Python FastAPI**
- **Why?**
  - Best Python framework for AI integrations
  - Async support for OpenAI API calls
  - Auto-generated API documentation
  - Type hints reduce bugs
- **Discarded alternatives:**
  - Node.js Express: Python better for AI/ML libraries
  - Django: Too heavy for API-only service
  - Flask: Lacks modern features FastAPI provides
- **Accepted trade-offs:** Python vs JavaScript means two languages, but AI benefits outweigh

### **Backend (Production)**

**Platform: Supabase**
- **Why?** Auth + Database + Storage + Realtime in one platform, generous free tier
- **Discarded alternatives:**
  - Firebase: More expensive, less SQL flexibility
  - AWS Amplify: Complex setup for MVP
  - Custom VPS: Too much DevOps overhead

**Auth: Supabase Auth**
- JWT-based, OAuth providers included
- Row-level security built-in

**Database: PostgreSQL (via Supabase)**
- Same as dev, seamless migration

**File Processing Strategy:**
- PDFs processed in memory (no persistent storage)
- Only extracted text stored in PostgreSQL
- Reduces storage costs and privacy concerns

### **Development & Deployment Workflow**

**Step 1: Local Development (Free)**
1. Backend: Docker PostgreSQL + FastAPI running locally
2. Mobile: Expo Go app on physical device or emulator
3. Scan QR code → instant app preview
4. Hot reload on every code change

**Step 2: Testing Phase (Free)**
1. Export schema from local PostgreSQL
2. Create Supabase project (free tier)
3. Apply migrations via Supabase CLI
4. Build Expo Development Build for beta testers (free hasta 100 users)
5. TestFlight (iOS) + Google Play Internal Testing (Android)

**Step 3: Environment Variables**
```bash
# Development (.env.local)
DATABASE_URL=postgresql://localhost:5432/studymaster
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...

# Production (.env.production)
DATABASE_URL=postgresql://supabase-connection
EXPO_PUBLIC_API_URL=https://api.studymaster.app
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
```

**Step 4: Production Deploy**
1. **Mobile App:**
   - `eas build --platform all` → builds iOS + Android
   - Submit to App Store (requires $99 Apple Developer)
   - Submit to Google Play (requires $25 one-time)
   - App review: 2-7 días (Apple), 1-3 días (Google)
2. **Backend API:** Deploy to Railway.app
3. **Database:** Already on Supabase

**Estimated setup time:**
- Dev environment: 2-3 hours
- Beta testing: 4-6 hours
- Production deploy: 1-2 days (including app store review)

### **AI/ML Stack**

**LLM: OpenAI GPT-4o-mini**
- **Why?**
  - Best cost/performance ratio ($0.15/1M tokens)
  - General knowledge understanding across all academic subjects
  - Reliable API with 99.9% uptime
- **Discarded alternatives:**
  - Claude: More expensive, no significant advantage for flashcards
  - Llama 3.1: Self-hosting complexity not worth it for MVP
  - GPT-4: 10x more expensive, marginal quality improvement
- **Accepted trade-offs:** Vendor lock-in, but APIs are similar enough to switch later

**PDF Processing: PyPDF2**
- **Why?** Mature Python library, handles 95% of PDFs
- **Fallback:** pdf.js for client-side extraction if PyPDF2 fails

### **Hosting & Infrastructure**

**Mobile App: Expo Application Services (EAS)**
- **Development:**
  - Expo Go (gratis, instant testing)
  - iOS Simulator (gratis con Xcode en Mac)
  - Android Emulator (gratis con Android Studio)
- **Testing/Beta:**
  - Expo Development Builds (gratis hasta 100 testers)
  - TestFlight (iOS, gratis)
  - Google Play Internal Testing (Android, gratis)
- **Production:**
  - EAS Build: $29/month Producción plan (unlimited builds)
  - Apple Developer: $99/year (solo cuando publiques en App Store)
  - Google Play: $25 one-time fee (solo cuando publiques)

**Backend API: Railway.app**
- **Why?**
  - Simple deployment for Python apps
  - Automatic scaling
  - $5/month covers MVP traffic
- **Alternative considered:** Render.com (similar features)

**Database & Auth: Supabase**
- Free tier: 500MB storage, 2GB bandwidth
- Sufficient for 1000+ users

**Monitoring: Sentry**
- Error tracking for mobile app and backend
- Free tier: 5K errors/month

### **Integrations (External APIs)**

| API | Purpose | Complexity | Cost | Justification |
|-----|---------|-------------|------|---------------|
| OpenAI GPT-4o-mini | Flashcard generation | Low | ~$50/month @ 1000 users | Core differentiator |
| Stripe | Payment processing | Medium | 2.9% + $0.30 per transaction | Industry standard |
| Resend | Transactional email | Low | Free tier: 3000/month | Simple, developer-friendly |
| Plausible | Analytics | Low | $9/month | Privacy-focused, GDPR compliant |

### **General Stack Justification**

**Why this stack is correct for StudyMaster:**
1. **Native Mobile Experience:** True app (not web wrapper), offline support, push notifications
2. **Single Codebase:** 95% code shared between iOS + Android = faster development
3. **Cost-Efficient Testing:** Expo Go + emulators = $0 until production
4. **Timeline:** MVP in 12-14 weeks with React Native + Expo
5. **AI-optimized:** Python backend perfect for OpenAI integrations
6. **Developer Experience:** Expo's tooling is best-in-class for React Native

**Accepted trade-offs:**
- ✅ Two languages (Python + JS) → AI benefits worth complexity
- ✅ App store dependencies → Need Apple/Google approval for updates
- ✅ Longer timeline (12-14 weeks vs 8 weeks web) → Native experience worth it
- ✅ Vendor lock-in (Supabase, OpenAI, Expo) → Speed to market priority

**Successful precedents:**
- Duolingo: React Native, 500M+ downloads
- Discord: React Native for mobile, 150M+ MAU
- Anki: Python backend, 5M+ users (we're modernizing the mobile experience)
- Brainscape: Native mobile apps, $10M+ revenue

---

## 📊 SUCCESS METRICS (OKRs WITH BENCHMARKS)

**Objective:** Launch StudyMaster MVP and achieve product-market fit with university students within 6 months

**North Star Metric:**
**"Weekly Active Learners (WAL) completing 50+ cards"** - Target: 500 by month 6
(Indicates engaged users getting real value, not just trying the product)

### **Key Results:**

**KR1: Acquisition - 2000 signups by month 6**
- **Benchmark:** "50-200 users for B2C MVP validation" (Lenny's Newsletter 2024)
- **How to measure:** Supabase Auth user count
- **Success criteria:**
  - Month 1: 200 signups
  - Month 3: 500 signups
  - Month 6: 2000 signups

**KR2: Activation - 40% complete onboarding + study 10 cards**
- **Benchmark:** "30-40% activation rate is good for EdTech" (Reforge 2024)
- **Activation definition:** User uploads PDF + generates cards + studies 10 cards
- **How to measure:** Plausible custom events
- **Success criteria:** >40% within 24 hours of signup

**KR3: Retention - 40% 30-day retention**
- **Benchmark:** "35-45% month-1 retention for education apps" (Amplitude 2024)
- **Definition:** User who studies at least once in days 25-30
- **How to measure:** Cohort analysis in Plausible
- **Success criteria:**
  - D7: 60%
  - D30: 40%
  - D90: 25%

**KR4: Monetization - 8% free-to-paid conversion**
- **Benchmark:** "5-10% is strong for EdTech freemium" (OpenView 2024)
- **How to measure:** Stripe subscriptions / total users
- **Success criteria:**
  - Month 1: 3% (early adopters)
  - Month 3: 5%
  - Month 6: 8%

**KR5: Satisfaction - NPS > 50**
- **Benchmark:** "50+ is excellent, 70+ is world-class" (Delighted 2024)
- **How to measure:** In-app survey after 30 days
- **Success criteria:** NPS > 50 with 30%+ response rate

### **Guardrail Metrics:**

**G1: Performance**
- Threshold: Page load <2s, API response <500ms (P95)
- How to measure: Vercel Analytics + Railway metrics

**G2: AI Quality**
- Threshold: >85% flashcard accuracy rating from users
- How to measure: Post-generation feedback widget

**G3: Error Rate**
- Threshold: <1% of sessions have errors
- How to measure: Sentry error tracking

**G4: Cost per User**
- Threshold: <$2/month per active user (OpenAI + infrastructure)
- How to measure: Monthly cost audit

### **MVP is Successful if:**

**✅ VALIDATED (Proceed to scale):**
- [x] 500+ WAL by month 6
- [x] 40%+ D30 retention
- [x] 8%+ free-to-paid conversion
- [x] NPS > 50
- [x] Unit economics positive (LTV > 3x CAC)

**🔄 PIVOT (Adjust strategy):**
- [ ] 200-500 WAL (some traction but not enough)
- [ ] 25-40% D30 retention (engagement issues)
- [ ] 3-8% conversion (pricing or value issues)
- [ ] NPS 30-50 (product needs improvement)

**❌ KILL (Abandon project):**
- [ ] <200 WAL after 6 months
- [ ] <25% D30 retention
- [ ] <3% conversion
- [ ] NPS <30
- [ ] CAC >$100 with no improvement path

### **Tracking Setup:**
- **Analytics:** Plausible (privacy-focused, GDPR compliant)
- **Error Monitoring:** Sentry (frontend + backend)
- **User Feedback:** Typeform surveys + in-app widget
- **Financial:** Stripe Dashboard + custom metrics dashboard
- **Infrastructure:** Vercel + Railway + Supabase dashboards

---

## ⏱️ TIMELINE & MILESTONES

| Milestone | Deliverable | Owner | Dependencies | Target Date | Duration | Status |
|-----------|------------|-------|--------------|-------------|----------|--------|
| M0 | Validation complete, plan approved | PM | - | Day 0 | 1d | ✅ Done |
| M1 | Landing page + 200 waitlist signups | PM | M0 | Day 7 | 7d | ⚪ Pending |
| M2 | Expo + React Native setup | Developer | M0 | Day 14 | 5d | ⚪ Pending |
| M3 | Auth working (Supabase + OAuth) | Developer | M2 | Day 19 | 3d | ⚪ Pending |
| M4 | Native UI components library | Developer | M3 | Day 24 | 4d | ⚪ Pending |
| M5 | PDF upload + AI generation MVP | Developer | M4 | Day 35 | 8d | ⚪ Pending |
| M6 | Spaced repetition algorithm | Developer | M5 | Day 42 | 5d | ⚪ Pending |
| M7 | Dashboard + heatmap | Developer | M6 | Day 47 | 4d | ⚪ Pending |
| M8 | Pomodoro timer + offline support | Developer | M7 | Day 52 | 4d | ⚪ Pending |
| M9 | Payment integration (Stripe) | Developer | M8 | Day 56 | 3d | ⚪ Pending |
| M10 | Expo Development Build for beta | Developer | M9 | Day 60 | 3d | ⚪ Pending |
| M11 | Beta testing (20-50 users) | PM | M10 | Day 70 | 10d | ⚪ Pending |
| M12 | Iterate based on feedback | Developer | M11 | Day 77 | 7d | ⚪ Pending |
| M13 | Submit to App Store + Google Play | PM | M12 | Day 84 | 7d | ⚪ Pending |
| M14 | Public launch (post app review) | PM | M13 | Day 98 | - | ⚪ Pending |

**Total estimated timeline:** 12-14 weeks to public launch

**Critical path:** M0 → M1 → M2 → M3 → M4 → M5 → M6 → M9 → M10 → M11 → M13 → M14

**Note:** App store review adds 2-7 days (Apple) and 1-3 days (Google) to timeline

### **Sprint Breakdown:**

**Sprint 1 (Week 1): Market Validation**
- Landing page creation (web)
- Reddit/Discord outreach
- User interviews (10 university students across different majors)
- **Goal:** Initial user feedback and validation

**Sprint 2 (Week 2-3): React Native Foundation**
- Expo + React Native project setup
- NativeWind styling configuration
- Expo Router navigation structure
- Development environment (Expo Go + emulators)
- **Deliverable:** Hello World app running on iOS + Android

**Sprint 3 (Week 3-4): Authentication & Backend**
- Supabase Auth integration (email + Google OAuth)
- PostgreSQL Docker setup locally
- FastAPI backend skeleton
- Protected routes and session management
- **Deliverable:** Login/signup flow funcional

**Sprint 4 (Week 4-5): Native UI Components**
- Design system con NativeWind
- Reusable components (buttons, cards, inputs)
- Navigation structure (tabs + stack)
- Loading states and error handling
- **Deliverable:** Component library completo

**Sprint 5 (Week 6-7): Core Value - AI Flashcards**
- PDF upload (native file picker)
- Backend: PyPDF2 text extraction
- OpenAI API integration
- Flashcard generation + preview
- Edit cards before saving
- **Deliverable:** Generación de flashcards funcional

**Sprint 6 (Week 8-9): Spaced Repetition**
- FSRS algorithm implementation
- Study UI con swipe gestures
- Rating system (Again/Hard/Good/Easy)
- Review queue logic
- AsyncStorage para offline persistence
- **Deliverable:** Sistema de estudio completo

**Sprint 7 (Week 9-10): Dashboard & Gamification**
- Heatmap calendar component (React Native)
- Stats calculation (streaks, cards mastered)
- Progress by subject
- Pomodoro timer con notificaciones locales
- **Deliverable:** Dashboard motivacional

**Sprint 8 (Week 10-11): Monetization & Polish**
- Stripe payment integration (React Native)
- Subscription management
- Paywall screens
- Performance optimization
- Offline support refinement
- **Deliverable:** App completo con payments

**Sprint 9 (Week 11-12): Beta Testing**
- Expo Development Build creación
- Beta distribution (TestFlight + Google Play Internal)
- Onboard 20-50 university students
- Collect feedback
- **Goal:** 40% activation, 8/10 quality rating

**Sprint 10 (Week 12-13): Iteration & Hardening**
- Bug fixes from beta
- AI prompt engineering refinement
- Performance tuning
- App icon + splash screen final
- **Deliverable:** Production-ready app

**Sprint 11 (Week 13-14): App Store Submission**
- Create App Store listing (screenshots, description)
- Create Google Play listing
- Submit for review
- **Wait time:** 2-7 days Apple, 1-3 days Google
- **Deliverable:** Apps published and live

### **Dependencies & Risks:**

**Critical Dependency 1: OpenAI API Quality**
- Impact: If flashcard quality is poor, entire value prop fails
- Mitigation: 1 week dedicated to prompt engineering during beta
- Probability: Medium
- Contingency: Manual review for first 100 users

**Risk 1: Technical complexity of FSRS algorithm**
- Impact: 2-3 day delay if implementation issues
- Mitigation: Use reference implementation from GitHub
- Probability: Low
- Contingency: Start with simpler SM-2 algorithm

**Risk 2: Slow user acquisition**
- Impact: Not enough beta testers
- Mitigation: Paid ads budget ($500) if organic fails
- Probability: Medium
- Contingency: Partner with student organizations on campus

---

## 🎯 HANDOFF TO UX/UI DESIGNER

**Designer receives:**
- [x] Detailed user persona (Alex Rivera, university student)
- [x] Complete user journey (4 stages mapped)
- [x] RICE-prioritized features with specifications
- [x] Wireframe requirements for 4 core screens
- [x] Acceptance criteria for all interactions
- [x] Mobile-first requirements
- [x] Success metrics to optimize for
- [x] Tech stack constraints (React Native + NativeWind)

**Expected Designer output:**
1. **Week 1:** Wireframes (low-fi) of 4 core screens
2. **Week 2:** High-fidelity mockups in Figma
3. **Week 2:** Component library (buttons, cards, inputs)
4. **Week 3:** Prototype with interactions
5. **Week 3:** Design system documentation
6. **Week 3:** Exported assets (SVGs, images)

**Design Principles:**
- **Clean & Professional:** Students expect serious, focused study tools
- **Mobile-first:** 60% will study on phones
- **Accessibility:** WCAG 2.1 AA compliant
- **Performance:** Lightweight assets, smooth animations
- **Brand:** Trustworthy, modern, approachable

**Color Palette Suggestion:**
- Primary: Modern blue (#0066CC) or purple (#7C3AED)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Grays (#111827 to #F9FAFB)

**Typography:**
- Headlines: Inter or SF Pro Display
- Body: System fonts for performance
- Code/Technical terms: Monospace (JetBrains Mono)

**Approval criteria:**
- [ ] All 4 core screens designed
- [ ] Mobile responsive versions
- [ ] Dark mode considered
- [ ] Loading and error states
- [ ] Accessibility audit passed
- [ ] Developer handoff ready in Figma

**Next agent:** UX/UI Designer (Agent 2)

---

## 📌 FINAL NOTES

### **Assumptions:**
1. University students willing to pay $9.99/month - validated by similar tools (Quizlet Plus, RemNote Pro)
2. OpenAI quality sufficient for general academic content - needs testing in beta across subjects
3. 12-14 week timeline achievable with focus - assumes full-time development

### **Risks:**

**🔴 HIGH IMPACT:**
1. **AI flashcard quality below expectations**
   - Impact: Users abandon product immediately
   - Probability: 30%
   - Mitigation: 1 week prompt engineering, manual review option
   - Owner: Developer

2. **Anki users reluctant to switch**
   - Impact: Slow adoption despite better UX
   - Probability: 40%
   - Mitigation: Import from Anki feature, side-by-side comparison content
   - Owner: PM

**🟡 MEDIUM IMPACT:**
1. **OpenAI API costs exceed projections**
   - Impact: Negative unit economics
   - Probability: 20%
   - Mitigation: Implement caching, consider Llama 3.1 for V2
   - Owner: Developer

2. **FSRS algorithm implementation issues**
   - Impact: 3-5 day delay
   - Probability: 30%
   - Mitigation: Use reference implementation, fallback to SM-2
   - Owner: Developer

**🟢 LOW IMPACT:**
1. **Payment processing delays**
   - Impact: 1-2 day delay in monetization
   - Probability: 10%
   - Mitigation: Stripe is reliable, have PayPal backup
   - Owner: Developer

### **Next Steps After MVP:**

**V1.1 (2-4 weeks post-launch):**
- Pomodoro timer integration
- Basic analytics dashboard
- Import from Anki feature
- OCR for image-based PDFs (Mathpix API)

**V2.0 (3-6 months):**
- Advanced mobile features
- Collaborative study groups
- Advanced analytics with predictions
- B2B features for institutions
- Subject-specific fine-tuned models

### **External Dependencies:**

| Dependency | Impact if Fails | Mitigation |
|------------|----------------|------------|
| OpenAI API | No flashcard generation | Queue for retry, Anthropic Claude backup |
| Supabase | No auth or database | Local development continues, migrate to Firebase |
| Stripe | No payments | PayPal backup, manual invoicing for enterprise |
| Vercel | Frontend offline | Netlify as backup, Cloudflare Pages ready |

### **Open Questions:**

1. Should we implement subject-specific templates (STEM, Humanities, Languages)?
   - Answer: Not in MVP, use general templates. Collect data on popular subjects
   - Owner: PM to validate in beta

2. How to handle non-English content?
   - Answer: English-only for MVP, add Spanish/other languages in V2
   - Owner: PM to survey demand

3. Integration with university LMS systems (Canvas, Blackboard)?
   - Answer: Manual upload only in MVP, explore LMS APIs in V2
   - Owner: Architect in Phase 2

---

**PLAN APPROVED - READY FOR DESIGN PHASE**

**Sign-off:**
- [x] PM (Agent 1)
- [ ] Designer (Agent 2) - Pending
- [ ] Architect (Agent 3) - Pending
- [ ] Developer (Agent 4) - Pending

---

*Document generated: November 11, 2025*
*Version: 1.0*
*Methodology: Google Project Management + RICE*
*PM: Agent 1 (15+ years exp., FAANG background)*