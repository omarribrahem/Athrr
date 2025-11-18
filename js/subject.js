// ==================================================
// ATHR SUBJECT PAGE V29.1 - CLEAN HEADER DISPLAY
// يدعم إخفاء الحقول الفارغة بشكل مثالي
// ==================================================

import { supabase } from './app.js';

// استيراد Toast (مطلوب لعرض الرسائل)
let showToast = window.showToast || ((msg, type) => { alert(msg); });

// محاولة استخدام مكتبة التوست (اختياري)
try {
  const lib = await import('./library.js');
  showToast = lib.showToast || showToast;
} catch (e) {}

// =========================
// STATE
// =========================
let currentUser = null;
let currentSubjectId = null;
let currentSubject = null;
let lectures = [];
let userLectures = [];
let isLoading = false;

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    currentUser = user;
    init();
  });
  setupEventListeners();
});

// =========================
// MAIN INIT
// =========================
async function init() {
  if (isLoading) return;
  isLoading = true;

  try {
    const params = new URLSearchParams(location.search);
    currentSubjectId = params.get('s') || params.get('id');
    if (!currentSubjectId) throw new Error('المادة غير محددة');

    showSkeleton();

    await Promise.all([
      loadSubjectData(),
      loadLectures(),
      loadUserLibrary()
    ]);

    updateSubjectHeader();
    renderLectures();
    showToast('تم التحميل', 'success', 1500);

  } catch (err) {
    showToast(err.message || 'حدث خطأ في التحميل', 'error');
    showErrorState(err.message);
  } finally {
    isLoading = false;
  }
}

// =========================
// LOAD DATA
// =========================
async function loadSubjectData() {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', currentSubjectId)
    .eq('is_active', true)
    .single();

  if (error || !data) throw new Error('فشل تحميل بيانات المادة');
  currentSubject = data;
}

async function loadLectures() {
  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('subject', currentSubjectId)
    .eq('is_active', true)
    .order('order', { ascending: true });
  if (error) throw error;
  lectures = data || [];
}

async function loadUserLibrary() {
  const { data, error } = await supabase
    .from('user_library')
    .select('lecture_id')
    .eq('user_id', currentUser.id);
  if (error) return userLectures = [];
  userLectures = data ? data.map(i => i.lecture_id) : [];
}

// =========================
// تحديث رأس المادة (العنوان والوصف)
// =========================
function updateSubjectHeader() {
  const titleEl = document.getElementById('subjectTitle');
  const descEl = document.getElementById('subjectDesc');

  // العنوان: أول اسم معبأ فقط
  let subjectTitle = '';
  if (currentSubject.name_ar && currentSubject.name_ar.trim() !== '') {
    subjectTitle = currentSubject.name_ar;
  } else if (currentSubject.name_en && currentSubject.name_en.trim() !== '') {
    subjectTitle = currentSubject.name_en;
  } else {
    subjectTitle = 'بدون عنوان';
  }
  if (titleEl) titleEl.textContent = subjectTitle;

  // الوصف: يظهر فقط إذا غير فارغ
  if (descEl) {
    if (currentSubject.description && currentSubject.description.trim() !== '') {
      descEl.textContent = currentSubject.description;
      descEl.style.display = '';
    } else {
      descEl.textContent = '';
      descEl.style.display = 'none';
    }
  }
}

// =========================
// رندر المحاضرات
// =========================
function renderLectures(searchQuery = '') {
  const container = document.getElementById('lecturesContainer');
  if (!container) return;

  let filtered = lectures;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = lectures.filter(lec => 
      (lec.title || '').toLowerCase().includes(q) ||
      (lec.description || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-new">
        <i class="fas fa-inbox"></i>
        <h3>${searchQuery ? "لم يتم العثور على محاضرات" : "لا توجد محاضرات"}</h3>
        <p>${searchQuery ? "جرب كلمات أخرى" : "سيتم إضافة المحاضرات قريباً"}</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach(lecture => fragment.appendChild(createLectureCard(lecture)));
  container.innerHTML = '';
  container.appendChild(fragment);
}

// =========================
// رندر كبسولة محاضرة واحدة
// =========================
function createLectureCard(lecture) {
  const isOwned = userLectures.includes(lecture.id);
  const isFree = lecture.is_free || lecture.price === 0 || lecture.protection === 'free';
  const color = lecture.color || currentSubject.color || '#3b82f6';
  const icon = lecture.icon || currentSubject.icon || 'fa-video';

  const card = document.createElement('div');
  card.className = 'lecture-capsule';
  card.setAttribute('data-lecture-id', lecture.id);

  // Status badge
  let statusHtml = '';
  let statusClass = '';
  if (isOwned) {
    statusClass = 'lecture-status-active';
    statusHtml = `<span class="${statusClass}"><i class="fas fa-check-circle"></i> في المكتبة</span>`;
  } else if (isFree) {
    statusClass = 'lecture-status-free';
    statusHtml = `<span class="${statusClass}"><i class="fas fa-gift"></i> مجانية</span>`;
  } else {
    statusClass = 'lecture-status-paid';
    statusHtml = `<span class="${statusClass}"><i class="fas fa-lock"></i> مدفوعة</span>`;
  }

  // Action button
  let actionHtml = '';
  if (isOwned) {
    actionHtml = `<button class="capsule-btn" data-action="watch"><i class="fas fa-play"></i> شاهد</button>`;
  } else if (isFree) {
    actionHtml = `<button class="get-lecture-btn" data-action="get"><i class="fas fa-download"></i> احصل عليها</button>`;
  } else {
    actionHtml = `<button class="activate-lecture-btn" data-action="activate"><i class="fas fa-key"></i> فعّل</button>`;
  }

  card.innerHTML = `
    <div class="lecture-icon-box" style="background: linear-gradient(135deg, ${color}, ${lightenColor(color)});">
      <i class="fas ${icon}"></i>
    </div>
    <div class="lecture-info">
      <h3>${escapeHtml(lecture.title || 'محاضرة')}</h3>
      <p>${escapeHtml(lecture.description || 'وصف المحاضرة')}</p>
    </div>
    ${statusHtml}
    ${actionHtml}
  `;

  // Event
  const btn = card.querySelector('button[data-action]');
  if (btn) {
    const action = btn.getAttribute('data-action');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleLectureAction(lecture, action);
    });
  }

  return card;
}

// =========================
// EVENTS
// =========================
function handleLectureAction(lecture, action) {
  switch (action) {
    case 'watch':
      openLecture(lecture.url);
      break;
    case 'get':
      addToLibrary(lecture.id);
      break;
    case 'activate':
      showActivationDialog(lecture.id);
      break;
  }
}

function openLecture(url) {
  if (!url || url === '#') return showToast('المحاضرة قيد التطوير', 'info');
  if (url.startsWith('http')) window.open(url, '_blank', 'noopener,noreferrer');
  else window.location.href = url;
}

async function addToLibrary(lectureId) {
  if (userLectures.includes(lectureId)) return showToast('المحاضرة موجودة بالفعل', 'info');
  const { error } = await supabase
    .from('user_library')
    .insert({
      user_id: currentUser.id,
      lecture_id: lectureId,
      added_at: new Date().toISOString()
    });
  if (error) return showToast('خطأ في الإضافة', 'error');
  userLectures.push(lectureId);
  renderLectures();
  showToast('تمت الإضافة بنجاح ✓', 'success');
}

function showActivationDialog(lectureId) {
  document.querySelector('.custom-dialog-overlay')?.remove();
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog-overlay';
  dialog.innerHTML = `
    <div class="capsule-dialog">
      <div class="dialog-header">
        <div class="dialog-icon-mini"><i class="fas fa-key"></i></div>
        <div>
          <h3 class="dialog-title">تفعيل المحاضرة</h3>
          <p class="dialog-message">أدخل كود التفعيل (ATHR-XXXXXXXX)</p>
        </div>
      </div>
      <input type="text" id="activationCodeInput" class="dialog-input" placeholder="ATHR-XXXXXXXX" maxlength="13" autocomplete="off" spellcheck="false" />
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-primary" id="confirmActivationBtn"><i class="fas fa-check"></i> تفعيل</button>
        <button class="dialog-btn dialog-btn-secondary" id="cancelActivationBtn"><i class="fas fa-times"></i> إلغاء</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  const input = dialog.querySelector('#activationCodeInput');
  const confirmBtn = dialog.querySelector('#confirmActivationBtn');
  const cancelBtn = dialog.querySelector('#cancelActivationBtn');
  requestAnimationFrame(() => input.focus());
  confirmBtn.onclick = () => activateCode(confirmBtn);
  cancelBtn.onclick = () => dialog.remove();
  input.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); activateCode(confirmBtn); }
    if (e.key === 'Escape') { dialog.remove(); }
  };
  input.oninput = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!value.startsWith('ATHR-') && value.length > 0) value = 'ATHR-' + value.replace('ATHR-', '');
    e.target.value = value.substring(0, 13);
  };
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
}

async function activateCode(btn) {
  const input = document.getElementById('activationCodeInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (!code) { showToast('أدخل الكود', 'warning'); input.focus(); return; }
  if (!/^ATHR-[A-Z0-9]{8}$/.test(code)) { showToast('صيغة الكود خاطئة (ATHR-ABC12345)', 'error'); input.focus(); return; }
  try {
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    const { data: result, error } = await supabase.rpc('redeem_activation_code', {
      code_text: code, user_uuid: currentUser.id
    });
    if (error) throw new Error(error.message);
    if (!result.success) {
      showToast(result.message || 'كود خاطئ', 'error');
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      return;
    }
    await loadUserLibrary();
    document.querySelector('.custom-dialog-overlay')?.remove();
    renderLectures();
    showToast(`تم التفعيل! ${result.lectures_added} محاضرة`, 'success');
  } catch (err) {
    showToast('خطأ: ' + (err.message || 'حدث خطأ غير متوقع'), 'error');
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> تفعيل';
  }
}

// =========================
// EVENTS / SEARCH
// =========================
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => renderLectures(e.target.value), 300);
    });
  }
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchInput?.focus(); }
    if (e.key === 'Escape') { document.querySelector('.custom-dialog-overlay')?.remove(); }
  });
}

// =========================
// HELPER FUNCTIONS
// =========================
function lightenColor(hex) {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = 30;
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0xff) + amt);
    const B = Math.min(255, (num & 0xff) + amt);
    return '#' + ((R << 16) + (G << 8) + B).toString(16).padStart(6, '0');
  } catch (err) { return hex; }
}
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function showSkeleton() {
  const container = document.getElementById('lecturesContainer');
  if (!container) return;
  container.innerHTML = Array(5).fill(0).map(() => `
    <div class="lecture-capsule skeleton">
      <div class="lecture-icon-box"></div>
      <div class="lecture-info">
        <h3>━━━━━━━━━━━</h3>
        <p>━━━━━━━━━━━━━━━</p>
      </div>
    </div>
  `).join('');
}
function showErrorState(msg) {
  const container = document.getElementById('lecturesContainer');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state-new">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>حدث خطأ</h3>
      <p>${escapeHtml(msg || 'حدث خطأ غير متوقع')}</p>
      <button class="capsule-btn" onclick="location.reload()" style="margin-top: 1.5rem;">
        <i class="fas fa-redo"></i> إعادة المحاولة
      </button>
    </div>
  `;
}
// ================ END FILE ================

// إصدار: ATHR SUBJECT PAGE V29.1 - CLEAN HEADER DISPLAY
