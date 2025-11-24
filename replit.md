# OUTreach! - Christian Evangelism Platform

## Project Overview
A multi-language Christian evangelism and outreach management web application built with React, Vite, and TypeScript. The app helps teams coordinate evangelism events, manage testimonies, prayer requests, and team operations with comprehensive role-based access control.

**Tagline**: 🔥 Until Everyone Hears | Matthew 24:14

### Supported Languages (4 Tier 1)
- 🇧🇷 Portuguese (Brazil) - pt-BR
- 🇵🇹 Portuguese (Portugal) - pt-PT  
- 🇬🇧 English (UK) - en
- 🇩🇪 German - de

## Current Status

### ✅ Completed Features
- **Multi-language UI System** (i18n): Full translation system for 4 languages with dynamic switching
- **Language Selection Page**: Displays in English with app branding, back button, and language options
- **Registration & Login**: Fully translated forms with language switcher
- **Testimony Page**: Complete form with translation support
- **AI Integration**: Gemini API for text transcription and improvement
- **Role-Based Access Control**: Permission system for ADM, Leader, Evangelist, Intercessor
- **Translation System**: Dynamic user data translation using Gemini AI
- **Improve with AI**: Context-aware text improvement in selected language
- **User Data Handling**: Structured translation and JSON output format

### 🔄 In Progress / Planned
- Google Drive integration for file uploads (connector available, awaiting setup)
- Email authentication system
- Real-time notifications
- Advanced statistics dashboard
- Team management workflows
- Evangelism scheduling system
- Prayer request management
- Training creation and distribution

## Architecture

### File Structure
```
src/
├── components/        # React components (Layout, TranslatableText, etc)
├── contexts/         # LanguageContext, AuthContext
├── hooks/            # useGemini, useImproveWithAI, useGoogleDrive
├── lib/              # permissions.ts, translateUserData.ts
├── pages/            # Page components (Home, Dashboard, Testimony, etc)
├── types.ts          # TypeScript interfaces and types
├── i18n.ts           # Translation keys and values (4 languages)
├── App.tsx           # Main app with routing
└── main.tsx          # Entry point
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Context API + React Query
- **Build Tool**: Vite 6.4.1
- **UI Components**: Lucide React, Framer Motion
- **AI**: Google Generative AI (Gemini 2.5-Flash)
- **Package Manager**: npm

### Translation System (i18n.ts)
- 1000+ translation keys organized by feature
- Supports: pt-BR, pt-PT, en, de
- Dynamic language switching via LanguageContext
- AI-powered translation for user data

## Core Features

### 1. Multi-Language Support
- **Dynamic Interface Translation**: All UI elements translate based on selected language
- **User Data Translation**: Testimonies, prayer requests, registrations translated via Gemini AI
- **Language Selector**: Always accessible in menu/navigation
- **Persistent Language State**: Language preference maintained across navigation

### 2. AI-Powered Features

#### Gemini Integration (useGemini.ts)
- **Audio Transcription**: Convert audio recordings to text
- **Text Improvement**: Polish and structure user-submitted text
- **Dynamic Translation**: Translate content to target language
- **Testimony Summarization**: Generate compelling narrative summaries
- **Prayer Agenda Generation**: Create structured weekly prayer plans
- **Model**: gemini-2.5-flash (optimized for speed and cost)

#### Improve with AI (useImproveWithAI.ts)
- Language-aware text enhancement
- Maintains tone and spiritual meaning
- Structures content logically
- Preserves all key information and decisions

### 3. Role-Based Access Control (permissions.ts)

**Roles & Permissions**:

| Feature | ADM | Leader | Evangelist | Intercessor | Guest |
|---------|-----|--------|-----------|-------------|-------|
| Schedule Evangelism | ✅ | - | - | - | - |
| Create Training | ✅ | - | - | - | - |
| Upload Files | ✅ | - | - | - | - |
| Upload Recordings | ✅ | - | - | - | - |
| Approve Applications | ✅ | ✅ | - | - | - |
| Apply for Events | ✅ | ✅ | ✅ | ✅ | - |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Team | ✅ | ✅ | - | - | - |
| Create Prayer Agenda | ✅ | ✅ | ✅ | ✅ | - |
| Submit Testimony | ✅ | ✅ | ✅ | ✅ | - |

### 4. Dynamic Translation Output (translateUserData.ts)

Generates structured JSON output:
```json
{
  "interface": { "translated_ui_strings": "..." },
  "dados_traduzidos": { "user_data": "..." },
  "permissoes": {
    "ADM": ["permissions_array"],
    "Lider": ["permissions_array"],
    "Evangelista": ["permissions_array"],
    "Intercessor": ["permissions_array"]
  },
  "metadata": {
    "targetLanguage": "...",
    "userRole": "...",
    "timestamp": "ISO_STRING",
    "version": "1.0"
  }
}
```

### 5. Google Drive Integration (useGoogleDrive.ts)
- File upload capability (pending connector setup)
- Folder management
- File listing and deletion
- Recording storage for evangelism events
- Training document repository
- Event media storage

**API Endpoints (Expected)**:
- `POST /api/drive/upload` - Upload file
- `GET /api/drive/list` - List files
- `DELETE /api/drive/delete/:fileId` - Delete file
- `POST /api/drive/create-folder` - Create folder

## User Workflows

### New User Registration
1. Select language on LanguageSelection page
2. Choose role: Evangelist, Leader, or Intercessor
3. Fill registration form (name, email, church, experience)
4. Data automatically translated if needed
5. ADM/Leader receives notification for approval

### Evangelism Event Flow
1. **ADM**: Creates event with date, location, team size
2. **Evangelist/Leader**: Browse and apply for events
3. **System**: Sends notifications to team leads
4. **Leader**: Approves or rejects applications
5. **Team**: Executes evangelism with recording capability
6. **Evangelist**: Submits testimony after event
7. **AI**: Generates summary for public feed

### Testimony Submission
1. **User**: Navigates to Testimony section
2. **Audio Recording**: Optional voice input (auto-transcribed)
3. **Form Fields**: Enter people profiles, decisions, outcomes
4. **AI Polish**: Click "Improve with AI" for text refinement
5. **Preview**: Review testimony before submission
6. **AI Summary**: System generates compelling narrative
7. **Published**: Appears in feed with stats

### Prayer Support Workflow
1. **User**: Submit prayer request (anonymous option)
2. **Intercessors**: See requests in prayer room
3. **Prayer Agenda**: ADM creates weekly focused agenda with AI
4. **Intercession**: Team members respond with prayers
5. **Statistics**: Track prayer outcomes and answered requests

## Environment Configuration

### Required Environment Variables
- `GEMINI_API_KEY`: Google Generative AI API key (Gemini access)
- `DATABASE_URL`: PostgreSQL connection string (production)
- `GOOGLE_DRIVE_API_KEY`: Google Drive API key (for file uploads)

### Development Setup
```bash
npm install
npm run dev
```

**Dev Server**: Runs on http://localhost:5000 (Vite dev server)

## Deployment Notes

### Current Setup
- **Frontend**: React + Vite (Dev: Vite CLI, Prod: Static export)
- **Styling**: Tailwind CSS via CDN (development) - should use npm package for production
- **Database**: PostgreSQL (Neon) - available for production deployment
- **Hosting**: Replit platform deployment ready

### Production Considerations
- [ ] Switch Tailwind from CDN to npm package
- [ ] Configure OAuth/Email authentication
- [ ] Set up production database migrations
- [ ] Configure Google Drive API for production
- [ ] Implement rate limiting for AI API calls
- [ ] Setup error tracking and monitoring

## User Preferences & Design Choices

### Design Patterns
- **Dark theme** with accent colors (indigo/pink) for modern look
- **Glassmorphism effects** for layered, premium feel
- **Motion/Animations** with Framer Motion for polish
- **Responsive design** with mobile-first approach

### Code Style
- **TypeScript** for type safety
- **React Hooks** for state management
- **Functional components** throughout
- **Custom hooks** for reusable logic (useGemini, useLanguage, etc)
- **Translation keys** instead of hardcoded text

### Language-First Approach
- All user-facing text uses translation keys
- New features automatically multilingual
- AI translations maintain context and tone
- User data respects language preference

## Testing Workflow

### Current Demo Accounts
- Admin: admin@outreach.demo
- Leader: leader@outreach.demo  
- Evangelist: evangelist@outreach.demo
- Intercessor: intercessor@outreach.demo

### Feature Testing Checklist
- [ ] Language switching (all 4 languages)
- [ ] Text improvement with AI (per language)
- [ ] Data translation (user inputs)
- [ ] Role permissions (all 5 roles)
- [ ] Google Drive uploads
- [ ] Audio transcription
- [ ] Testimony generation with AI

## Integration Setup Status

### Available Integrations
- **Google Drive** (connector): Not yet configured - awaiting user setup via UI

### Pending Configurations
- Gemini API key (GEMINI_API_KEY environment variable)
- Google Drive connector (OAuth flow via Replit)

## Next Steps (Roadmap)

### Priority 1
1. Complete Google Drive integration setup
2. Implement database persistence (PostgreSQL)
3. Add email authentication
4. Build ADM dashboard for event management

### Priority 2
1. Team member management interface
2. Application approval workflow
3. Real-time notifications
4. Advanced statistics/reporting

### Priority 3
1. Video testimonies support
2. Mobile app (React Native)
3. Integration with church management systems
4. Multilingual prayer room with real-time collaboration

---

**Last Updated**: November 24, 2025
**Version**: 1.0 MVP
**Status**: Active Development
