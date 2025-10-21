// ==================== LECTURE AUTH - SHARED MODULE ====================
// استخدمه في كل محاضرة بدون تكرار الكود

import { auth, db } from './app.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentUser = null;

/**
 * ✅ فحص صلاحية الوصول للمحاضرة
 * @param {string} lectureId - معرّف المحاضرة (مثال: 'statistics_l1')
 * @param {function} onSuccess - Function يتم تنفيذها عند نجاح التحقق
 */
export async function checkLectureAccess(lectureId, onSuccess) {
  
  // Show loading
  showLoadingScreen();
  
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn('⚠️ No user logged in');
      alert('يجب تسجيل الدخول أولاً');
      
      // Redirect based on folder depth
      const depth = getLectureDepth();
      const loginPath = depth > 0 ? '../'.repeat(depth) + 'login.html' : 'login.html';
      window.location.href = loginPath;
      return;
    }
    
    currentUser = user;
    console.log('✅ User:', user.email);
    
    try {
      // جلب مكتبة المستخدم
      const libraryRef = doc(db, 'userLibrary', currentUser.uid);
      const libraryDoc = await getDoc(libraryRef);
      
      if (!libraryDoc.exists()) {
        console.warn('⚠️ User library not found');
        showAccessDenied();
        return;
      }
      
      const userLectures = libraryDoc.data().lectures || [];
      console.log('📚 User lectures:', userLectures);
      
      // ✅ فحص: هل المحاضرة في مكتبة المستخدم؟
      if (!userLectures.includes(lectureId)) {
        console.warn('⛔ Access denied for lecture:', lectureId);
        showAccessDenied();
        return;
      }
      
      // ✅ Access granted!
      console.log('✅ Access granted for lecture:', lectureId);
      hideLoadingScreen();
      
      // تشغيل callback function
      if (typeof onSuccess === 'function') {
        onSuccess(currentUser);
      }
      
    } catch (error) {
      console.error('❌ Error checking access:', error);
      showAccessDenied();
    }
  });
}

/**
 * ✅ Get current user
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * ✅ Calculate lecture folder depth for correct paths
 */
function getLectureDepth() {
  const path = window.location.pathname;
  const depth = (path.match(/\//g) || []).length - 1;
  return depth;
}

/**
 * ✅ Show loading screen
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
  } else {
    // Create loading screen if not exists
    const loading = document.createElement('div');
    loading.id = 'loadingScreen';
    loading.innerHTML = `
      <style>
        #loadingScreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          flex-direction: column;
          gap: 20px;
        }
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loader-spinner {
          width: 80px;
          height: 80px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #16a34a;
          border-radius: 50%;
          animation: spinLoader 1s linear infinite;
        }
      </style>
      <div class="loader-spinner"></div>
      <p style="font-family: 'Cairo', sans-serif; font-size: 1.2rem; color: #64748b; font-weight: 600;">
        جاري التحقق من الصلاحية...
      </p>
    `;
    document.body.insertBefore(loading, document.body.firstChild);
  }
}

/**
 * ✅ Hide loading screen
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
  
  const lectureContent = document.getElementById('lectureContent');
  if (lectureContent) {
    lectureContent.style.display = 'block';
  }
}

/**
 * ✅ Show access denied message
 */
function showAccessDenied() {
  const depth = getLectureDepth();
  const libraryPath = depth > 0 ? '../'.repeat(depth) + 'library.html' : 'library.html';
  
  document.body.innerHTML = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 30px;
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      font-family: 'Cairo', sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <div style="
        background: white;
        padding: 60px 50px;
        border-radius: 30px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        max-width: 500px;
        animation: fadeIn 0.5s ease;
      ">
        <div style="
          width: 120px;
          height: 120px;
          margin: 0 auto 30px;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
        ">
          <i class="fas fa-lock" style="font-size: 3.5rem; color: white;"></i>
        </div>
        
        <h1 style="
          font-size: 2rem;
          font-weight: 800;
          color: #dc2626;
          margin-bottom: 15px;
        ">
          ⛔ غير مسموح بالدخول
        </h1>
        
        <p style="
          font-size: 1.1rem;
          color: #64748b;
          line-height: 1.8;
          margin-bottom: 30px;
        ">
          لا يمكنك الوصول لهذه المحاضرة.<br>
          يجب تفعيلها من المكتبة أولاً.
        </p>
        
        <a href="${libraryPath}" style="
          display: inline-block;
          padding: 18px 45px;
          background: linear-gradient(135deg, #16a34a, #10b981);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
          transition: all 0.3s;
        " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
          <i class="fas fa-arrow-right"></i>
          العودة للمكتبة
        </a>
      </div>
    </div>
    
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    </style>
  `;
}
