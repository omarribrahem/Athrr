// ==========================================
// ✅ LECTURE AUTH - V3.0 SUPABASE
// التحقق من صلاحية وصول المحاضرة
// NO STUDY TIME FEATURE
// ==========================================

import { supabase, onAuthChange } from './app.js';

// ==========================================
// 🔐 تحقق من الصلاحية - SUPABASE VERSION
// ==========================================
export function checkLectureAccess(lectureId, onSuccess, onFailure) {
  return new Promise((resolve, reject) => {
    // التحقق من تسجيل الدخول
    const unsubscribe = onAuthChange(async (user) => {
      // 🔥 إلغاء الاشتراك فوراً لتجنب التكرار
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
      
      if (!user) {
        const error = 'not-logged-in';
        showAccessDenied('يرجى تسجيل الدخول أولاً');
        if (onFailure) onFailure(error);
        reject(error);
        return;
      }

      try {
        // 1️⃣ جلب بيانات المستخدم
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id)
          .single();
        
        if (userError || !userData) {
          const error = 'user-not-found';
          showAccessDenied('بيانات المستخدم غير موجودة');
          if (onFailure) onFailure(error);
          reject(error);
          return;
        }

        // 2️⃣ التحقق من ملكية المحاضرة من user_library
        const { data: libraryItem, error: libraryError } = await supabase
          .from('user_library')
          .select('lecture_id')
          .eq('user_id', user.id)
          .eq('lecture_id', lectureId)
          .maybeSingle();
        
        const isOwned = !!libraryItem;

        // 3️⃣ جلب بيانات المحاضرة
        const { data: lectureData, error: lectureError } = await supabase
          .from('lectures')
          .select('*')
          .eq('id', lectureId)
          .single();
        
        if (lectureError || !lectureData) {
          const error = 'lecture-not-found';
          showAccessDenied('المحاضرة غير موجودة في النظام');
          if (onFailure) onFailure(error);
          reject(error);
          return;
        }

        const isFree = lectureData.is_free || lectureData.price === 0;

        // 4️⃣ التحقق من الصلاحية
        if (isFree || isOwned) {
          // ✅ وصول مسموح
          console.log(`✅ Access granted to lecture: ${lectureId}`);
          
          // إظهار المحتوى
          const body = document.body;
          if (body) {
            body.style.visibility = 'visible';
            body.style.opacity = '1';
          }
          
          if (onSuccess) {
            onSuccess(userData, lectureData);
          }
          resolve({ userData, lectureData });
          return;
        }

        // ❌ محمية وغير مملوكة
        const error = 'lecture-locked';
        showAccessDenied(
          'هذه المحاضرة محمية بكود تفعيل',
          lectureData.title || 'المحاضرة'
        );
        if (onFailure) onFailure(error);
        reject(error);

      } catch (error) {
        console.error('❌ Error in access check:', error);
        const errorType = 'verification-error';
        showAccessDenied('حدث خطأ في التحقق من الصلاحية');
        if (onFailure) onFailure(errorType);
        reject(errorType);
      }
    });
  });
}

// ==========================================
// 🚫 عرض رسالة الحظر - ENHANCED VERSION
// ==========================================
function showAccessDenied(message, lectureTitle = null) {
  // إخفاء المحتوى الأصلي
  document.body.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
      
      .access-denied-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        z-index: 999999;
      }
      
      .access-denied-card {
        background: white;
        border-radius: 20px;
        padding: 50px 40px;
        text-align: center;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
        animation: slideUp 0.5s ease;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .access-denied-icon {
        font-size: 4rem;
        margin-bottom: 25px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .access-denied-title {
        color: #1f2937;
        margin: 0 0 15px 0;
        font-size: 1.8rem;
        font-weight: 800;
      }
      
      .access-denied-message {
        color: #6b7280;
        margin: 0 0 10px 0;
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.7;
      }
      
      .access-denied-lecture {
        color: #3b82f6;
        font-weight: 700;
        margin: 10px 0 30px 0;
        font-size: 1.05rem;
      }
      
      .access-denied-actions {
        display: flex;
        gap: 12px;
        margin-top: 30px;
      }
      
      .access-denied-btn {
        flex: 1;
        padding: 14px 20px;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Cairo', sans-serif;
        font-size: 1rem;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .access-denied-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }
      
      .btn-back {
        background: #64748b;
        color: white;
      }
      
      .btn-back:hover {
        background: #475569;
      }
      
      .btn-library {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }
      
      .btn-library:hover {
        background: linear-gradient(135deg, #059669, #047857);
      }
      
      .access-denied-footer {
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        color: #9ca3af;
        font-size: 0.9rem;
      }
    </style>
    
    <div class="access-denied-overlay">
      <div class="access-denied-card">
        <div class="access-denied-icon">
          <i class="fas fa-lock" style="color: #ef4444;"></i>
        </div>
        
        <h1 class="access-denied-title">
          وصول مرفوض
        </h1>
        
        <p class="access-denied-message">
          ${message}
        </p>
        
        ${lectureTitle ? `
          <p class="access-denied-lecture">
            <i class="fas fa-video"></i> ${lectureTitle}
          </p>
        ` : ''}
        
        <div class="access-denied-actions">
          <button class="access-denied-btn btn-back" onclick="window.history.back()">
            <i class="fas fa-arrow-right"></i>
            <span>رجوع</span>
          </button>
          
          <button class="access-denied-btn btn-library" onclick="window.location.href='library.html'">
            <i class="fas fa-home"></i>
            <span>المكتبة</span>
          </button>
        </div>
        
        <div class="access-denied-footer">
          <p>💡 احصل على صلاحية الوصول من المكتبة</p>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 📊 وظيفة إضافية: تسجيل الوصول (Analytics)
// ==========================================
export async function logLectureAccess(lectureId, userId) {
  try {
    console.log(`📊 User ${userId} accessed lecture ${lectureId}`);
    
    // يمكنك إضافة logging إلى analytics table (اختياري)
    // const { error } = await supabase
    //   .from('analytics')
    //   .insert([{
    //     type: 'lecture_access',
    //     lecture_id: lectureId,
    //     user_id: userId,
    //     timestamp: new Date().toISOString()
    //   }]);
    
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

console.log('✅ Lecture Auth V3.0 Supabase - Ready');
