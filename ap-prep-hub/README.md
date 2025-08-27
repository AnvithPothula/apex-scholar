# AP Prep Hub - AI-Powered Study Assistant

A modern, responsive web application that provides AI-powered tutoring for AP subjects and intelligent task scheduling. Built with React, Firebase, and Tailwind CSS.

## ✨ Features

### 🧠 AI Tutors
- **Subject-Specific AI Tutors**: Specialized AI assistants for all AP subjects
- **Personalized Learning**: AI adapts to your learning style and preferences
- **Real-time Chat**: Interactive conversations with instant responses
- **Context Awareness**: Remembers your learning preferences and study history

### 📅 Smart Scheduler
- **Task Management**: Create, edit, and organize study tasks
- **Calendar View**: Visual calendar with task deadlines
- **Priority System**: Difficulty levels and time estimates
- **Progress Tracking**: Mark tasks as complete and track your progress

### 🔐 Authentication
- **Secure Login**: Email/password and Google OAuth support
- **User Profiles**: Personalized settings and preferences
- **Data Persistence**: All your data is securely stored in Firebase

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on all devices
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Gradient Themes**: Modern color schemes and visual appeal
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Gemini API key (optional, for enhanced AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ap-prep-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Copy your config values to the `.env` file

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
ap-prep-hub/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── entities/           # Data models and types
│   ├── App.js             # Main application component
│   ├── Layout.js          # Application layout wrapper
│   └── utils.js           # Utility functions
├── public/                 # Static assets
├── .env                    # Environment variables
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Firebase Setup
1. **Authentication Rules**: Ensure your Firestore rules allow authenticated users to read/write their own data
2. **Security**: Set up proper security rules for your database
3. **Indexes**: Create composite indexes if needed for complex queries

### Gemini API (Optional)
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add it to your `.env` file
- The app will work without it but with limited AI functionality

## 🎯 Usage

### Creating Your First Task
1. Navigate to the Scheduler page
2. Click "Create Task" button
3. Fill in task details (name, subject, difficulty, deadline)
4. Save and see it appear in your calendar

### Starting a Chat with AI Tutor
1. Go to AI Tutors page
2. Select your subject
3. Start typing your question
4. Get instant, personalized help

### Customizing Your Experience
1. Go to Settings
2. Update your profile information
3. Customize your AI tutor preferences
4. Save your changes

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Other Platforms
- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop your build folder
- **AWS S3**: Upload build files to S3 bucket

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check your environment variables
   - Verify Firebase project settings
   - Ensure Firestore is enabled

2. **Authentication Issues**
   - Clear browser cache and cookies
   - Check Firebase Authentication settings
   - Verify Google OAuth configuration

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables are set

### Getting Help
- Check the browser console for error messages
- Verify your Firebase configuration
- Ensure all environment variables are properly set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Firebase**: Backend services and authentication
- **React**: Frontend framework
- **Tailwind CSS**: Styling and design system
- **Framer Motion**: Animations and transitions
- **Lucide React**: Beautiful icons

## 📞 Support

If you need help or have questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Firebase documentation

---

**Happy Studying! 🎓✨**
