// ==========================================
// ✅ ATHR PLATFORM CORE - FINAL V3.0 
// Adventurer Avatars + Caching + Enhanced Auth
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
  apiKey: "AIzaSyDT5k6AYUESxKen1Pg45PuxX-2EG11TYss",
  authDomain: "athr-platform-21b06.firebaseapp.com",
  projectId: "athr-platform-21b06",
  storageBucket: "athr-platform-21b06.appspot.com",
  messagingSenderId: "895928710949",
  appId: "1:895928710949:web:a738b5c2f0d367543f4ccc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ==========================================
// 🎨 AVATAR CONFIGURATION - ADVENTURER
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
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    'missing-fields': 'يرجى ملء جميع الحقول',
    'user-not-found': 'المستخدم غير موجود في قاعدة البيانات',
    'weak-password': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
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

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { 
        success: false, 
        error: 'user-not-found', 
        message: 'المستخدم غير موجود في قاعدة البيانات' 
      };
    }

    await updateDoc(userRef, { lastLogin: serverTimestamp() });
    cachedUser = userDoc.data();
    cacheTimestamp = Date.now();

    return { success: true, user: cachedUser };
  } catch (error) {
    console.error('❌ خطأ الدخول:', error);
    return { 
      success: false, 
      error: error.code, 
      message: getErrorMessage(error.code) 
    };
  }
}

// ==========================================
// ✅ SIGNUP
// ==========================================
export async function signup(email, password, name, university) {
  try {
    if (!email || !password || !name || !university) {
      return { 
        success: false, 
        error: 'missing-fields', 
        message: 'يرجى ملء جميع الحقول' 
      };
    }

    if (password.length < 6) {
      return { 
        success: false, 
        error: 'weak-password', 
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' 
      };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    try { 
      await sendEmailVerification(userCredential.user); 
    } catch (e) { 
      console.warn('⚠️ تحذير التحقق من البريد:', e); 
    }

    const randomConfig = getRandomAvatarConfig();
    const avatarUrl = generateAvatarUrl(randomConfig.seed, randomConfig.params);

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      name,
      university,
      avatar: avatarUrl,
      avatarSeed: randomConfig.seed,
      avatarParams: randomConfig.params,
      avatarStyle: AVATAR_STYLE,
      role: 'student',
      emailVerified: userCredential.user.emailVerified === true,
      lectures: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    return { 
      success: true, 
      user: userCredential.user, 
      message: 'تم إنشاء الحساب بنجاح!' 
    };
  } catch (error) {
    console.error('❌ خطأ التسجيل:', error);
    return { 
      success: false, 
      error: error.code, 
      message: getErrorMessage(error.code) 
    };
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
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ الخروج:', error);
    return { 
      success: false, 
      error: error.code, 
      message: getErrorMessage(error.code) 
    };
  }
}

// ==========================================
// ✅ GET CURRENT USER (with caching)
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
    return null;
  } catch (error) {
    console.error('❌ خطأ جلب البيانات:', error);
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
    console.error('❌ خطأ التحقق من الإدارة:', error);
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
    
    // تحديد الحقول المسموحة
    const allowedFields = ['name', 'university', 'avatar', 'avatarSeed', 'avatarParams'];
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    }
    
    safeUpdates.updatedAt = serverTimestamp();
    
    await updateDoc(userRef, safeUpdates);
    cachedUser = null; // Clear cache for fresh data
    
    return { success: true, message: 'تم تحديث البيانات بنجاح' };
  } catch (error) {
    console.error('❌ خطأ التحديث:', error);
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
      return { success: true };
    }
    return { success: false, error: 'no-user' };
  } catch (error) {
    console.error('❌ خطأ تحديث الجلسة:', error);
    return { success: false, error: error.code };
  }
}

// ==========================================
// 📝 CONSOLE LOG
// ==========================================
console.log('✅ App.js V3.0 Ready - Adventurer Avatars Enabled');