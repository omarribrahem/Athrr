// ==========================================
// ✅ ATHR PLATFORM CORE - V10.0 ATOMIC
// Enhanced with Database V2.0 Functions
// SUPABASE VERSION - Production Ready
// ==========================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ==========================================
// 🔥 SUPABASE CONFIG
// ==========================================
const SUPABASE_URL = 'https://klsuvseiydbxcxtnnyou.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsc3V2c2VpeWRieGN4dG5ueW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjg1MzIsImV4cCI6MjA3ODYwNDUzMn0.2w-Rt8mEhsN6l5y3Y8wSRq1hVgRT3pL1Fy9rRnk1Vmo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ==========================================
// 🎨 AVATAR CONFIGURATION
// ==========================================
export const AVATAR_STYLE = 'adventurer'
export const AVATAR_API_VERSION = '9.x'

export const AVATAR_CONFIGS = [
  { seed: 'Ahmad',   params: 'eyebrows=variant02&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02' },
  { seed: 'Omar',    params: 'eyebrows=variant01&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574' },
  { seed: 'Ali',     params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1' },
  { seed: 'Youssef', params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant16&skinColor=d4a574' },
  { seed: 'Mohamed', params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574' },
  { seed: 'Ibrahim', params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1' },
  { seed: 'Sara',    params: 'eyebrows=variant01&eyes=variant22&hair=long03&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Nour',    params: 'eyebrows=variant02&eyes=variant01&hair=long06&hairColor=6a4e35&mouth=variant23&skinColor=d4a574' },
  { seed: 'Maryam',  params: 'eyebrows=variant01&eyes=variant22&hair=long08&hairColor=4a312c&mouth=variant26&skinColor=f2d3b1' },
  { seed: 'Huda',    params: 'eyebrows=variant03&eyes=variant01&hair=long04&hairColor=6a4e35&mouth=variant25&skinColor=d4a574' },
  { seed: 'Amira',   params: 'eyebrows=variant02&eyes=variant22&hair=long09&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Fatima',  params: 'eyebrows=variant01&eyes=variant01&hair=long20&hairColor=6a4e35&mouth=variant23&skinColor=d4a574&glasses=variant02' },
  { seed: 'Success', params: 'eyebrows=variant02&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1' },
  { seed: 'Victory', params: 'eyebrows=variant01&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574' },
  { seed: 'Hope',    params: 'eyebrows=variant03&eyes=variant22&hair=long06&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Dream',   params: 'eyebrows=variant02&eyes=variant01&hair=long03&hairColor=4a312c&mouth=variant23&skinColor=d4a574' },
  { seed: 'Scholar', params: 'eyebrows=variant01&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02' },
  { seed: 'Wisdom',  params: 'eyebrows=variant02&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574&glasses=variant02' },
  { seed: 'Knowledge', params: 'eyebrows=variant03&eyes=variant22&hair=long08&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Future',  params: 'eyebrows=variant01&eyes=variant01&hair=long04&hairColor=4a312c&mouth=variant23&skinColor=d4a574' }
]

export function getRandomAvatarConfig() {
  return AVATAR_CONFIGS[Math.floor(Math.random() * AVATAR_CONFIGS.length)]
}

export function generateAvatarUrl(seed, params = '') {
  if (!params) {
    const config = AVATAR_CONFIGS.find(c => c.seed === seed) || getRandomAvatarConfig()
    params = config.params
  }
  return `https://api.dicebear.com/${AVATAR_API_VERSION}/${AVATAR_STYLE}/svg?seed=${encodeURIComponent(seed)}&${params}`
}

// ==========================================
// 💾 CACHING
// ==========================================
let cachedUser = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000

// ==========================================
// ⚠️ ERROR MESSAGES
// ==========================================
function getErrorMessage(errorCode) {
  const errors = {
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/weak-password': 'كلمة المرور ضعيفة (6 أحرف على الأقل)',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/wrong-password': 'كلمة المرور خاطئة',
    'auth/too-many-requests': 'محاولات كثيرة جداً، حاول بعد قليل',
    'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
    'auth/invalid-credential': 'بيانات الدخول غير صحيحة',
    'permission-denied': 'خطأ في الصلاحيات',
    'missing-fields': 'يرجى ملء جميع الحقول',
    'user-not-found': 'المستخدم غير موجود في قاعدة البيانات',
    'weak-password': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'firestore-save-failed': 'فشل حفظ البيانات',
    'Invalid login credentials': 'بيانات الدخول غير صحيحة',
    'Email not confirmed': 'يرجى تأكيد البريد الإلكتروني أولاً',
    'username_taken': 'اسم المستخدم محجوز بالفعل',
    'email_taken': 'البريد الإلكتروني مستخدم بالفعل'
  }
  return errors[errorCode] || 'حدث خطأ غير متوقع'
}

// ==========================================
// ✅ LOGIN V10.0
// ==========================================
export async function login(email, password) {
  try {
    if (!email || !password) {
      return { 
        success: false, 
        error: 'missing-fields', 
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' 
      }
    }

    console.log('🔄 Attempting login...')
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('❌ Auth login error:', authError)
      return { 
        success: false, 
        error: authError.message, 
        message: getErrorMessage(authError.message)
      }
    }

    console.log('✅ Auth login successful')
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', authData.user.id)
      .single()

    if (userError || !userData) {
      console.error('❌ User not found in database')
      return { 
        success: false, 
        error: 'user-not-found', 
        message: 'المستخدم غير موجود في قاعدة البيانات' 
      }
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('uid', authData.user.id)

    // Log action
    await supabase.rpc('log_user_action', {
      user_uuid: authData.user.id,
      action: 'login',
      target: null,
      extra_data: {}
    })

    cachedUser = userData
    cacheTimestamp = Date.now()

    console.log('✅ Login successful:', cachedUser.email)
    return { success: true, user: cachedUser }
  } catch (error) {
    console.error('❌ Login error:', error)
    return { 
      success: false, 
      error: error.message, 
      message: getErrorMessage(error.message) 
    }
  }
}

// ==========================================
// ✅ VALIDATE USERNAME V10.0 (NEW)
// ==========================================
export async function validateUsername(username) {
  try {
    const { data, error } = await supabase.rpc('validate_username', {
      username_input: username
    })

    if (error) throw error

    return data // Returns {valid: true/false, error?: string, message?: string}
  } catch (error) {
    console.error('❌ Username validation error:', error)
    return { valid: false, error: 'خطأ في التحقق من اسم المستخدم' }
  }
}

// ==========================================
// ✅ SIGNUP V10.0 - ATOMIC WITH DATABASE FUNCTION
// ==========================================
export async function signup(email, password, name, username, phoneNumber = null) {
  try {
    // Validation
    if (!email || !password || !name || !username) {
      return { 
        success: false, 
        error: 'missing-fields', 
        message: 'يرجى ملء جميع الحقول المطلوبة' 
      }
    }

    if (password.length < 6) {
      return { 
        success: false, 
        error: 'weak-password', 
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' 
      }
    }

    const cleanUsername = username.toLowerCase().trim()
    
    // Validate username format
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      return {
        success: false,
        error: 'invalid-username',
        message: 'اسم المستخدم: حروف صغيرة وأرقام و _ فقط'
      }
    }

    // ✅ NEW: Use database validation function
    const validation = await validateUsername(cleanUsername)
    if (!validation.valid) {
      return {
        success: false,
        error: 'username-invalid',
        message: validation.error || 'اسم المستخدم غير صالح'
      }
    }

    console.log('🔄 Creating auth user...')
    
    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      console.error('❌ AUTH ERROR:', authError)
      return { 
        success: false, 
        error: authError.message, 
        message: getErrorMessage(authError.message) 
      }
    }

    const user = authData.user
    console.log('✅ Auth user created:', user.id)

    // Generate avatar
    const randomConfig = getRandomAvatarConfig()
    const avatarUrl = generateAvatarUrl(randomConfig.seed, randomConfig.params)

    console.log('🔄 Saving to database with atomic function...')

    // ✅ NEW: Use atomic create_user_account function
    const { data: createResult, error: createError } = await supabase.rpc('create_user_account', {
      user_uid: user.id,
      user_name: name,
      user_username: cleanUsername,
      user_email: email,
      user_avatar: avatarUrl
    })

    if (createError) {
      console.error('❌ DATABASE ERROR:', createError)
      
      // Rollback: delete auth user
      try {
        await supabase.auth.admin.deleteUser(user.id)
        console.log('✅ Auth user deleted (rollback)')
      } catch (deleteError) {
        console.error('❌ Failed to delete auth user:', deleteError)
      }
      
      return {
        success: false,
        error: 'firestore-save-failed',
        message: 'فشل حفظ البيانات: ' + createError.message
      }
    }

    // Check if creation was successful
    if (!createResult.success) {
      // Rollback
      try {
        await supabase.auth.admin.deleteUser(user.id)
      } catch (e) {
        console.error('❌ Rollback failed:', e)
      }

      return {
        success: false,
        error: createResult.error,
        message: createResult.message || getErrorMessage(createResult.error)
      }
    }

    console.log('✅ User document saved atomically!')
    console.log('🎉 SIGNUP COMPLETE!')
    
    return { 
      success: true, 
      user: user,
      message: 'تم إنشاء الحساب بنجاح!' 
    }

  } catch (error) {
    console.error('❌ SIGNUP ERROR:', error)
    
    return { 
      success: false, 
      error: error.message, 
      message: getErrorMessage(error.message) 
    }
  }
}

// ==========================================
// ✅ LOGOUT V10.0
// ==========================================
export async function logout() {
  try {
    const currentUserId = cachedUser?.uid

    const { error } = await supabase.auth.signOut()
    
    if (error) throw error

    // Log action before clearing cache
    if (currentUserId) {
      await supabase.rpc('log_user_action', {
        user_uuid: currentUserId,
        action: 'logout',
        target: null,
        extra_data: {}
      })
    }

    localStorage.removeItem('athr_user')
    cachedUser = null
    cacheTimestamp = null
    console.log('✅ Logout successful')
    return { success: true }
  } catch (error) {
    console.error('❌ Logout error:', error)
    return { 
      success: false, 
      error: error.message, 
      message: getErrorMessage(error.message) 
    }
  }
}

// ==========================================
// ✅ GET CURRENT USER V10.0
// ==========================================
export async function getCurrentUser(forceRefresh = false) {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null

  const now = Date.now()
  
  if (!forceRefresh && cachedUser && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedUser
  }

  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', authUser.id)
      .single()

    if (error || !userData) {
      console.warn('⚠️ User document not found in database')
      return null
    }

    cachedUser = userData
    cacheTimestamp = now
    return cachedUser
  } catch (error) {
    console.error('❌ Error fetching user data:', error)
    return cachedUser
  }
}

// ==========================================
// ✅ CHECK ADMIN
// ==========================================
export async function isAdmin(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('uid', userId)
      .single()

    if (error) return false
    return data?.role === 'admin'
  } catch (error) {
    console.error('❌ Error checking admin status:', error)
    return false
  }
}

// ==========================================
// ✅ UPDATE USER PROFILE V10.0
// ==========================================
export async function updateUserProfile(userId, updates) {
  try {
    const safeUpdates = {}
    
    const allowedFields = [
      'name',
      'username', 
      'phone_number',
      'avatar'
    ]
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key]
      }
    }
    
    safeUpdates.updated_at = new Date().toISOString()
    
    console.log('🔄 Updating profile:', safeUpdates)
    
    const { error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('uid', userId)

    if (error) throw error
    
    // Log action
    await supabase.rpc('log_user_action', {
      user_uuid: userId,
      action: 'profile_updated',
      target: null,
      extra_data: { fields: Object.keys(safeUpdates) }
    })
    
    cachedUser = null
    console.log('✅ Profile updated successfully')
    
    return { success: true, message: 'تم تحديث البيانات بنجاح' }
  } catch (error) {
    console.error('❌ Profile update error:', error)
    return { 
      success: false, 
      error: error.message, 
      message: getErrorMessage(error.message) 
    }
  }
}

// ==========================================
// ✅ AUTH STATE LISTENER
// ==========================================
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}

// ==========================================
// ✅ REFRESH TOKEN
// ==========================================
export async function refreshAuth() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) throw error
    
    cachedUser = null
    console.log('✅ Auth token refreshed')
    return { success: true }
  } catch (error) {
    console.error('❌ Token refresh error:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// 🛠️ DEBUG HELPER
// ==========================================
export async function debugSupabase() {
  console.log('=== Supabase Debug Info ===')
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current User:', user)
  console.log('Cached User:', cachedUser)
  console.log('Supabase Client:', supabase)
  console.log('=========================')
}

window.debugSupabase = debugSupabase

console.log('✅ App.js V10.0 ATOMIC - Production Ready with Database V2.0 Functions')
