 
// ==========================================
// ✅ ATHR PLATFORM CORE - FINAL V3.0 (ADVENTURER AVATARS)
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
// 🎨 AVATAR CONFIGURATION - ADVENTURER STYLE
// ==========================================
const AVATAR_STYLE = 'adventurer';
const AVATAR_API_VERSION = '9.x';


// ✅ Avatar Configs مع Customizations محترمة
const AVATAR_CONFIGS = [
  // 🧑 ذكور - محترم
  {
    seed: 'Ahmad',
    params: 'eyebrows=variant02&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02'
  },
  {
    seed: 'Omar',
    params: 'eyebrows=variant01&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574'
  },
  {
    seed: 'Ali',
    params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1'
  },
  {
    seed: 'Youssef',
    params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant16&skinColor=d4a574'
  },
  
  {
    seed: 'Mohamed',
    params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574'
  },
  {
    seed: 'Ibrahim',
    params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1'
  },
  
  
  // 👩 إناث - محترمة ومحتشمة
  {
    seed: 'Sara',
    params: 'eyebrows=variant01&eyes=variant22&hair=long03&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Nour',
    params: 'eyebrows=variant02&eyes=variant01&hair=long06&hairColor=6a4e35&mouth=variant23&skinColor=d4a574'
  },
  {
    seed: 'Maryam',
    params: 'eyebrows=variant01&eyes=variant22&hair=long08&hairColor=4a312c&mouth=variant26&skinColor=f2d3b1'
  },
  {
    seed: 'Huda',
    params: 'eyebrows=variant03&eyes=variant01&hair=long04&hairColor=6a4e35&mouth=variant25&skinColor=d4a574'
  },
  {
    seed: 'Amira',
    params: 'eyebrows=variant02&eyes=variant22&hair=long09&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Fatima',
    params: 'eyebrows=variant01&eyes=variant01&hair=long20&hairColor=6a4e35&mouth=variant23&skinColor=d4a574&glasses=variant02'
  },
  
  // 💫 كلمات محايدة - إيجابية
  {
    seed: 'Success',
    params: 'eyebrows=variant02&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1'
  },
  {
    seed: 'Victory',
    params: 'eyebrows=variant01&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574'
  },
  {
    seed: 'Hope',
    params: 'eyebrows=variant03&eyes=variant22&hair=long06&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Dream',
    params: 'eyebrows=variant02&eyes=variant01&hair=long03&hairColor=4a312c&mouth=variant23&skinColor=d4a574'
  },
  {
    seed: 'Scholar',
    params: 'eyebrows=variant01&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02'
  },
  {
    seed: 'Wisdom',
    params: 'eyebrows=variant02&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574&glasses=variant02'
  },
  {
    seed: 'Knowledge',
    params: 'eyebrows=variant03&eyes=variant22&hair=long08&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1'
  },
  {
    seed: 'Future',
    params: 'eyebrows=variant01&eyes=variant01&hair=long04&hairColor=4a312c&mouth=variant23&skinColor=d4a574'
  }
];


// ==========================================
// 🎯 AVATAR HELPERS
// ==========================================
function getRandomAvatarConfig() {
  return AVATAR_CONFIGS[Math.floor(Math.random() * AVATAR_CONFIGS.length)];
}


function generateAvatarUrl(seed, params) {
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
    // Validation
    if (!email || !password) {
      return {
        success: false,
        error: 'missing-fields',
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
      };
    }


    // Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      // Update last login
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp()
      });
      
      // Cache user data
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
// ✅ SIGNUP (مع Custom Adventurer Avatars)
// ==========================================
export async function signup(email, password, name, university) {
  try {
    // Validation
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
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email (optional)
    try {
      await sendEmailVerification(userCredential.user);
    } catch (emailError) {
      console.warn('⚠️ Email verification failed:', emailError);
    }
    
    // ✅ اختيار Avatar عشوائي مع customizations
    const randomConfig = getRandomAvatarConfig();
    const avatarUrl = generateAvatarUrl(randomConfig.seed, randomConfig.params);
    
    console.log('🎨 Selected avatar:', randomConfig.seed, 'URL:', avatarUrl);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      name: name,
      university: university,
      avatar: avatarUrl,
      avatarSeed: randomConfig.seed,
      avatarParams: randomConfig.params,
      avatarStyle: AVATAR_STYLE,
      role: 'student',
      emailVerified: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    // Create empty userLibrary document
    await setDoc(doc(db, 'userLibrary', userCredential.user.uid), {
      uid: userCredential.user.uid,
      lectures: [],
      activatedAt: {},
      createdAt: serverTimestamp()
    });
    
    console.log('✅ User registered successfully with custom avatar');
    
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
  
  // Use cache if valid
  if (!forceRefresh && cachedUser && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedUser;
  }
  
  // Fetch fresh data
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
    return cachedUser; // Return cached data on error
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
  AVATAR_STYLE, 
  AVATAR_API_VERSION,
  getRandomAvatarConfig, 
  generateAvatarUrl 
};
