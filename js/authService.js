// js/authService.js
import { supabase } from './app.js';
import { getErrorMessage, checkRateLimit } from './utils.js';
import { getCurrentUser, updateUserProfile, validateUsername } from './userService.js';

export async function login(email, password) {
  try {
    if (!email || !password) {
      return {
        success: false,
        error: 'missing-fields',
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
      }
    }

    // Rate limiting
    const rateCheck = checkRateLimit('login', 5)
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'rate-limited',
        message: `محاولات كثيرة جداً. حاول بعد ${Math.ceil(rateCheck.waitTime / 1000)} ثانية`
      }
    }

    // Email validation
    if (typeof window.validateEmail === 'function') {
      const emailCheck = window.validateEmail(email)
      if (!emailCheck.valid) {
        return {
          success: false,
          error: 'invalid-email',
          message: emailCheck.error
        }
      }
      email = emailCheck.email
    }

    console.log('🔄 Login attempt for:', email)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return {
        success: false,
        error: authError.message,
        message: getErrorMessage(authError.message)
      }
    }

    console.log('✅ Auth successful')

    // Fetch user data
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

    // Check active status
    if (userData.is_active === false) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'user-disabled',
        message: 'تم تعطيل هذا الحساب'
      }
    }

    // Update last login (non-blocking)
    supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('uid', authData.user.id)
      .then(() => console.log('✅ Last login updated'))
      .catch(err => console.warn('⚠️ Last login update failed:', err))

    // Log action (non-blocking)
    supabase.rpc('log_user_action', {
      user_uuid: authData.user.id,
      action: 'login',
      target: null,
      extra_data: {}
    }).catch(err => console.warn('⚠️ Log failed:', err))

    // Cache user
    cachedUser = userData
    cacheTimestamp = Date.now()
    lastActivityTime = Date.now()

    // Start session monitoring
    startSessionMonitoring()

    console.log('✅ Login complete:', cachedUser.email)
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

export async function signup(email, password, name, username, phoneNumber = null) {
  try {
    // Rate limiting
    const rateCheck = checkRateLimit('signup', 3)
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'rate-limited',
        message: `محاولات كثيرة. حاول بعد ${Math.ceil(rateCheck.waitTime / 1000)} ثانية`
      }
    }

    // Validation
    if (!email || !password || !name || !username) {
      return {
        success: false,
        error: 'missing-fields',
        message: 'يرجى ملء جميع الحقول المطلوبة'
      }
    }

    // Password validation
    if (typeof window.validatePassword === 'function') {
      const passCheck = window.validatePassword(password)
      if (!passCheck.valid) {
        return {
          success: false,
          error: 'weak-password',
          message: passCheck.error
        }
      }
    } else if (password.length < 8) {
      return {
        success: false,
        error: 'weak-password',
        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      }
    }

    // Email validation
    if (typeof window.validateEmail === 'function') {
      const emailCheck = window.validateEmail(email)
      if (!emailCheck.valid) {
        return {
          success: false,
          error: 'invalid-email',
          message: emailCheck.error
        }
      }
      email = emailCheck.email
    }

    const cleanUsername = username.toLowerCase().trim()

    // Validate username
    const validation = await validateUsername(cleanUsername)
    if (!validation.valid) {
      return {
        success: false,
        error: 'username-invalid',
        message: validation.error || 'اسم المستخدم غير صالح'
      }
    }

    console.log('🔄 Creating auth user...')

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
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

    console.log('🔄 Saving to database...')

    // Use atomic function
    const { data: createResult, error: createError } = await supabase.rpc('create_user_account', {
      user_uid: user.id,
      user_name: name,
      user_username: cleanUsername,
      user_email: email,
      user_avatar: avatarUrl
    })

    if (createError || !createResult?.success) {
      console.error('❌ Database error:', createError || createResult)

      // Soft delete
      try {
        await supabase
          .from('users')
          .update({ is_active: false })
          .eq('uid', user.id)
        console.log('✅ Rollback: User marked inactive')
      } catch (e) {
        console.error('❌ Rollback failed:', e)
      }

      return {
        success: false,
        error: createResult?.error || 'database-error',
        message: createResult?.message || 'فشل حفظ البيانات'
      }
    }

    console.log('✅ Signup complete!')

    return {
      success: true,
      user: user,
      message: 'تم إنشاء الحساب بنجاح!'
    }

  } catch (error) {
    console.error('❌ Signup error:', error)

    return {
      success: false,
      error: error.message,
      message: getErrorMessage(error.message)
    }
  }
}

export async function logout() {
  try {
    const currentUserId = cachedUser?.uid

    const { error } = await supabase.auth.signOut()

    if (error) throw error

    // Log action (non-blocking)
    if (currentUserId) {
      supabase.rpc('log_user_action', {
        user_uuid: currentUserId,
        action: 'logout',
        target: null,
        extra_data: {}
      }).catch(err => console.warn('⚠️ Log failed:', err))
    }

    // Clear cache
    localStorage.removeItem('athr_user')
    cachedUser = null
    cacheTimestamp = null
    stopSessionMonitoring()

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

export async function sendPasswordReset(email) {
  try {
    if (!email) {
      return {
        success: false,
        error: 'missing-email',
        message: 'يرجى إدخال البريد الإلكتروني'
      }
    }

    // Rate limiting
    const rateCheck = checkRateLimit('password_reset', 3)
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'rate-limited',
        message: `محاولات كثيرة. حاول بعد ${Math.ceil(rateCheck.waitTime / 1000)} ثانية`
      }
    }

    console.log('🔄 Sending password reset...')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    })

    if (error) {
      console.error('❌ Password reset error:', error)
      return {
        success: false,
        error: error.message,
        message: getErrorMessage(error.message)
      }
    }

    console.log('✅ Password reset email sent')
    return {
      success: true,
      message: 'تم إرسال رابط إعادة التعيين إلى بريدك'
    }
  } catch (error) {
    console.error('❌ Password reset error:', error)
    return {
      success: false,
      error: error.message,
      message: 'حدث خطأ في إرسال البريد'
    }
  }
}

export async function updatePassword(newPassword) {
  try {
    if (typeof window.validatePassword === 'function') {
      const passCheck = window.validatePassword(newPassword)
      if (!passCheck.valid) {
        return {
          success: false,
          error: 'weak-password',
          message: passCheck.error
        }
      }
    } else if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: 'weak-password',
        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    // Log action (non-blocking)
    const user = await getCurrentUser()
    if (user) {
      supabase.rpc('log_user_action', {
        user_uuid: user.uid,
        action: 'password_changed',
        target: null,
        extra_data: {}
      }).catch(err => console.warn('⚠️ Log failed:', err))
    }

    console.log('✅ Password updated')
    return {
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح'
    }
  } catch (error) {
    console.error('❌ Password update error:', error)
    return {
      success: false,
      error: error.message,
      message: getErrorMessage(error.message)
    }
  }
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      startSessionMonitoring()
    } else if (event === 'SIGNED_OUT') {
      stopSessionMonitoring()
    }
    callback(session?.user || null)
  })
}
