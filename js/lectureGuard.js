// ==================== LECTURE ACCESS GUARD (COMPLETE & IMPROVED) ====================
import { auth, db } from './app.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ==================== MAIN FUNCTION: CHECK LECTURE ACCESS ====================
export async function checkLectureAccess(lectureId) {
  try {
    // Show loading screen
    showLoadingScreen();
    
    // Wait for auth to be ready
    await waitForAuth();
    
    const user = auth.currentUser;
    
    // Check authentication
    if (!user) {
      showAccessDenied('يجب تسجيل الدخول أولاً', '/login.html');
      return false;
    }
    
    // Check if user exists in database
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      showAccessDenied('المستخدم غير موجود', '/login.html');
      return false;
    }
    
    const userData = userDoc.data();
    
    // Admin has access to everything
    if (userData.role === 'admin') {
      console.log('✅ Admin access granted');
      hideAccessCheck();
      return true;
    }
    
    // Check user library for regular users
    const libraryDoc = await getDoc(doc(db, 'userLibrary', user.uid));
    
    if (!libraryDoc.exists()) {
      console.log('❌ No library found for user');
      showAccessDenied('لم يتم العثور على مكتبتك', '/library.html');
      return false;
    }
    
    const userLectures = libraryDoc.data().lectures || [];
    
    if (userLectures.includes(lectureId)) {
      console.log('✅ User has access to lecture:', lectureId);
      hideAccessCheck();
      return true;
    } else {
      console.log('❌ User does not have access to lecture:', lectureId);
      showAccessDenied('ليس لديك صلاحية لعرض هذه المحاضرة', '/library.html');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Access check error:', error);
    showAccessDenied('خطأ في التحقق من الصلاحية', '/library.html');
    return false;
  }
}

// ==================== WAIT FOR AUTH TO BE READY ====================
function waitForAuth() {
  return new Promise((resolve) => {
    // If already logged in, resolve immediately
    if (auth.currentUser) {
      resolve();
      return;
    }
    
    // Otherwise wait for auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve();
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      unsubscribe();
      resolve();
    }, 5000);
  });
}

// ==================== SHOW LOADING SCREEN ====================
function showLoadingScreen() {
  const screen = document.getElementById('accessCheckScreen');
  if (!screen) {
    createAccessScreen();
  }
  
  const accessScreen = document.getElementById('accessCheckScreen');
  if (accessScreen) {
    accessScreen.style.display = 'flex';
    accessScreen.style.opacity = '1';
    accessScreen.innerHTML = `
      <!-- Animated Background -->
      <div style="
        position: absolute;
        inset: 0;
        overflow: hidden;
        opacity: 0.3;
      ">
        <div style="
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(22, 163, 74, 0.3), transparent);
          border-radius: 50%;
          top: -10%;
          right: -10%;
          animation: float 6s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.25), transparent);
          border-radius: 50%;
          bottom: -15%;
          left: -15%;
          animation: float 8s ease-in-out infinite reverse;
        "></div>
      </div>

      <!-- Content -->
      <div style="
        text-align: center;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        padding: 60px 50px;
        border-radius: 30px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.8);
        position: relative;
        z-index: 1;
        max-width: 450px;
        animation: fadeIn 0.5s;
      ">
        <div style="
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #16a34a, #10b981);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          box-shadow: 0 10px 30px rgba(22, 163, 74, 0.3);
          animation: spin 2s linear infinite;
        ">
          <i class="fas fa-shield-alt" style="font-size: 2.5rem; color: white;"></i>
        </div>
        
        <h2 style="
          color: #14532d;
          font-size: 1.8rem;
          margin: 0 0 15px;
          font-weight: 800;
        ">جاري التحقق من الصلاحيات...</h2>
        
        <p style="
          color: #64748b;
          font-size: 1rem;
          margin: 0;
        ">يرجى الانتظار</p>
      </div>

      <style>
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      </style>
    `;
  }
}

// ==================== HIDE ACCESS CHECK ====================
function hideAccessCheck() {
  const screen = document.getElementById('accessCheckScreen');
  if (screen) {
    screen.style.opacity = '0';
    setTimeout(() => {
      screen.style.display = 'none';
    }, 300);
  }
}

// ==================== SHOW ACCESS DENIED ====================
function showAccessDenied(message, redirectUrl) {
  const screen = document.getElementById('accessCheckScreen');
  if (screen) {
    screen.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)';
    
    screen.innerHTML = `
      <!-- Animated Background -->
      <div style="
        position: absolute;
        inset: 0;
        overflow: hidden;
        opacity: 0.3;
      ">
        <div style="
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(239, 68, 68, 0.3), transparent);
          border-radius: 50%;
          top: -10%;
          right: -10%;
          animation: float 6s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.25), transparent);
          border-radius: 50%;
          bottom: -15%;
          left: -15%;
          animation: float 8s ease-in-out infinite reverse;
        "></div>
      </div>

      <!-- Content -->
      <div style="
        text-align: center;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        padding: 60px 50px;
        border-radius: 30px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.8);
        position: relative;
        z-index: 1;
        max-width: 450px;
        animation: shake 0.5s;
      ">
        <div style="
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        ">
          <i class="fas fa-lock" style="font-size: 2.5rem; color: white;"></i>
        </div>
        
        <h2 style="
          color: #991b1b;
          font-size: 1.8rem;
          margin: 0 0 15px;
          font-weight: 800;
        ">تم رفض الوصول</h2>
        
        <p style="
          color: #dc2626;
          font-size: 1.1rem;
          margin: 0 0 20px;
          line-height: 1.6;
        ">${message}</p>
        
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.95rem;
        ">
          <i class="fas fa-spinner fa-spin"></i>
          <span>جاري إعادة التوجيه...</span>
        </div>
      </div>

      <style>
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      </style>
    `;
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
  }
}

// ==================== CREATE ACCESS SCREEN ====================
function createAccessScreen() {
  // Check if already exists
  if (document.getElementById('accessCheckScreen')) {
    return;
  }
  
  const screen = document.createElement('div');
  screen.id = 'accessCheckScreen';
  screen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    font-family: 'Cairo', sans-serif;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(screen);
}

// ==================== AUTO-CREATE SCREEN ON LOAD ====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createAccessScreen);
} else {
  createAccessScreen();
}
