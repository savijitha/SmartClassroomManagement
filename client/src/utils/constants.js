// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

// User Roles
export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
};

// Attendance Status Colors
export const ATTENDANCE_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: '#6B8F56',
  [ATTENDANCE_STATUS.ABSENT]: '#A75F2F',
  [ATTENDANCE_STATUS.LATE]: '#D2A74B'
};

// Assignment Status
export const ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  OVERDUE: 'overdue'
};

// Grade Letters
export const GRADE_LETTERS = ['A', 'B', 'C', 'D', 'F'];

// Grade Points
export const GRADE_POINTS = {
  'A': 4.0,
  'B': 3.0,
  'C': 2.0,
  'D': 1.0,
  'F': 0.0
};

// Grade Ranges
export const GRADE_RANGES = {
  'A': { min: 90, max: 100 },
  'B': { min: 80, max: 89 },
  'C': { min: 70, max: 79 },
  'D': { min: 60, max: 69 },
  'F': { min: 0, max: 59 }
};

// Days of Week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Months
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY h:mm A',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  INPUT: 'YYYY-MM-DD',
  INPUT_WITH_TIME: 'YYYY-MM-DDTHH:mm'
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  CLASS_NAME_MIN_LENGTH: 3,
  CLASS_NAME_MAX_LENGTH: 100,
  ASSIGNMENT_TITLE_MIN_LENGTH: 3,
  ASSIGNMENT_TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_NAME: 'Please enter a valid name',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Server error. Please try again later.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out!',
  CLASS_CREATED: 'Class created successfully!',
  CLASS_UPDATED: 'Class updated successfully!',
  ATTENDANCE_MARKED: 'Attendance marked successfully!',
  ASSIGNMENT_CREATED: 'Assignment created successfully!',
  ASSIGNMENT_SUBMITTED: 'Assignment submitted successfully!',
  GRADE_ADDED: 'Grade added successfully!'
};

// Navigation Items
export const NAV_ITEMS = {
  teacher: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/classes', label: 'My Classes', icon: '📚' },
    { path: '/attendance', label: 'Attendance', icon: '📋' },
    { path: '/assignments', label: 'Assignments', icon: '📝' },
    { path: '/grades', label: 'Grades', icon: '📊' }
  ],
  student: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/classes', label: 'My Classes', icon: '📚' },
    { path: '/attendance', label: 'My Attendance', icon: '📋' },
    { path: '/assignments', label: 'Assignments', icon: '📝' },
    { path: '/grades', label: 'My Grades', icon: '📊' }
  ]
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#800000',
  secondary: '#98A869',
  success: '#6B8F56',
  warning: '#D2A74B',
  error: '#A75F2F',
  info: '#A9CBB1',
  background: '#FFF8E7',
  text: '#2C2C2C',
  light: '#F5F5F5'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100]
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Notification Durations (in milliseconds)
export const NOTIFICATION_DURATIONS = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000
};

// Theme Colors (matching CSS variables)
export const THEME_COLORS = {
  maroon: {
    primary: '#800000',
    dark: '#550000',
    light: '#A52A2A',
    soft: '#9E3B3B'
  },
  cream: {
    primary: '#FFF8E7',
    dark: '#F5E6D3',
    ivory: '#FFFFF0',
    beige: '#F8F3E9'
  },
  sage: {
    primary: '#98A869',
    dark: '#6B8F56',
    light: '#A9CBB1'
  },
  accent: {
    gold: '#D2A74B',
    peach: '#FFD6D1'
  }
};

// Export all constants as default object
export default {
  API_CONFIG,
  USER_ROLES,
  ATTENDANCE_STATUS,
  ATTENDANCE_COLORS,
  ASSIGNMENT_STATUS,
  GRADE_LETTERS,
  GRADE_POINTS,
  GRADE_RANGES,
  DAYS_OF_WEEK,
  MONTHS,
  DATE_FORMATS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NAV_ITEMS,
  CHART_COLORS,
  STORAGE_KEYS,
  PAGINATION,
  FILE_UPLOAD,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATIONS,
  THEME_COLORS
};