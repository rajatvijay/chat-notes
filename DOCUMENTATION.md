# ChatNotes - Complete Project Documentation

## Table of Contents
1. [Product Features and Decisions](#product-features-and-decisions)
2. [Technical Details](#technical-details)

---

## Product Features and Decisions

### Overview
ChatNotes is an AI-powered note-taking application that provides a friction-less chat interface for capturing thoughts, ideas, tasks, and notes. The system automatically classifies entries into organized categories using GPT-4, enabling users to focus on content creation rather than organization.

### Core Value Proposition
- **One friction-less input**: Single chat box for all types of notes
- **Intelligent categorization**: AI automatically organizes notes into predefined categories
- **Fast retrieval**: Powerful search functionality to quickly find content
- **Mobile-first design**: Optimized for mobile use with PWA capabilities

### Target Users
1. **Busy Professionals** - Capturing meeting takeaways and todos
2. **Students/Researchers** - Storing lecture notes and article quotes  
3. **Creatives** - Collecting inspiration snippets and rough drafts

### Key Features

#### 1. Chat-Based Note Input
- **Primary Interface**: Clean, WhatsApp-style chat interface
- **Category Selection**: Optional category picker with "Auto" as default
- **Quick Actions**: Keyboard shortcuts (⌘/Ctrl + Enter to send)
- **Mobile Optimized**: Touch-friendly interface with gesture support

#### 2. AI-Powered Classification
- **Auto-Categorization**: GPT-4o model classifies notes into 6 categories:
  - **Tasks** (✅) - Action items, todos, assignments
  - **Ideas** (💡) - Creative thoughts, innovations, brainstorming
  - **Journal** (📖) - Personal reflections, daily logs, experiences
  - **Meetings** (👥) - Meeting notes, discussions, decisions
  - **Reading** (📚) - Quotes, research notes, article summaries
  - **Misc** (📝) - Everything else that doesn't fit other categories
- **Manual Override**: Users can select categories manually if desired
- **Real-time Updates**: Classification happens asynchronously with UI updates

#### 3. Category-Based Organization
- **Visual Navigation**: Bottom tab bar with category icons and colors
- **Category Pages**: Dedicated views for each category with note counts
- **Consistent Design**: Each category has unique color scheme and emoji
- **Quick Access**: One-tap navigation between categories

#### 4. Advanced Search
- **Global Search**: Header search bar accessible from any page
- **Real-time Results**: Debounced search with live results dropdown
- **Result Highlighting**: Visual emphasis on matching content
- **Smart Navigation**: Click-to-navigate to specific notes with smooth scrolling
- **Keyboard Shortcuts**: Quick focus and navigation

#### 5. Note Management
- **Expandable Views**: Click notes for full content in modal dialogs
- **Metadata Display**: Creation time, source (auto/manual), category
- **Visual Hierarchy**: Card-based layout with consistent spacing
- **Content Preview**: Truncated content with read-more functionality

#### 6. Dark/Light Theme Support
- **System Integration**: Respects user's system theme preference
- **Manual Toggle**: Theme switcher in header
- **Consistent Experience**: All components support both themes
- **Accessibility**: Proper contrast ratios in both modes

#### 7. Responsive Design
- **Mobile-First**: Optimized for smartphone screens (max-width: 28rem)
- **Touch-Friendly**: Large tap targets and gesture support
- **Progressive Enhancement**: Works well across all device sizes
- **PWA Ready**: Designed for progressive web app deployment

### Design Decisions

#### User Experience
- **Minimal Cognitive Load**: Single input field reduces decision paralysis
- **Progressive Disclosure**: Show basic info first, details on demand
- **Familiar Patterns**: Chat interface everyone understands
- **Visual Feedback**: Loading states, animations, and confirmations

#### Visual Design
- **Modern Aesthetic**: Glassmorphism with backdrop blur effects
- **Gradient Accents**: Subtle gradients for visual interest
- **Consistent Typography**: Clear hierarchy with proper font weights
- **Color Psychology**: Category colors chosen for cognitive associations

#### Interaction Design
- **Keyboard-First**: Support for power users with shortcuts
- **Touch Gestures**: Optimized for mobile interaction
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Smooth animations and responsive interactions

### Success Metrics (v1 Goals)
- **Fast Capture**: ≤ 5 seconds from app open to note sent
- **Accurate Classification**: ≥ 85% notes in correct category
- **Fast Retrieval**: ≤ 2 seconds average search latency
- **User Retention**: ≥ 40% 7-day retention, ≥ 10 notes/user/week

---

## Technical Details

### Architecture Overview
ChatNotes is built as a modern full-stack web application using a monorepo structure with the following key components:

```
chat-notes/
├── apps/
│   ├── web/          # React frontend (Vite + TypeScript)
│   └── edge/         # Vercel Edge Functions (Deno)
├── packages/
│   └── ui/           # Shared UI component library
├── supabase/         # Database migrations and schema
└── docs/             # Documentation and specifications
```

### Technology Stack

#### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.4.5 for fast development and optimized builds
- **Styling**: Tailwind CSS 3.3.3 for utility-first styling
- **UI Components**: Custom component library built on Radix UI primitives
- **Routing**: React Router DOM 6.15.0 for client-side navigation
- **State Management**: React built-in state + SWR 2.2.4 for server state
- **Icons**: Lucide React for consistent iconography

#### Backend Stack
- **Database**: Supabase PostgreSQL with real-time capabilities
- **API Functions**: Vercel Edge Functions running on Deno runtime
- **AI Integration**: OpenAI GPT-4o for note classification
- **Authentication**: Supabase Auth (configured but not implemented in current version)
- **File Storage**: Supabase Storage (prepared for future image uploads)

#### Development Tools
- **Package Manager**: PNPM with workspace support
- **Type Checking**: TypeScript 5.0.2 with strict configuration
- **Linting**: ESLint 8.45.0 with React and TypeScript rules
- **Testing**: Vitest with coverage reporting, Playwright for E2E
- **Code Quality**: Prettier for formatting, pre-commit hooks
- **Deployment**: Vercel with automatic deployments

### Database Schema

#### Notes Table
```sql
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT REFERENCES categories(name) ON DELETE SET NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'auto',  -- 'auto' or 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Categories Table
```sql
CREATE TABLE categories (
  name TEXT PRIMARY KEY  -- 'task', 'idea', 'journal', 'meeting', 'reading', 'misc'
);
```

#### Optimizations
- **Indexes**: Category, creation date, and full-text search indexes
- **Constraints**: Foreign key relationships with cascade options
- **Extensions**: UUID generation and full-text search capabilities

### API Architecture

#### Edge Functions
Located in `apps/edge/api/`, deployed as Vercel Edge Functions:

1. **Classification Endpoint** (`/api/classify`)
   - **Input**: `{ note_id: string, content: string }`
   - **Process**: Call OpenAI GPT-4o for content classification
   - **Output**: `{ category: string }`
   - **Side Effects**: Updates note record in database

2. **Search Endpoint** (`/api/search`)
   - **Input**: `{ query: string }`
   - **Process**: PostgreSQL ILIKE search across note content
   - **Output**: `{ results: Note[] }`
   - **Optimization**: Limited to 50 results, ordered by recency

#### Data Flow
1. **Note Creation**: Frontend → Database → Classification API → Database Update
2. **Search**: Frontend → Search API → Database Query → Frontend
3. **Real-time Updates**: Database changes via Supabase subscriptions

### Frontend Architecture

#### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── Composer.tsx     # Note input interface
│   ├── NotesList.tsx    # Note display component
│   └── SearchBar.tsx    # Global search interface
├── pages/               # Route-level components
│   ├── ChatPage.tsx     # Main chat interface
│   └── CategoryPage.tsx # Category-specific views
├── hooks/               # Custom React hooks
│   ├── useCategoryNotes.ts
│   ├── useDebounce.ts
│   └── useTheme.ts
└── lib/                 # Utilities and configurations
    └── supabase.ts      # Database client setup
```

#### State Management Strategy
- **Local State**: React useState for component-specific state
- **Server State**: SWR for data fetching, caching, and synchronization
- **Theme State**: Custom hook with localStorage persistence
- **Form State**: Controlled components with validation

#### Performance Optimizations
- **Code Splitting**: Route-based splitting with React Router
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Optimization**: Vite's automatic tree shaking and minification
- **Caching**: SWR for intelligent data caching and revalidation

### UI Component Library

#### Design System
Located in `packages/ui/`, provides:
- **Primitive Components**: Built on Radix UI for accessibility
- **Styled Components**: Tailwind-based styling with theme support
- **Type Safety**: Full TypeScript definitions
- **Consistency**: Standardized spacing, colors, and typography

#### Key Components
- **Button**: Configurable button with multiple variants
- **Card**: Content containers with consistent styling
- **Dialog**: Modal dialogs for note details
- **Popover**: Contextual overlays for category selection

### Development Workflow

#### Monorepo Management
- **PNPM Workspaces**: Efficient package management and linking
- **Shared Dependencies**: Common packages hoisted to root
- **Independent Builds**: Each app can be built and deployed separately
- **Type Sharing**: TypeScript types shared across packages

#### Quality Assurance
- **Automated Testing**: Unit tests with Vitest, E2E with Playwright
- **Code Quality**: ESLint rules enforced in CI/CD
- **Performance Testing**: Lighthouse CI for performance budgets
- **Accessibility Testing**: Pa11y for automated accessibility checks

#### Deployment Pipeline
- **Vercel Integration**: Automatic deployments from Git pushes
- **Environment Management**: Separate staging and production environments
- **Database Migrations**: Supabase CLI for schema management
- **Environment Variables**: Secure configuration management

### Security Considerations

#### Data Protection
- **Input Sanitization**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in escaping + CSP headers
- **Environment Secrets**: API keys stored in secure environment variables

#### API Security
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: Implemented at Vercel Edge Function level
- **Authentication Ready**: Supabase Auth integration prepared
- **Service Keys**: Separate keys for different access levels

### Scalability Considerations

#### Performance Scaling
- **Database Optimization**: Proper indexing for query performance
- **CDN Deployment**: Static assets served via Vercel's global CDN
- **Edge Computing**: API functions run at edge locations
- **Caching Strategy**: Multiple layers of caching for optimal performance

#### Feature Scaling
- **Modular Architecture**: Easy to add new categories and features
- **Plugin System**: UI components designed for extensibility
- **API Versioning**: Edge functions designed for backward compatibility
- **Data Migration**: Schema versioning with Supabase migrations

### Future Technical Enhancements

#### Planned Improvements
- **Real-time Collaboration**: Multi-user editing capabilities
- **Offline Support**: Service worker for offline functionality
- **Advanced Search**: Vector search with embeddings
- **File Uploads**: Image and document attachment support
- **Export Features**: PDF, Markdown, and JSON export options

#### Technical Debt Items
- **Test Coverage**: Expand unit and integration test coverage
- **Error Handling**: More comprehensive error boundary implementation
- **Performance Monitoring**: Add real-time performance tracking
- **Documentation**: API documentation with OpenAPI specifications

### Configuration Files

#### Build Configuration
- **Vite Config**: Module resolution, proxy setup, and build optimization
- **TypeScript Config**: Strict typing with path mapping for monorepo
- **Tailwind Config**: Custom design tokens and responsive breakpoints
- **ESLint Config**: React and TypeScript linting rules

#### Deployment Configuration
- **Vercel Config**: Build commands, output directories, and function routing
- **Package.json**: Scripts for development, testing, and deployment
- **PNPM Workspace**: Package linking and dependency management

This comprehensive documentation covers both the product vision and technical implementation of ChatNotes, providing a complete picture of the application's current state and architectural decisions.