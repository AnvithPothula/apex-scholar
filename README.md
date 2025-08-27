# Apex Scholar 🎓

An AI-powered study assistant designed to help students excel in Advanced Placement (AP) courses and exams.

## 🌟 Features

### 🤖 AI Tutors
- **Personalized Learning**: AI tutors specialized in each AP subject
- **Interactive Conversations**: Get instant help with questions and concepts
- **Secure Input Handling**: Advanced prompt injection protection
- **Dynamic Subject Selection**: Access all AP subjects through a unified interface

### 📝 Practice Tests
- **Authentic AP Exam Structure**: Practice tests that mirror real AP exam formats
- **Comprehensive Question Types**: 
  - Multiple Choice Questions (MCQ)
  - Short Answer Questions (SAQ)
  - Document-Based Questions (DBQ)
  - Long Essay Questions (LEQ)
  - Free Response Questions (FRQ)
- **Accurate Timing**: Proper time allocation matching official AP exam durations
- **Subject-Specific Content**: Tailored questions for each AP course

### 📅 Smart Scheduler
- **Intelligent Study Planning**: AI-powered scheduling based on your exam dates
- **Exam Dashboard**: Track all your AP exam schedules
- **Personalized Recommendations**: Study plans adapted to your progress

### ⚙️ Settings & Integrations
- **Schoology Integration**: Sync with your school's learning management system
- **User Preferences**: Customize your learning experience
- **Data Management**: Control your study data and privacy

## 🎯 Supported AP Subjects

The platform supports all major AP subjects including:
- **STEM**: Biology, Chemistry, Physics (1, 2, C), Calculus (AB, BC), Statistics, Computer Science (A, Principles)
- **Humanities**: English Language, English Literature, History (US, European, World), Art History
- **Social Sciences**: Psychology, Human Geography, Government & Politics (US, Comparative)
- **Languages**: Spanish, French, German, Chinese, Japanese, Italian, Latin
- **Arts**: Music Theory, Studio Art & Design
- **And many more...**

## 🛠️ Technology Stack

- **Frontend**: React 18 with modern hooks and context
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Custom UI library with Lucide React icons
- **Animations**: Framer Motion
- **AI Integration**: Google Gemini API
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Build Tool**: Webpack with Create React App

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/apex-scholar.git
   cd apex-scholar
   ```

2. **Install dependencies**
   ```bash
   cd ap-prep-hub
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `ap-prep-hub` directory:
   ```env
   REACT_APP_GEMINI_API_KEY=AIzaSyD9Rjt3n083o1gCqMk05DhvtVYUYIF_Alc

   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=AIzaSyDTEBAW1r2EALeZHltn-xhRloXB4UzokMI
   REACT_APP_FIREBASE_AUTH_DOMAIN=ai-study-helper-f2f24.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://ai-study-helper-f2f24-default-rtdb.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=ai-study-helper-f2f24
   REACT_APP_FIREBASE_STORAGE_BUCKET=ai-study-helper-f2f24.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=634347733489
   REACT_APP_FIREBASE_APP_ID=1:634347733489:web:d00a26255a993c2e308450
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-Q27DPEG7S5

   # EmailJS Configuration (for feedback form)
   REACT_APP_EMAILJS_SERVICE_ID=service_kry0eao
   REACT_APP_EMAILJS_TEMPLATE_ID=template_clug30b
   REACT_APP_EMAILJS_PUBLIC_KEY=q7C2QoIVA7UMJHC41
   ```

4. **Start the development server**
   ```bash
   cd ap-prep-hub
   npm start
   ```

The application will open at `http://localhost:3001`

## 📁 Project Structure

```
apex-scholar/
├── ap-prep-hub/                 # Main React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Main application pages
│   │   ├── contexts/           # React contexts (Auth, etc.)
│   │   ├── services/           # API and external services
│   │   ├── utils/              # Utility functions
│   │   └── constants/          # Application constants
│   ├── public/                 # Static assets
│   └── package.json
├── AP Course and Exam Descriptions/ # Official AP course materials
└── README.md
```

## 🔒 Security Features

- **Input Sanitization**: Comprehensive protection against prompt injection attacks
- **Secure Authentication**: Firebase-based user authentication
- **Data Privacy**: User data protection and privacy controls
- **Safe AI Interactions**: Validated prompts and responses

## 🧪 Testing

The application includes comprehensive testing for:
- Practice test generation accuracy
- Question type validation
- Timing calculations
- Security measures

## 📚 Course Materials

The repository includes official AP Course and Exam Descriptions for reference, ensuring that practice content aligns with current AP standards.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- College Board for AP course standards and guidelines
- Google Gemini for AI capabilities
- Firebase for backend services
- The open-source community for excellent tools and libraries

## 📧 Support

For support, email support@apexscholar.com or create an issue in this repository.

---

**Built with ❤️ for students pursuing academic excellence**
