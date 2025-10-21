// ==================== ATHR PLATFORM CORE (IMPROVED) ====================
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

// ==================== CACHING ====================
let cachedUser = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

// ==================== ERROR MESSAGES ====================
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

// ==================== LOGIN ====================
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
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
}

// ==================== SIGNUP ====================
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
    
    // Send verification email (optional)
    try {
      await sendEmailVerification(userCredential.user);
    } catch (emailError) {
      console.warn('Email verification failed:', emailError);
    }
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      name: name,
      university: university,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
      role: 'student',
      emailVerified: false,
      createdAt: serverTimestamp(),
      lastLogin: null
    });
    
    // Create empty userLibrary document
    await setDoc(doc(db, 'userLibrary', userCredential.user.uid), {
      uid: userCredential.user.uid,
      lectures: [],
      activatedCodes: [],
      createdAt: serverTimestamp()
    });
    
    await signOut(auth);
    return { 
      success: true,
      message: 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن'
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
}

// ==================== LOGOUT ====================
export async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('athr_user');
    cachedUser = null;
    cacheTimestamp = null;
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { 
      success: false, 
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
}

// ==================== GET CURRENT USER ====================
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
    console.error('Error fetching user:', error);
    return cachedUser;
  }
}

// ==================== CHECK ADMIN ====================
export async function isAdmin(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// ==================== AUTH STATE LISTENER ====================
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
