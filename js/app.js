// ==========================================
// ✅ ATHR PLATFORM CORE - FINAL V4.0 (MIXED AVATARS)
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
  storageBucket: "athr-platform-21b06.firebasestorage.app",
  messagingSenderId: "895928710949",
  appId: "1:895928710949:web:a738b5c2f0d367543f4ccc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ==========================================
// 🎨 AVATAR CONFIGURATION - MIXED STYLES
// ==========================================
const AVATAR_API_VERSION = '9.x';

// ✅ Avatar Configs مع Adventurer + Lorelei
const AVATAR_CONFIGS = [
  // 🧑 Adventurer - ذكور
  {
    seed: 'Ahmad',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02'
  },
  {
    seed: 'Omar',
    style: 'adventurer',
    params: 'eyebrows=variant01&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574'
  },
  {
    seed: 'Ali',
    style: 'adventurer',
    params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1'
  },
  {
    seed: 'Youssef',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant16&skinColor=d4a574'
  },
  {
    seed: 'Mohamed',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574'
  },
  {
    seed: 'Ibrahim',
    style: 'adventurer',
    params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1'
  },
  
  // 👩 Adventurer - إناث
  {
    seed: 'Sara',
    style: 'adventurer',
    params: 'eyebrows=variant01&eyes=variant22&hair=long03&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Nour',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant01&hair=long06&hairColor=6a4e35&mouth=variant23&skinColor=d4a574'
  },
  {
    seed: 'Maryam',
    style: 'adventurer',
    params: 'eyebrows=variant01&eyes=variant22&hair=long08&hairColor=4a312c&mouth=variant26&skinColor=f2d3b1'
  },
  {
    seed: 'Huda',
    style: 'adventurer',
    params: 'eyebrows=variant03&eyes=variant01&hair=long04&hairColor=6a4e35&mouth=variant25&skinColor=d4a574'
  },
  {
    seed: 'Amira',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant22&hair=long09&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Fatima',
    style: 'adventurer',
    params: 'eyebrows=variant01&eyes=variant01&hair=long20&hairColor=6a4e35&mouth=variant23&skinColor=d4a574&glasses=variant02'
  },
  
  // 💫 Adventurer - كلمات محايدة
  {
    seed: 'Success',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1'
  },
  {
    seed: 'Victory',
    style: 'adventurer',
    params: 'eyebrows=variant01&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574'
  },
  {
    seed: 'Hope',
    style: 'adventurer',
    params: 'eyebrows=variant03&eyes=variant22&hair=long06&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Dream',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant01&hair=long03&hairColor=4a312c&mouth=variant23&skinColor=d4a574'
  },
  {
    seed: 'Scholar',
    style: 'adventurer',
    params: 'eyebrows=variant01&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02'
  },
  {
    seed: 'Wisdom',
    style: 'adventurer',
    params: 'eyebrows=variant02&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574&glasses=variant02'
  },
  {
    seed: 'Knowledge',
    style: 'adventurer',
    params: 'eyebrows=variant03&eyes=variant22&hair=long08&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Future',
    style: 'adventurer',
    params: 'eyebrows=variant01&eyes=variant01&hair=long04&hairColor=4a312c&mouth=variant23&skinColor=d4a574'
  },
  
  // ✨ Lorelei Avatars (جديد!)
  {
    seed: 'Luis',
    style: 'lorelei',
    params: 'eyebrows=variant13&eyes=variant21&glasses=variant04&glassesProbability=30&hair=variant18,variant45,variant21,variant16&mouth=happy18&nose=variant01'
  },
  {
    seed: 'Luna',
    style: 'lorelei',
    params: 'eyebrows=variant02&eyes=variant12&hair=variant08,variant20&mouth=happy01&nose=variant02'
  },
  {
    seed: 'Alex',
    style: 'lorelei',
    params: 'eyebrows=variant05&eyes=variant15&glasses=variant02&hair=variant12,variant25&mouth=happy10&nose=variant03'
  },
  {
    seed: 'Sofia',
    style: 'lorelei',
    params: 'eyebrows=variant08&eyes=variant18&hair=variant22,variant30&mouth=happy15&nose=variant01'
  },
  {
    seed: 'Zain',
    style: 'lorelei',
    params: 'eyebrows=variant10&eyes=variant20&glasses=variant03&hair=variant15,variant28&mouth=happy05&nose=variant02'
  }
];

// ==========================================
// 🎯 AVATAR HELPERS
// ==========================================
function getRandomAvatarConfig() {
  return AVATAR_CONFIGS[Math.floor(Math.random() * AVATAR_CONFIGS.length)];
}

function generateAvatarUrl(seed, params, style = 'adventurer') {
  return `https://api.dicebear.com/${AVATAR_API_VERSION}/${style}/svg?seed=${encodeURIComponent(seed)}&${params}`;
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
    'missing-fields': 'يرجى ملء جميع الحقول',
    'user-not-found': 'المستخدم غير موجود في قاعدة البيانات'
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
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp()
      });
      
      cachedUser = userDoc.data();
      cacheTimestamp = Date.now();
      
      return { 
        success: true, 
        user: userDoc.data() 
      };
    }
    
    return { 
      success: false, 
      error: 'user-not-found',
      message: 'المستخدم غير موجود في قاعدة البيانات'
    };
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
// ✅ SIGNUP (مع Mixed Avatars: Adventurer + Lorelei)
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
    } catch (emailError) {
      console.warn('⚠️ Email verification failed:', emailError);
    }
    
    // ✅ اختيار Avatar عشوائي (Adventurer أو Lorelei)
    const randomConfig = getRandomAvatarConfig();
    const avatarUrl = generateAvatarUrl(
      randomConfig.seed, 
      randomConfig.params,
      randomConfig.style
    );
    
    console.log('🎨 Selected avatar:', randomConfig.seed, 'Style:', randomConfig.style, 'URL:', avatarUrl);
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      name: name,
      university: university,
      avatar: avatarUrl,
      avatarSeed: randomConfig.seed,
      avatarParams: randomConfig.params,
      avatarStyle: randomConfig.style, // ← حفظ النوع
      role: 'student',
      emailVerified: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    // Create empty userLibrary
    await setDoc(doc(db, 'userLibrary', userCredential.user.uid), {
      uid: userCredential.user.uid,
      lectures: [],
      activatedAt: {},
      createdAt: serverTimestamp()
    });
    
    console.log('✅ User registered successfully with', randomConfig.style, 'avatar');
    
    return { 
      success: true,
      user: userCredential.user,
      message: 'تم إنشاء الحساب بنجاح!'
    };
  } catch (error) {
    console.error('❌ Signup error:', error);
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
// ✅ GET CURRENT USER (with caching)
// ==========================================
export async function getCurrentUser(forceRefresh = false) {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return null;
  }
  
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
    console.error('❌ Error fetching user:', error);
    return cachedUser;
  }
}

// ==========================================
// ✅ CHECK ADMIN
// ==========================================
export async function isAdmin(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
}

// ==========================================
// ✅ AUTH STATE LISTENER
// ==========================================
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ==========================================
// 🎯 EXPORT AVATAR CONFIGS & HELPERS
// ==========================================
export { 
  AVATAR_CONFIGS, 
  AVATAR_API_VERSION,
  getRandomAvatarConfig, 
  generateAvatarUrl 
};
