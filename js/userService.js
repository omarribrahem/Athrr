// js/userService.js
import { supabase } from './app.js';

let cachedUser = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
      console.warn('⚠️ User not found in database')
      return null
    }

    // Check active status
    if (userData.is_active === false) {
      await logout()
      return null
    }

    cachedUser = userData
    cacheTimestamp = now
    return cachedUser
  } catch (error) {
    console.error('❌ Error fetching user:', error)
    return cachedUser
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const safeUpdates = {}

    const allowedFields = ['name', 'username', 'phone_number', 'avatar']

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key]
      }
    }

    safeUpdates.updated_at = new Date().toISOString()

    console.log('🔄 Updating profile:', Object.keys(safeUpdates))

    const { error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('uid', userId)

    if (error) throw error

    // Log action (non-blocking)
    supabase.rpc('log_user_action', {
      user_uuid: userId,
      action: 'profile_updated',
      target: null,
      extra_data: { fields: Object.keys(safeUpdates) }
    }).catch(err => console.warn('⚠️ Log failed:', err))

    cachedUser = null
    console.log('✅ Profile updated')

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

export async function validateUsername(username) {
  try {
    // Client validation
    if (typeof window.validateUsername === 'function') {
      const clientCheck = window.validateUsername(username)
      if (!clientCheck.valid) {
        return clientCheck
      }
      username = clientCheck.username
    }

    // Server validation
    const { data, error } = await supabase.rpc('validate_username', {
      username_input: username
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error('❌ Username validation error:', error)
    return { valid: false, error: 'خطأ في التحقق من اسم المستخدم' }
  }
}

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
    console.error('❌ Admin check error:', error)
    return false
  }
}
