// ==========================================
// ✅ SUBJECT PAGE - V18.2 FINAL (GET BUTTON)
// Round Glass Capsules + Get Instead of Watch
// ==========================================


import { auth, db, generateAvatarUrl } from './app.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  doc, getDoc, collection, getDocs, updateDoc, serverTimestamp,
  query, where, orderBy, limit, arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';


// ==========================================
// 📌 STATE VARIABLES
// ==========================================
let currentUser = null, userData = null;
let currentSubjectId = null, currentSubject = null;
let lectures = [], userLectures = [];
let currentSearch = '';


// ==========================================
// 🚀 INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'login.html'; return; }
    currentUser = user;
    await init();
  });
});


async function init() {
  try {
    // قراءة معرف المادة من الرابط
    const params = new URLSearchParams(location.search);
    currentSubjectId = params.get('s');
    if (!currentSubjectId) throw new Error('مادة غير محددة');


    // جلب بيانات المستخدم
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    userData = userDoc.data() || {};
    userLectures = userData.lectures || [];
    updateHeaderUI();


    // جلب بيانات المادة
    const subjectDoc = await getDoc(doc(db, 'subjects', currentSubjectId));
    if (!subjectDoc.exists()) throw new Error('المادة غير موجودة');
    currentSubject = subjectDoc.data();


    // جلب المحاضرات (بدون Index - بدون where + orderBy معاً)
    const lecturesSnap = await getDocs(collection(db, 'lectures'));
    lectures = [];
    
    lecturesSnap.forEach(d => {
      const lecture = { id: d.id, ...d.data() };
      if (lecture.subject === currentSubjectId) {
        lectures.push(lecture);
      }
    });
    
    // ترتيب محلياً حسب order
    lectures.sort((a, b) => (a.order || 0) - (b.order || 0));


    // تحديث الواجهة
    updateSubjectHeader();
    renderLectures();
    bindSearch();


  } catch (e) {
    console.error('❌ خطأ في التهيئة:', e);
    showToast(e.message || 'خطأ غير متوقع', 'error');
  }
}


// ==========================================
// 📡 DATA FETCHING & UPDATES
// ==========================================


/**
 * تحديث معلومات المستخدم في رأس الصفحة
 */
function updateHeaderUI() {
  const nameEl = document.getElementById('headerUserName');
  const univEl = document.getElementById('headerUserUniversity');
  const avatarEl = document.getElementById('headerUserAvatar');


  if (nameEl) nameEl.textContent = userData.name || 'المستخدم';
  if (univEl) univEl.textContent = userData.university || 'غير محدد';
  if (avatarEl) {
    avatarEl.src = userData.avatar || generateAvatarUrl(currentUser.uid);
  }


  // إزالة حالة التحميل
  const userSection = document.querySelector('.user-section');
  if (userSection) userSection.classList.remove('loading');
}


/**
 * تحديث معلومات المادة في الرأس
 */
function updateSubjectHeader() {
  const nameEl = document.getElementById('subjectName');
  const descEl = document.getElementById('subjectHeaderDesc');


  if (nameEl) nameEl.textContent = currentSubject.nameAr || currentSubject.name || 'المادة';
  if (descEl) descEl.textContent = currentSubject.description || 'مادة تعليمية متميزة';
}


// ==========================================
// 🎨 RENDERING & UI - V18.2 GET BUTTON
// ==========================================


/**
 * رسم قائمة المحاضرات - V18.2 GET BUTTON
 */
function renderLectures(search = '') {
  let list = [...lectures];

  // تصفية البحث
  if (search) {
    const s = search.trim().toLowerCase();
    list = list.filter(l => (l.title || '').toLowerCase().includes(s));
  }

  const container = document.getElementById('lecturesListContainer');
  if (!container) return;

  // حالة عدم وجود نتائج
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state-new">
        <i class="fas fa-video-slash"></i>
        <h3>${search ? 'لم يتم العثور على محاضرات' : 'لا توجد محاضرات'}</h3>
      </div>
    `;
    return;
  }

  // رسم المحاضرات
  container.innerHTML = list.map(lec => {
    const isOwned = userLectures.includes(lec.id);
    const isFree = lec.protection === 'free' || !lec.protection;
    const col = lec.color || currentSubject.color || '#16a34a';
    const icon = lec.icon || currentSubject.icon || 'fa-book';
    
    // ✅ استخدم lec.url من database مباشرة
    const lectureUrl = lec.url || `lectures/${lec.id}.html`;

    // ✅ NEW V18.2: حالة شارة الحالة
    let statusHtml = '';
    if (isOwned) {
      statusHtml = `<span class="badge-ok"><i class="fas fa-check-circle"></i> في المكتبة</span>`;
    } else if (isFree) {
      statusHtml = `<span class="badge-free"><i class="fas fa-gift"></i> مجانية</span>`;
    } else {
      statusHtml = `<span class="badge-locked"><i class="fas fa-lock"></i> مدفوعة</span>`;
    }

    // ✅ NEW V18.2: زر الإجراء - GET or WATCH
    let actionHtml = '';
    
    if (isOwned) {
      // لو موجودة بالفعل → شاهد (أزرق)
      actionHtml = `
        <button class="pill-btn" onclick="openLecture('${lectureUrl}')" title="اضغط لمشاهدة المحاضرة">
          <i class="fas fa-play"></i> شاهد
        </button>
      `;
    } else if (isFree) {
      // لو مجانية → احصل (أخضر)
      actionHtml = `
        <button 
          class="pill-btn-get-free" 
          onclick="handleGetLecture('${lec.id}', true)"
          title="اضغط للحصول على المحاضرة مجاناً"
        >
          <i class="fas fa-download"></i> احصل
        </button>
      `;
    } else {
      // لو مدفوعة → احصل (برتقالي)
      actionHtml = `
        <button 
          class="pill-btn-get-paid" 
          onclick="handleGetLecture('${lec.id}', false)"
          title="اضغط لإدخال كود التفعيل"
        >
          <i class="fas fa-key"></i> احصل
        </button>
      `;
    }

    return `
      <div class="round-glass-capsule">
        <div class="round-icon" style="background: linear-gradient(135deg, ${col}, ${adjustColor(col, 20)});">
          <i class="fas ${icon}"></i>
        </div>
        <div class="round-info">
          <h3>${lec.title || 'محاضرة بدون عنوان'}</h3>
          <p>${lec.description || 'محاضرة متميزة'}</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end;">
          ${statusHtml}
          ${actionHtml}
        </div>
      </div>
    `;
  }).join('');
}


/**
 * ربط حقل البحث
 */
function bindSearch() {
  const searchEl = document.getElementById('lecturesSearch');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderLectures(currentSearch);
    });


    // البحث عند الضغط على Enter
    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }
}


// ==========================================
// 🔐 LECTURE ACCESS & PROTECTION - V18.2
// ==========================================


/**
 * معالجة زر "احصل" - V18.2 NEW
 * @param {string} lectureId - معرف المحاضرة
 * @param {boolean} isFree - هل المحاضرة مجانية؟
 */
window.handleGetLecture = async function(lectureId, isFree) {
  if (isFree) {
    // محاضرة مجانية → إضافة مباشرة للمكتبة
    await addToLibrary(lectureId);
  } else {
    // محاضرة مدفوعة → إظهار نافذة الكود
    showActivationDialog(lectureId);
  }
};


/**
 * فتح محاضرة - V18.1
 * يدعم GitHub Paths و Cloudflare URLs
 */
window.openLecture = function(url) {
  if (!url || url === '#') {
    showToast('المحاضرة قيد التطوير', 'info');
    return;
  }
  
  // ✅ Handle different URL types
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Full URL (Cloudflare or external)
    window.open(url, '_blank');
  } else {
    // Relative path (GitHub)
    window.location.href = url;
  }
};


/**
 * إضافة محاضرة للمكتبة - V18.2 ENHANCED
 */
window.addToLibrary = async function(lectureId) {
  try {
    // التحقق من عدم تكرار الإضافة
    if (userLectures.includes(lectureId)) {
      showToast('⚠️ المحاضرة موجودة بالفعل في مكتبتك', 'info');
      return;
    }

    await updateDoc(doc(db, 'users', currentUser.uid), {
      lectures: arrayUnion(lectureId),
      updatedAt: serverTimestamp()
    });


    userLectures.push(lectureId);
    renderLectures(currentSearch);
    showToast('✅ تمت الإضافة بنجاح! اذهب للمكتبة لمشاهدتها', 'success');


  } catch (e) {
    console.error('❌ خطأ:', e);
    showToast('خطأ في الإضافة', 'error');
  }
};


// ==========================================
// 🎁 ACTIVATION SYSTEM
// ==========================================


/**
 * عرض نافذة إدخال كود التفعيل
 */
window.showActivationDialog = function(lectureId) {
  const wrap = document.createElement('div');
  wrap.className = 'custom-dialog-overlay';
  wrap.innerHTML = `
    <div class="capsule-dialog">
      <div class="dialog-header">
        <div class="dialog-icon-mini"><i class="fas fa-key"></i></div>
        <div>
          <h3 class="dialog-title">تفعيل المحاضرة</h3>
          <p class="dialog-message">أدخل كود التفعيل الخاص بك</p>
        </div>
      </div>
      <input 
        type="text" 
        id="activationCodeInput" 
        class="dialog-input" 
        placeholder="XXXXXX" 
        style="direction: ltr; text-transform: uppercase;"
        autocomplete="off"
        spellcheck="false"
      >
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-primary" id="activateBtn">
          <i class="fas fa-check"></i> تفعيل
        </button>
        <button class="dialog-btn dialog-btn-secondary" onclick="this.closest('.custom-dialog-overlay').remove()">
          <i class="fas fa-times"></i> إلغاء
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);


  const btn = wrap.querySelector('#activateBtn');
  const input = wrap.querySelector('#activationCodeInput');


  // تركيز الإدخال
  input?.focus();


  // عند الضغط على زر التفعيل
  btn.onclick = () => confirmActivation(lectureId, btn);


  // عند الضغط على Enter
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmActivation(lectureId, btn);
    }
  });


  // إغلاق النافذة عند الضغط على Escape
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      wrap.remove();
    }
  });
};


/**
 * التحقق من صحة كود التفعيل
 */
async function confirmActivation(lectureId, btnEl) {
  try {
    // تعطيل الزر أثناء المعالجة
    btnEl.disabled = true;
    btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';


    const code = (document.getElementById('activationCodeInput')?.value || '').trim().toUpperCase();


    // التحقق من عدم ترك حقل الكود فارغاً
    if (!code) {
      showToast('⚠️ أدخل الكود من فضلك', 'error');
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      return;
    }


    // البحث عن الكود في Firestore
    const snap = await getDocs(query(
      collection(db, 'activationCodes'),
      where('code', '==', code),
      limit(1)
    ));


    if (snap.empty) {
      showToast('❌ كود غير صالح', 'error');
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      return;
    }


    const codeData = snap.docs[0].data();
    const codeId = snap.docs[0].id;


    // ========== التحقق من شروط الكود ==========


    // 1️⃣ التحقق من أن الكود مفعّل
    if (!codeData.isActive) {
      showToast('❌ الكود معطل أو غير متاح', 'error');
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      return;
    }


    // 2️⃣ التحقق من تاريخ انتهاء الصلاحية
    if (codeData.expiresAt) {
      const now = new Date();
      const expiryDate = codeData.expiresAt.toDate();


      if (expiryDate < now) {
        showToast('❌ الكود منتهي الصلاحية', 'error');
        btnEl.disabled = false;
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
        return;
      }
    }


    // 3️⃣ التحقق من الحد الأقصى للاستخدام
    if (codeData.maxUses > 0) {
      const usesCount = codeData.usesCount || 0;
      if (usesCount >= codeData.maxUses) {
        showToast('❌ الكود مستنفد (تم استخدام جميع النسخ)', 'error');
        btnEl.disabled = false;
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
        return;
      }
    }


    // ========== التفعيل صحيح - إضافة للمكتبة ==========
    await addToLibrary(lectureId);


    // تحديث عدد استخدامات الكود
    await updateDoc(doc(db, 'activationCodes', codeId), {
      usesCount: (codeData.usesCount || 0) + 1,
      lastUsedAt: serverTimestamp()
    });


    // إغلاق النافذة
    document.querySelector('.custom-dialog-overlay')?.remove();


    // إظهار رسالة النجاح
    showToast('✅ تم التفعيل بنجاح! المحاضرة أضيفت لمكتبتك', 'success');


    // تحديث قائمة المحاضرات
    renderLectures(currentSearch);


  } catch (e) {
    console.error('❌ خطأ في التفعيل:', e);
    showToast('خطأ: ' + e.message, 'error');
  } finally {
    // إعادة تفعيل الزر
    btnEl.disabled = false;
    btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
  }
}


// ==========================================
// 🛠️ UTILITY FUNCTIONS
// ==========================================


/**
 * تبديل قائمة المستخدم
 */
window.toggleUserMenu = function() {
  const menu = document.getElementById('userDropdownMenu');
  if (menu) menu.classList.toggle('active');
};


/**
 * تسجيل خروج المستخدم
 */
window.logout = async function() {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (e) {
    console.error('خطأ في تسجيل الخروج:', e);
    showToast('خطأ في تسجيل الخروج', 'error');
  }
};


/**
 * فتح الملف الشخصي (قيد التطوير)
 */
window.openProfile = function() {
  showToast('الملف الشخصي - قريباً 👀', 'info');
};


/**
 * تبديل لوحة الإشعارات
 */
window.toggleNotifications = function() {
  const panel = document.getElementById('notificationsPanel');
  if (panel) panel.classList.toggle('active');
};


/**
 * تعديل اللون (مع تدرج)
 */
function adjustColor(hex, percent) {
  const num = parseInt(String(hex).replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0xFF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}


/**
 * عرض إشعار Toast
 */
window.showToast = function(msg, type = 'info') {
  const t = document.createElement('div');
  t.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 14px 18px;
    border-radius: 12px;
    color: #fff;
    font-weight: 800;
    font-size: 0.95rem;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    z-index: 10001;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease;
    border-radius: 8px;
  `;
  t.textContent = msg;
  document.body.appendChild(t);


  // إزالة الإشعار بعد مدة
  setTimeout(() => {
    t.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3500);
};


// إضافة الحركات للـ Toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }


  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(20px);
    }
  }
`;
document.head.appendChild(style);


// ==========================================
// ✅ CONSOLE OUTPUT
// ==========================================
console.log('🎓 ATHR PLATFORM - Subject Page V18.2 FINAL Ready');
console.log('✅ NEW: GET button instead of WATCH');
console.log('📌 Free lectures → GET → Direct to library');
console.log('🔐 Paid lectures → GET → Code dialog → Library');
console.log('📺 Owned lectures → WATCH button');
console.log('🎨 Enhanced Glass Morphism Buttons');
console.log('📱 Status: Responsive + RTL + Glass Morphism');
