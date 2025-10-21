// ==================== LECTURE ACCESS GUARD ====================
// Protect lecture pages from unauthorized access
// Author: Athr Platform Team
// Version: 1.0

import { auth, db } from './app.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * تحقق من صلاحية الوصول للمحاضرة
 * @param {string} lectureId - معرّف المحاضرة (مثل: stat_l1, econ_l2)
 * @returns {Promise<boolean>} - true if access granted
 */
export async function checkLectureAccess(lectureId) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      // 1. Check if user is logged in
      if (!user) {
        showAccessDenied('يجب تسجيل الدخول أولاً');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1500);
        reject(new Error('Not authenticated'));
        return;
      }

      try {
        // 2. Check user library
        const libraryDoc = await getDoc(doc(db, 'userLibrary', user.uid));
        
        if (libraryDoc.exists()) {
          const userLectures = libraryDoc.data().lectures || [];
          
          if (userLectures.includes(lectureId)) {
            // ✅ Access granted
            hideAccessCheck();
            resolve(true);
          } else {
            // ❌ No access
            showAccessDenied('ليس لديك صلاحية لعرض هذه المحاضرة');
            setTimeout(() => {
              window.location.href = '/library.html';
            }, 2000);
            reject(new Error('Access denied'));
          }
        } else {
          // No library document
          showAccessDenied('ليس لديك صلاحية لعرض هذه المحاضرة');
          setTimeout(() => {
            window.location.href = '/library.html';
          }, 2000);
          reject(new Error('No library found'));
        }
      } catch (error) {
        console.error('Access check error:', error);
        showAccessDenied('خطأ في التحقق من الصلاحية');
        setTimeout(() => {
          window.location.href = '/library.html';
        }, 2000);
        reject(error);
      }
    });
  });
}

/**
 * إخفاء شاشة التحقق
 */
function hideAccessCheck() {
  const screen = document.getElementById('accessCheckScreen');
  if (screen) {
    screen.style.opacity = '0';
    setTimeout(() => {
      screen.style.display = 'none';
    }, 300);
  }
}

/**
 * عرض رسالة رفض الوصول
 * @param {string} message - الرسالة المراد عرضها
 */
function showAccessDenied(message) {
  const screen = document.getElementById('accessCheckScreen');
  if (screen) {
    screen.innerHTML = `
      <div style="text-align: center; color: white; animation: shake 0.5s;">
        <i class="fas fa-lock" style="font-size: 4rem; margin-bottom: 25px; color: #ef4444;"></i>
        <h2 style="font-size: 2rem; margin-bottom: 15px;">❌ تم رفض الوصول</h2>
        <p style="font-size: 1.2rem; opacity: 0.95; margin-bottom: 10px;">${message}</p>
        <p style="font-size: 1rem; opacity: 0.8;">جاري إعادة التوجيه...</p>
      </div>
      <style>
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      </style>
    `;
  }
}

/**
 * دالة مساعدة لإنشاء HTML للشاشة (للاستخدام في المحاضرات)
 * @returns {string} - HTML string
 */
export function getAccessCheckHTML() {
  return `
    <div id="accessCheckScreen" style="
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: 'Cairo', sans-serif;
      transition: opacity 0.3s ease;
    ">
      <div style="text-align: center; color: white;">
        <i class="fas fa-spinner fa-spin" style="font-size: 3.5rem; margin-bottom: 25px;"></i>
        <h2 style="font-size: 2rem; margin-bottom: 15px;">جاري التحقق من الصلاحية...</h2>
        <p style="font-size: 1.1rem; opacity: 0.9;">يرجى الانتظار</p>
      </div>
    </div>
  `;
}
