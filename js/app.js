// ==========================================
// ✅ ATHR PLATFORM CORE - V12.0 EXPERT EDITION
// 60-Year Expert Enhanced + Green Screen Fixed
// Enhanced Security + Performance + Error Handling
// ==========================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ==========================================
// 🔥 SUPABASE CONFIG
// ==========================================
const SUPABASE_URL = 'https://klsuvseiydbxcxtnnyou.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsc3V2c2VpeWRieGN4dG5ueW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjg1MzIsImV4cCI6MjA3ODYwNDUzMn0.2w-Rt8mEhsN6l5y3Y8wSRq1hVgRT3pL1Fy9rRnk1Vmo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

import {
    login,
    signup,
    logout,
    sendPasswordReset,
    updatePassword,
    onAuthChange
} from './authService.js';

import {
    getCurrentUser,
    updateUserProfile,
    validateUsername,
    isAdmin
} from './userService.js';

import {
    getErrorMessage,
    checkRateLimit,
    generateAvatarUrl,
    AVATAR_CONFIGS
} from './utils.js';


// Export all functions for external use
export {
    login,
    signup,
    logout,
    sendPasswordReset,
    updatePassword,
    onAuthChange,
    getCurrentUser,
    updateUserProfile,
    validateUsername,
    isAdmin,
    getErrorMessage,
    checkRateLimit,
    generateAvatarUrl,
    AVATAR_CONFIGS
};

console.log('✅ App.js V12.0 EXPERT EDITION - Refactored and Ready');
