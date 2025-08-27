# Schoology Integration Feature

## Overview
The Schoology integration allows students to automatically sync their assignments from Schoology to the AP Prep Hub scheduler. When teachers post new assignments on Schoology, they are automatically imported into the scheduler with appropriate time estimates, difficulty levels, and scheduling priorities.

## Features

### 🔗 **Automatic Assignment Sync**
- Connects securely to student's Schoology account
- Automatically imports new assignments as they are posted
- Converts assignments to scheduler tasks with smart defaults

### 🧠 **Intelligent Assignment Processing**
- **Time Estimation**: Automatically estimates study time based on assignment type
  - Essays: 3 hours
  - Projects: 4 hours  
  - Tests: 2 hours for prep
  - Reading: 2 minutes per page (if page count detected)
  - Labs: 2.5 hours
  - Homework: 45 minutes
  - AP courses get 50% more time allocated

- **Difficulty Assessment**: Determines difficulty based on keywords
  - Hard: Final, midterm, major projects, research, AP courses
  - Easy: Quizzes, practice assignments, reviews
  - Medium: Everything else

- **Priority Setting**: Sets priority based on due date and assignment type
  - Urgent: Due within 24 hours
  - High: Due within 72 hours (high-stakes assignments)
  - Medium: Due within 1 week

### ⚙️ **Flexible Sync Options**
- **Manual Sync**: On-demand synchronization
- **Auto Sync**: Automatic background sync (configurable intervals: 30min, 1hr, 2hr, 4hr)
- **Initial Sync**: Imports recent assignments when first connected

### 📊 **Sync Status & Monitoring**
- Real-time sync status display
- Success/failure tracking
- Last sync timestamp
- Detailed sync results (synced, skipped, errors)

## How It Works

### 1. **Connection Process**
```
Student → Settings → Connect Schoology → OAuth Authentication → Token Storage
```

### 2. **Assignment Detection**
- Monitor Schoology for new assignments
- Parse assignment details (title, description, due date, course)
- Apply intelligent processing to determine task properties

### 3. **Scheduler Integration**
- Convert assignments to scheduler task format
- Respect existing blackout schedules
- Integrate with intelligent scheduling algorithm
- Avoid duplicate imports

### 4. **Background Sync**
- Runs automatically at configured intervals
- Handles authentication renewal
- Processes new assignments without user intervention

## Technical Implementation

### Architecture
```
Schoology API ↔ SchoologyAPIService ↔ AssignmentSyncService ↔ Firebase ↔ Scheduler
```

### Key Components

#### `SchoologyAPIService`
- Handles OAuth authentication
- Makes API calls to Schoology
- Manages access tokens securely
- Provides mock data for demo purposes

#### `AssignmentSyncService`  
- Converts assignments to tasks
- Applies intelligent time/difficulty estimation
- Manages sync scheduling and intervals
- Prevents duplicate imports

#### `BackgroundSyncManager`
- Coordinates automatic sync processes
- Manages user session lifecycle
- Handles sync intervals and scheduling

#### `SchoologyIntegration` Component
- User interface for connection management
- Sync controls and status display
- Settings configuration

### Data Flow
1. **Authentication**: OAuth tokens stored in Firebase
2. **Assignment Fetch**: API calls retrieve assignment data
3. **Processing**: Assignments converted to scheduler tasks
4. **Storage**: Tasks saved to user's Firebase collection
5. **Scheduling**: Intelligent scheduler processes new tasks

### Security
- OAuth 1.0a authentication
- Secure token storage in Firebase
- No sensitive data stored locally
- Automatic token refresh handling

## Setup Instructions

### For Students (Demo Mode)
1. Go to Settings page
2. Find "Schoology Integration" section
3. Click "Connect Schoology"
4. Confirm demo mode connection
5. Assignments will be automatically synced

### For Production Deployment
1. Register application with Schoology
2. Obtain consumer key and secret
3. Configure environment variables:
   ```
   REACT_APP_SCHOOLOGY_CONSUMER_KEY=your_key
   REACT_APP_SCHOOLOGY_CONSUMER_SECRET=your_secret
   ```
4. Set up OAuth callback URL
5. Deploy with proper HTTPS configuration

## Benefits

### For Students
- **Reduced Manual Entry**: No need to manually create tasks for every assignment
- **Better Time Management**: Automatic time estimates help with planning
- **Never Miss Deadlines**: Assignments automatically scheduled around due dates
- **Improved Organization**: All assignments from all classes in one place

### For Academic Success
- **Proactive Scheduling**: Study time allocated before deadline pressure
- **Realistic Time Allocation**: Based on assignment complexity
- **Balanced Workload**: Scheduler distributes work across available time
- **Stress Reduction**: Automated planning reduces last-minute cramming

## Demo Data
The demo includes realistic AP course assignments:
- **AP Biology**: Lab reports, reading quizzes, essays
- **AP Calculus AB**: Practice sets, unit tests
- **AP English Literature**: Character analysis, poetry projects  
- **AP US History**: DBQ practice, reading assignments
- **AP Chemistry**: Lab experiments, problem sets

## Future Enhancements
- Support for additional LMS platforms (Canvas, Google Classroom)
- Grade import and progress tracking
- Assignment completion feedback loop
- Group project coordination
- Parent/teacher progress visibility
- Mobile app notifications
- Offline sync capabilities

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check internet connection and Schoology credentials
2. **No Assignments Synced**: Verify assignments exist and are visible in Schoology
3. **Incorrect Time Estimates**: Manually adjust estimates in task modal
4. **Sync Not Working**: Check auto-sync settings and enable if needed

### Support
For technical support or feature requests, contact the development team or check the application logs for detailed error information.
