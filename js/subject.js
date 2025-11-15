// ==========================================
// ✅ SUBJECT PAGE - V19.0 SUPABASE
// Round Glass Capsules + Get Instead of Watch
// NO STUDY TIME FEATURE
// ==========================================

import { supabase, generateAvatarUrl, onAuthChange } from './app.js';

// ==========================================
// 📌 STATE VARIABLES
// ==========================================
let currentUser = null;
let userData = null;
let currentSubjectId = null;
let currentSubject = null;
let lectures = [];
let userLectures = [];
let currentSearch = '';

// ==========================================
// 🚀 INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  onAuthChange(async (user) => {
    if (!user) { 
      window.location.href = 'login.html'; 
      return; 
    }
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
    const { data: userDataFromDB, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', currentUser.id)
      .single();
    
    if (userError) throw userError;
    
    userData = userDataFromDB || {};
    
    // جلب محاضرات المستخدم من user_library
    const { data: userLibraryData, error: libraryError } = await supabase
      .from('user_library')
      .select('lecture_id')
      .eq('user_id', currentUser.id);
    
    if (libraryError) throw libraryError;
    
    userLectures = userLibraryData ? userLibraryData.map(item => item.lecture_id) : [];
    
    updateHeaderUI();

    // جلب بيانات المادة
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', currentSubjectId)
      .single();
    
    if (subjectError || !subjectData) throw new Error('المادة غير موجودة');
    
    currentSubject = subjectData;

    // جلب المحاضرات الخاصة بهذه المادة
    const { data: lecturesData, error: lecturesError } = await supabase
      .from('lectures')
      .select('*')
      .eq('subject', currentSubjectId)
      .eq('is_active', true)
      .order('order', { ascending: true });
    
    if (lecturesError) throw lecturesError;
    
    lectures = lecturesData || [];

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

  if (nameEl) nameEl.textContent = userData.name || userData.username || 'المستخدم';
  if (univEl) univEl.textContent = userData.email || 'طالب';
  if (avatarEl) {
    avatarEl.src = userData.avatar || generateAvatarUrl(currentUser.id);
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

  if (nameEl) nameEl.textContent = currentSubject.name_ar || currentSubject.name || 'المادة';
  if (descEl) descEl.textContent = currentSubject.description || 'مادة تعليمية متميزة';
}

// ==========================================
// 🎨 RENDERING & UI - V19.0 GET BUTTON
// ==========================================

/**
 * رسم قائمة المحاضرات - V19.0 GET BUTTON
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
    const isFree = lec.is_free || lec.price === 0;
    const col = lec.color || currentSubject.color || '#16a34a';
    const icon = lec.icon || currentSubject.icon || 'fa-book';
    
    // ✅ استخدم lec.url من database مباشرة
    const lectureUrl = lec.url || `lectures/${lec.id}.html`;

    // ✅ حالة شارة الحالة
    let statusHtml = '';
    if (isOwned) {
      statusHtml = `<span class="badge-ok"><i class="fas fa-check-circle"></i> في المكتبة</span>`;
    } else if (isFree) {
      statusHtml = `<span class="badge-free"><i class="fas fa-gift"></i> مجانية</span>`;
    } else {
      statusHtml = `<span class="badge-locked"><i class="fas fa-lock"></i> مدفوعة</span>`;
    }

    // ✅ زر الإجراء - GET or WATCH
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
// 🔐 LECTURE ACCESS & PROTECTION - V19.0
// ==========================================

/**
 * معالجة زر "احصل" - V19.0
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
 * فتح محاضرة - V19.0
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
 * إضافة محاضرة للمكتبة - V19.0 SUPABASE
 */
window.addToLibrary = async function(lectureId) {
  try {
    // التحقق من عدم تكرار الإضافة
    if (userLectures.includes(lectureId)) {
      showToast('⚠️ المحاضرة موجودة بالفعل في مكتبتك', 'info');
      return;
    }

    const { error } = await supabase
      .from('user_library')
      .insert({
        user_id: currentUser.id,
        lecture_id: lectureId,
        added_at: new Date().toISOString()
      });

    if (error) throw error;

    userLectures.push(lectureId);
    renderLectures(currentSearch);
    showToast('✅ تمت الإضافة بنجاح! اذهب للمكتبة لمشاهدتها', 'success');

  } catch (e) {
    console.error('❌ خطأ:', e);
    showToast('خطأ في الإضافة', 'error');
  }
};

// ==========================================
// 🎁 ACTIVATION SYSTEM - V19.0 SUPABASE
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
          <p class="dialog-message">أدخل كود التفعيل (مثال: ATHR-ABC12345)</p>
        </div>
      </div>
      <input 
        type="text" 
        id="activationCodeInput" 
        class="dialog-input" 
        placeholder="الكود" 
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
 * التحقق من صحة كود التفعيل - V19.0 SUPABASE
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

    if (!/^ATHR-[A-Z0-9]{8}$/.test(code)) {
      showToast('❌ صيغة الكود خاطئة (مثال: ATHR-ABC12345)', 'error');
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      return;
    }

    // البحث عن الكود في Supabase
    const { data: codeData, error: codeError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (codeError || !codeData) {
      showToast('❌ كود غير صالح', 'error');
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      return;
    }

    // ========== التحقق من شروط الكود ==========

    // 1️⃣ التحقق من تاريخ انتهاء الصلاحية
    if (codeData.expires_at) {
      const now = new Date();
      const expiryDate = new Date(codeData.expires_at);

      if (expiryDate < now) {
        showToast('❌ الكود منتهي الصلاحية', 'error');
        btnEl.disabled = false;
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
        return;
      }
    }

    // 2️⃣ التحقق من الحد الأقصى للاستخدام
    if (codeData.max_uses > 0) {
      const usesCount = codeData.uses_count || 0;
      if (usesCount >= codeData.max_uses) {
        showToast('❌ الكود مستنفد (تم استخدام جميع النسخ)', 'error');
        btnEl.disabled = false;
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
        return;
      }
    }

    // ========== التفعيل صحيح - إضافة للمكتبة ==========
    
    // تحديد المحاضرات المراد إضافتها حسب نوع الكود
    let lecturesToAdd = [];
    if (codeData.target_type === 'lecture') {
      lecturesToAdd = codeData.target_ids || [];
    } else if (codeData.target_type === 'subject') {
      const subjectId = codeData.target_ids?.[0];
      if (subjectId) {
        const { data: subjectLectures } = await supabase
          .from('lectures')
          .select('id')
          .eq('subject', subjectId)
          .eq('is_active', true);
        
        lecturesToAdd = subjectLectures ? subjectLectures.map(l => l.id) : [];
      }
    } else if (codeData.target_type === 'bundle') {
      const subjectIds = codeData.target_ids || [];
      const { data: bundleLectures } = await supabase
        .from('lectures')
        .select('id')
        .in('subject', subjectIds)
        .eq('is_active', true);
      
      lecturesToAdd = bundleLectures ? bundleLectures.map(l => l.id) : [];
    }

    // إضافة المحاضرات للمكتبة
    const uniqueLectures = lecturesToAdd.filter(id => !userLectures.includes(id));
    
    if (uniqueLectures.length > 0) {
      const records = uniqueLectures.map(lid => ({
        user_id: currentUser.id,
        lecture_id: lid,
        added_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('user_library')
        .insert(records);

      if (insertError) throw insertError;

      userLectures = [...userLectures, ...uniqueLectures];
    }

    // تحديث عدد استخدامات الكود
    await supabase
      .from('activation_codes')
      .update({
        uses_count: (codeData.uses_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', codeData.id);

    // إغلاق النافذة
    document.querySelector('.custom-dialog-overlay')?.remove();

    // إظهار رسالة النجاح
    showToast(`✅ تم التفعيل بنجاح! تمت إضافة ${uniqueLectures.length} محاضرة لمكتبتك`, 'success');

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
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  } catch (e) {
    console.error('خطأ في تسجيل الخروج:', e);
    showToast('خطأ في تسجيل الخروج', 'error');
  }
};

/**
 * فتح الملف الشخصي
 */
window.openProfile = function() {
  window.location.href = 'library.html';
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
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(20px); }
  }
`;
document.head.appendChild(style);

// ==========================================
// ✅ CONSOLE OUTPUT
// ==========================================
console.log('🎓 ATHR PLATFORM - Subject Page V19.0 SUPABASE Ready');
console.log('✅ NEW: Supabase integration complete');
console.log('✅ GET button instead of WATCH');
console.log('📌 Free lectures → GET → Direct to library');
console.log('🔐 Paid lectures → GET → Code dialog → Library');
console.log('📺 Owned lectures → WATCH button');
console.log('🎨 Enhanced Glass Morphism Buttons');
console.log('📱 Status: Responsive + RTL + Supabase + NO STUDY TIME');
