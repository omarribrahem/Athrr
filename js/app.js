// ==========================================
// ✅ ATHR PLATFORM CORE - V5.0 FINAL
// Username + Phone + Fixed & Simplified
// ==========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ==========================================
// 🔥 FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAp7yAWtWdXOC7iFr-M5kRJNTYXy3FzYyM",
  authDomain: "athr-9356f.firebaseapp.com",
  projectId: "athr-9356f",
  storageBucket: "athr-9356f.firebasestorage.app",
  messagingSenderId: "17656594096",
  appId: "1:17656594096:web:1b7edd28b8770e47fcc575",
  measurementId: "G-Y9M6KT3EG4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ==========================================
// 🎨 AVATAR CONFIGURATION
// ==========================================
export const AVATAR_STYLE = 'adventurer';
export const AVATAR_API_VERSION = '9.x';

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
];

export function getRandomAvatarConfig() {
  return AVATAR_CONFIGS[Math.floor(Math.random() * AVATAR_CONFIGS.length)];
}

export function generateAvatarUrl(seed, params = '') {
  if (!params) {
    const config = AVATAR_CONFIGS.find(c => c.seed === seed) || getRandomAvatarConfig();
    params = config.params;
  }
  return `https://api.dicebear.com/${AVATAR_API_VERSION}/${AVATAR_STYLE}/svg?seed=${encodeURIComponent(seed)}&${params}`;
}

// ==========================================
// 💾 CACHING
// ==========================================
let cachedUser = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

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
    'invalid-username-length': 'اسم المستخدم يجب أن يكون بين 3 و 20 حرف',
    'invalid-username-format': 'اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط',
    'username-taken': 'اسم المستخدم مستخدم بالفعل',
    'invalid-phone': 'رقم الهاتف غير صحيح',
    'user-not-found': 'المستخدم غير موجود في قاعدة البيانات',
    'weak-password': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'firestore-save-failed': 'فشل حفظ البيانات'
  };
  return errors[errorCode] || 'حدث خطأ غير متوقع';
}

// ==========================================
// ✅ LOGIN
// ==========================================
export async function login(email, password) {
  try {
    if (!email || !password) {
      return { 
        success: false, 
        error: 'missing-fields', 
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' 
      };
    }

    console.log('🔄 Attempting login...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Auth login successful');
    
    const userRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('❌ User not found in Firestore');
      return { 
        success: false, 
        error: 'user-not-found', 
        message: 'المستخدم غير موجود في قاعدة البيانات' 
      };
    }

    await updateDoc(userRef, { lastLogin: serverTimestamp() });
    cachedUser = userDoc.data();
    cacheTimestamp = Date.now();

    console.log('✅ Login successful:', cachedUser.name || cachedUser.username);
    return { success: true, user: cachedUser };
  } catch (error) {
    console.error('❌ Login error:', error);
    return { 
      success: false, 
      error: error.code, 
      message: getErrorMessage(error.code) 
    };
  }
}

// ==========================================
// ✅ SIGNUP V5.0 - FIXED & SIMPLIFIED
// ==========================================
export async function signup(email, password, username, phone, name = '') {
  try {
    // ✅ STEP 1: Validate Required Fields
    if (!email || !password || !username || !phone) {
      return { 
        success: false, 
        error: 'missing-fields', 
        message: 'يرجى ملء جميع الحقول المطلوبة' 
      };
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // ✅ STEP 2: Validate Username
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return { 
        success: false, 
        error: 'invalid-username-length', 
        message: 'اسم المستخدم يجب أن يكون بين 3 و 20 حرف' 
      };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return { 
        success: false, 
        error: 'invalid-username-format', 
        message: 'اسم المستخدم يجب أن يحتوي على حروف إنجليزية وأرقام و _ فقط' 
      };
    }

    // ✅ STEP 3: Check if username is available
    console.log('🔄 Checking username availability...');
    const usernameDoc = await getDoc(doc(db, 'usernames', trimmedUsername));
    if (usernameDoc.exists()) {
      return { 
        success: false, 
        error: 'username-taken', 
        message: 'اسم المستخدم مستخدم بالفعل، اختر اسماً آخر' 
      };
    }
    console.log('✅ Username available');

    // ✅ STEP 4: Validate Phone
    if (!/^(010|011|012|015)[0-9]{8}$/.test(trimmedPhone)) {
      return { 
        success: false, 
        error: 'invalid-phone', 
        message: 'رقم الهاتف غير صحيح (مثال: 01012345678)' 
      };
    }

    // ✅ STEP 5: Validate Password
    if (password.length < 6) {
      return { 
        success: false, 
        error: 'weak-password', 
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' 
      };
    }

    console.log('🔄 Step 1: Creating auth user...');
    
    // ✅ STEP 6: Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Auth user created:', user.uid);

    // ✅ STEP 7: Send Email Verification (optional)
    try {
      await sendEmailVerification(user);
      console.log('✅ Verification email sent');
    } catch (e) {
      console.warn('⚠️ Failed to send verification email:', e);
    }

    // ✅ STEP 8: Generate Avatar
    const randomConfig = getRandomAvatarConfig();
    const avatarUrl = generateAvatarUrl(randomConfig.seed, randomConfig.params);

    console.log('🔄 Step 2: Preparing user data...');

    // ✅ STEP 9: Prepare User Data (SIMPLE)
    const userData = {
      uid: user.uid,
      email: email,
      username: trimmedUsername,
      phone: trimmedPhone,
      name: name.trim() || trimmedUsername,
      role: 'student',
      avatar: avatarUrl,
      avatarSeed: randomConfig.seed,
      avatarParams: randomConfig.params,
      avatarStyle: AVATAR_STYLE,
      emailVerified: false,
      lectures: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    console.log('🔄 Step 3: Saving to Firestore...');
    console.log('User data:', JSON.stringify(userData, null, 2));

    // ✅ STEP 10: Save to Firestore (WITH ERROR HANDLING)
    try {
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ SUCCESS: User document saved!');
    } catch (firestoreError) {
      console.error('❌ FIRESTORE ERROR:', firestoreError);
      console.error('Error code:', firestoreError.code);
      console.error('Error message:', firestoreError.message);
      
      // Rollback: Delete auth user
      console.log('🔄 Rolling back: Deleting auth user...');
      try {
        await user.delete();
        console.log('✅ Auth user deleted');
      } catch (deleteError) {
        console.error('❌ Failed to delete auth user:', deleteError);
      }
      
      return {
        success: false,
        error: 'firestore-save-failed',
        message: 'فشل حفظ البيانات: ' + firestoreError.message
      };
    }

    // ✅ STEP 11: Create username mapping
    console.log('🔄 Step 4: Creating username mapping...');
    try {
      await setDoc(doc(db, 'usernames', trimmedUsername), {
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      console.log('✅ Username mapping created');
    } catch (e) {
      console.warn('⚠️ Username mapping failed (non-critical):', e);
    }

    // ✅ STEP 12: Initialize study time
    console.log('🔄 Step 5: Initializing study time...');
    try {
      await setDoc(doc(db, 'studyTime', user.uid), {
        userId: user.uid,
        totalMinutes: 0,
        sessions: [],
        lectureStats: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Study time initialized');
    } catch (e) {
      console.warn('⚠️ Study time init failed (non-critical):', e);
    }

    console.log('🎉 SIGNUP COMPLETE!');
    
    return { 
      success: true, 
      user: user,
      message: 'تم إنشاء الحساب بنجاح!' 
    };

  } catch (error) {
    console.error('❌ SIGNUP ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    return { 
      success: false, 
      error: error.code, 
      message: getErrorMessage(error.code) 
    };
  }
}

// ==========================================
// ✅ CHECK USERNAME AVAILABILITY
// ==========================================
export async function checkUsernameAvailability(username) {
  try {
    const trimmedUsername = username.trim().toLowerCase();
    
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return { available: false, message: 'اسم المستخدم يجب أن يكون بين 3 و 20 حرف' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return { available: false, message: 'استخدم حروف إنجليزية وأرقام و _ فقط' };
    }
    
    const usernameDoc = await getDoc(doc(db, 'usernames', trimmedUsername));
    
    if (usernameDoc.exists()) {
      return { available: false, message: 'اسم المستخدم مستخدم بالفعل' };
    }
    
    return { available: true, message: 'اسم المستخدم متاح ✓' };
  } catch (error) {
    console.error('❌ Error checking username:', error);
    return { available: false, message: 'خطأ في التحقق' };
  }
}

// ==========================================
// ✅ LOGOUT
// ==========================================
export async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('athr_user');
    cachedUser = null;
    cacheTimestamp = null;
    console.log('✅ Logout successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { 
      success: false, 
      error: error.code, 
      message: getErrorMessage(error.code) 
    };
  }
}

// ==========================================
// ✅ GET CURRENT USER
// ==========================================
export async function getCurrentUser(forceRefresh = false) {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const now = Date.now();
  
  if (!forceRefresh && cachedUser && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedUser;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      cachedUser = userDoc.data();
      cacheTimestamp = now;
      return cachedUser;
    }
    console.warn('⚠️ User document not found in Firestore');
    return null;
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    return cachedUser;
  }
}

// ==========================================
// ✅ CHECK ADMIN
// ==========================================
export async function isAdmin(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().role === 'admin';
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
}

// ==========================================
// ✅ UPDATE USER PROFILE
// ==========================================
export async function updateUserProfile(userId, updates) {
  try {
    const userRef = doc(db, 'users', userId);
    const safeUpdates = {};
    
    const allowedFields = ['name', 'phone', 'avatar', 'avatarSeed', 'avatarParams'];
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    }
    
    safeUpdates.updatedAt = serverTimestamp();
    
    console.log('🔄 Updating profile:', safeUpdates);
    await updateDoc(userRef, safeUpdates);
    
    cachedUser = null;
    console.log('✅ Profile updated successfully');
    
    return { success: true, message: 'تم تحديث البيانات بنجاح' };
  } catch (error) {
    console.error('❌ Profile update error:', error);
    return { 
      success: false, 
      error: error.code, 
      message: getErrorMessage(error.code) 
    };
  }
}

// ==========================================
// ✅ AUTH STATE LISTENER
// ==========================================
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ==========================================
// ✅ REFRESH TOKEN
// ==========================================
export async function refreshAuth() {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      await user.getIdToken(true);
      cachedUser = null;
      console.log('✅ Auth token refreshed');
      return { success: true };
    }
    return { success: false, error: 'no-user' };
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    return { success: false, error: error.code };
  }
}

// ==========================================
// 🛠️ DEBUG HELPER
// ==========================================
export function debugFirebase() {
  console.log('=== Firebase Debug Info ===');
  console.log('Auth:', auth);
  console.log('DB:', db);
  console.log('Current User:', auth.currentUser);
  console.log('Cached User:', cachedUser);
  console.log('=========================');
}

window.debugFirebase = debugFirebase;

console.log('✅ App.js V5.0 FINAL Ready - Fixed & Simplified');
