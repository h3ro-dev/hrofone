// Empathy Engine Configuration
// Making HR interactions feel human and caring

export const EmpathyEngineConfig = {
  // Core Settings
  name: 'HR of One Empathy Engine',
  version: '1.0.0',
  
  // Emotional Intelligence Settings
  emotionalIntelligence: {
    sentimentThresholds: {
      veryPositive: 0.8,
      positive: 0.5,
      neutral: 0,
      negative: -0.5,
      veryNegative: -0.8
    },
    
    emotionCategories: [
      'happy',
      'stressed',
      'anxious',
      'frustrated',
      'confused',
      'grateful',
      'overwhelmed',
      'excited',
      'sad',
      'angry'
    ],
    
    escalationTriggers: {
      keywords: [
        'crisis',
        'emergency',
        'harassment',
        'discrimination',
        'suicide',
        'violence',
        'abuse',
        'legal action'
      ],
      sentimentThreshold: -0.7,
      emotionIntensity: 0.8
    }
  },
  
  // Response Personality
  personality: {
    traits: {
      warmth: 0.9,
      professionalism: 0.8,
      empathy: 0.95,
      humor: 0.3,
      formality: 0.4
    },
    
    toneProfiles: {
      supportive: {
        warmth: 1.0,
        empathy: 1.0,
        formality: 0.3
      },
      celebratory: {
        warmth: 0.9,
        humor: 0.7,
        empathy: 0.8
      },
      informative: {
        professionalism: 0.9,
        formality: 0.6,
        warmth: 0.7
      },
      urgent: {
        professionalism: 1.0,
        formality: 0.8,
        empathy: 0.7
      }
    }
  },
  
  // Proactive Care Settings
  proactiveCare: {
    enabled: true,
    
    checkInTriggers: {
      noTimeOffDays: 60,
      highWorkloadDays: 14,
      anniversaryDaysBefore: 7,
      birthdayDaysBefore: 3,
      benefitsEnrollmentDaysBefore: 30,
      performanceReviewDaysBefore: 14
    },
    
    wellnessIndicators: {
      overtimeHoursPerWeek: 10,
      consecutiveWorkDays: 10,
      lateNightEmailsPerWeek: 5,
      weekendWorkInstances: 2
    }
  },
  
  // Interaction Preferences
  interactions: {
    maxResponseLength: 300,
    useEmojis: true,
    personalizeGreetings: true,
    rememberContext: true,
    contextWindowSize: 10,
    
    responseStyles: {
      conversational: 0.8,
      formal: 0.2
    }
  },
  
  // Privacy and Security
  privacy: {
    dataRetentionDays: 365,
    anonymizeAfterDays: 30,
    requireExplicitConsent: true,
    allowDataExport: true,
    encryptSensitiveData: true
  },
  
  // Integration Points
  integrations: {
    hrSystems: [
      'payroll',
      'benefits',
      'timeOff',
      'performance',
      'learning'
    ],
    
    communicationChannels: [
      'web_chat',
      'email',
      'slack',
      'teams',
      'mobile_app'
    ],
    
    analyticsTools: [
      'sentiment_tracker',
      'engagement_metrics',
      'wellness_dashboard'
    ]
  },
  
  // Feature Flags
  features: {
    sentimentAnalysis: true,
    proactiveCheckIns: true,
    emotionalIntelligence: true,
    multiLanguageSupport: false,
    voiceInterface: false,
    predictiveAnalytics: true,
    personalizedLearning: true
  },
  
  // Design System Integration
  ui: {
    primaryColor: '#4169E1', // Utlyze Blue
    accentColor: '#3498DB',
    successColor: '#27AE60',
    warningColor: '#F39C12',
    errorColor: '#E74C3C',
    
    avatarStyle: 'friendly_professional',
    animationLevel: 'subtle',
    accessibilityMode: 'WCAG_AA'
  }
};

// Emotion Detection Rules
export const EmotionRules = {
  stress: {
    keywords: ['overwhelmed', 'stressed', 'too much', 'burning out', 'exhausted'],
    patterns: /(?:can't|cannot) (?:keep up|handle|manage)/i,
    contextualFactors: ['high_workload', 'recent_overtime', 'deadline_pressure']
  },
  
  frustration: {
    keywords: ['frustrated', 'annoying', 'fed up', 'tired of', 'sick of'],
    patterns: /(?:why|how come) (?:can't|won't|doesn't)/i,
    contextualFactors: ['repeated_issues', 'unresolved_tickets', 'policy_confusion']
  },
  
  anxiety: {
    keywords: ['worried', 'anxious', 'nervous', 'concerned', 'scared'],
    patterns: /(?:what if|afraid|fear) (?:that|of)/i,
    contextualFactors: ['upcoming_review', 'job_security', 'major_change']
  },
  
  gratitude: {
    keywords: ['thank', 'appreciate', 'grateful', 'helpful', 'amazing'],
    patterns: /(?:thanks|thank you|appreciate)/i,
    contextualFactors: ['problem_resolved', 'positive_outcome', 'support_received']
  }
};

// Response Templates by Scenario
export const ResponseTemplates = {
  greeting: {
    morning: "Good morning, {name}! How can I help brighten your day? ☀️",
    afternoon: "Hi {name}! Hope your afternoon is going well. What can I do for you?",
    evening: "Good evening, {name}! How can I assist you today?"
  },
  
  acknowledgment: {
    stress: "I hear that you're feeling overwhelmed, and that's completely understandable. Let's work together to find some solutions.",
    frustration: "I understand your frustration, and I'm here to help make things easier for you.",
    gratitude: "You're very welcome! It's my pleasure to help. Is there anything else you need?"
  },
  
  proactive: {
    timeOff: "Hi {name}! I noticed you haven't taken time off in {days} days. Taking breaks is important for your wellbeing. Would you like to explore some time-off options?",
    anniversary: "Exciting news, {name}! Your {years}-year anniversary with us is coming up on {date}! 🎉 We're grateful for all you do!",
    wellness: "Hey {name}, I've noticed you've been putting in extra hours lately. Remember, your wellbeing matters to us. How are you doing?"
  }
};

export default EmpathyEngineConfig;