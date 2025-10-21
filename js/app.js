// ==================== ATHR PLATFORM CORE ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// ==================== AUTH ====================

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date().toISOString()
      });
      return { success: true, user: userDoc.data() };
    }
  } catch (error) {
    return { success: false, error: error.code };
  }
}

export async function signup(email, password, name, university) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      name: name,
      university: university, // ✅ جديد
      avatar: null, // ✅ جديد
      ownedLectures: [], // ✅ جديد
      role: 'student',
      createdAt: new Date().toISOString()
    });
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.code };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('athr_user');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.code };
  }
}
