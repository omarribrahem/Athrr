// ==========================================
// ✅ ATHR ADMIN V17.0 - SUPABASE EDITION
// 90+ Icons + 50+ Colors + NO STUDY TIME
// ==========================================

import { supabase, onAuthChange } from './app.js';

let subjectsCache = [];
let currentEditingSubjectId = null;
let currentEditingLectureId = null;

// ==========================================
// 🚀 INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  onAuthChange(async (user) => {
    if (!user) { 
      window.location.href = 'login.html'; 
      return; 
    }
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('uid', user.id)
        .single();
      
      if (error || !userData || userData.role !== 'admin') {
        showToast('ليس لديك صلاحية الوصول', 'error');
        setTimeout(() => window.location.href = 'library.html', 2000);
        return;
      }
      
      await initializeApp();
    } catch (e) {
      console.error('خطأ:', e);
      window.location.href = 'login.html';
    }
  });
});

async function initializeApp() {
  setupTabsNavigation();
  SubjectManager.init();
  LectureManager.init();
  CodesManager.init();
  UsersManager.init();
  await SubjectManager.loadSubjects();
  console.log('✅ Admin V17.0 Supabase Ready');
}

// ==========================================
// 🛠️ UTILS
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle' };
  const titles = { success: 'نجح!', error: 'خطأ!' };
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 4000);
}

function setupTabsNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.admin-panel').forEach(p => {
        p.classList.remove('active');
      });
      
      const panel = document.getElementById(tabName);
      if (panel) {
        panel.classList.add('active');
        
        if (tabName === 'lectures') LectureManager.loadLectures();
        if (tabName === 'codes') CodesManager.loadCodes();
        if (tabName === 'users') UsersManager.loadUsers();
      }
    });
  });
}

function adjustColor(color, percent) {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ==========================================
// 📚 90+ EDUCATION ICONS
// ==========================================
const EDUCATION_ICONS = [
  // Core Education
  'fa-book', 'fa-book-open', 'fa-graduation-cap', 'fa-user-graduate', 'fa-chalkboard', 
  'fa-chalkboard-user', 'fa-school', 'fa-university', 'fa-bookmark', 'fa-pen',
  
  // Science & Math
  'fa-flask', 'fa-atom', 'fa-microscope', 'fa-dna', 'fa-vial', 'fa-vials',
  'fa-calculator', 'fa-square-root-alt', 'fa-infinity', 'fa-percentage',
  'fa-equals', 'fa-divide', 'fa-plus', 'fa-minus',
  
  // Technology & Computer
  'fa-laptop', 'fa-desktop', 'fa-code', 'fa-laptop-code', 'fa-terminal',
  'fa-microchip', 'fa-memory', 'fa-server', 'fa-database', 'fa-network-wired',
  'fa-wifi', 'fa-robot', 'fa-brain', 'fa-sitemap',
  
  // Charts & Data
  'fa-chart-line', 'fa-chart-bar', 'fa-chart-pie', 'fa-chart-area',
  'fa-analytics', 'fa-chart-simple', 'fa-signal',
  
  // Business & Economics
  'fa-briefcase', 'fa-suitcase', 'fa-balance-scale', 'fa-scale-balanced',
  'fa-coins', 'fa-money-bill', 'fa-hand-holding-dollar', 'fa-piggy-bank',
  'fa-chart-line-up', 'fa-building-columns', 'fa-landmark',
  
  // Arts & Media
  'fa-palette', 'fa-paint-brush', 'fa-paintbrush', 'fa-image', 'fa-camera',
  'fa-music', 'fa-guitar', 'fa-film', 'fa-video', 'fa-microphone',
  
  // Language & Literature
  'fa-language', 'fa-spell-check', 'fa-font', 'fa-paragraph',
  'fa-quote-left', 'fa-book-journal-whills', 'fa-book-quran',
  
  // Medical & Health
  'fa-heart', 'fa-heartbeat', 'fa-stethoscope', 'fa-syringe',
  'fa-pills', 'fa-prescription-bottle', 'fa-lungs', 'fa-tooth',
  
  // Engineering
  'fa-cog', 'fa-cogs', 'fa-wrench', 'fa-screwdriver', 'fa-hammer',
  'fa-industry', 'fa-oil-can', 'fa-gears',
  
  // Geography & History
  'fa-globe', 'fa-earth-americas', 'fa-earth-europe', 'fa-map',
  'fa-map-location', 'fa-compass', 'fa-route', 'fa-clock-rotate-left',
  
  // Communication
  'fa-comments', 'fa-comment-dots', 'fa-envelope', 'fa-bell',
  'fa-bullhorn', 'fa-tower-broadcast',
  
  // Tools & Lab
  'fa-flask-vial', 'fa-microscope', 'fa-magnet', 'fa-fire', 'fa-lightbulb',
  'fa-bolt', 'fa-sun', 'fa-moon', 'fa-star'
];

// ==========================================
// 🎨 50+ COLOR PALETTE
// ==========================================
const COLOR_PALETTE = [
  // Greens
  '16a34a', '10b981', '22c55e', '15803d', '14532d', '84cc16', '65a30d',
  // Blues
  '3b82f6', '2563eb', '1d4ed8', '1e40af', '06b6d4', '0891b2', '0e7490',
  // Purples
  '8b5cf6', '7c3aed', '6d28d9', '5b21b6', 'a855f7', '9333ea',
  // Pinks
  'ec4899', 'd946ef', 'c026d3', 'a21caf', 'f472b6', 'db2777',
  // Reds
  'ef4444', 'dc2626', 'b91c1c', '991b1b', 'f87171', 'e11d48',
  // Oranges
  'f59e0b', 'd97706', 'b45309', '92400e', 'fb923c', 'ea580c',
  // Yellows
  'eab308', 'ca8a04', 'a16207', '854d0e', 'fbbf24', 'f59e0b',
  // Grays
  '6b7280', '4b5563', '374151', '1f2937', '64748b', '475569',
  // Teals
  '14b8a6', '0d9488', '0f766e', '115e59', '2dd4bf', '5eead4'
];

const ICON_COLORS = [
  'ffffff', 'f8fafc', 'f1f5f9', 'e2e8f0', 'cbd5e1', 
  '000000', '0f172a', '1e293b', '334155', '475569',
  'fef3c7', 'fde68a', 'fcd34d', 'fee2e2', 'fecaca'
];

// ==========================================
// 1. 📚 SUBJECT MANAGER - V17.0 SUPABASE
// ==========================================
const SubjectManager = {
  iconOptions: EDUCATION_ICONS,
  colorPresets: COLOR_PALETTE,
  iconColorPresets: ICON_COLORS,

  init() {
    const form = document.getElementById('addSubjectForm');
    if (!form) return;
    
    this.populateIconPicker();
    this.populateColorPicker('colorGrid', this.colorPresets);
    this.populateColorPicker('iconColorGrid', this.iconColorPresets);
    this.setupIconSearch();
    this.setupPreviewListeners();
    form.addEventListener('submit', this.handleSubmit.bind(this));
    window.SubjectManager = this;
  },
  
  populateIconPicker() {
    const grid = document.getElementById('iconPicker');
    if (!grid) return;
    
    grid.innerHTML = this.iconOptions.map((icon, idx) => `
      <div class="icon-option ${idx === 0 ? 'selected' : ''}" 
           data-icon="${icon}"
           onclick="SubjectManager.selectIcon(this, '${icon}')">
        <i class="fas ${icon}"></i>
      </div>
    `).join('');
  },
  
  setupIconSearch() {
    const searchInput = document.getElementById('iconSearchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const icons = document.querySelectorAll('#iconPicker .icon-option');
      
      icons.forEach(icon => {
        const iconClass = icon.dataset.icon || '';
        const iconName = iconClass.replace('fa-', '').replace(/-/g, ' ');
        if (iconName.includes(query) || query === '') {
          icon.style.display = 'flex';
        } else {
          icon.style.display = 'none';
        }
      });
    });
  },
  
  populateColorPicker(gridId, colors) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    const fn = gridId === 'colorGrid' ? 'SubjectManager.selectColor' : 'SubjectManager.selectIconColor';
    grid.innerHTML = colors.map((color, idx) => `
      <div class="color-option ${idx === 0 ? 'selected' : ''}" 
           style="background: #${color}" 
           onclick="${fn}(this, '${color}')"></div>
    `).join('');
  },
  
  selectIcon(el, icon) {
    document.getElementById('subjectIcon').value = icon;
    document.getElementById('previewIcon').className = `fas ${icon}`;
    document.querySelectorAll('#iconPicker .icon-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
  },
  
  selectColor(el, color) {
    document.getElementById('subjectColor').value = '#' + color;
    const gradient = `linear-gradient(135deg, #${color}, ${adjustColor('#' + color, 20)})`;
    document.getElementById('previewIconContainer').style.background = gradient;
    document.querySelectorAll('#colorGrid .color-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
  },
  
  selectIconColor(el, color) {
    document.getElementById('iconColor').value = color;
    document.getElementById('previewIcon').style.color = `#${color}`;
    document.querySelectorAll('#iconColorGrid .color-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
  },
  
  setupPreviewListeners() {
    const nameArEl = document.getElementById('subjectNameAr');
    const nameEnEl = document.getElementById('subjectNameEn');
    
    if (nameArEl) {
      nameArEl.addEventListener('input', (e) => {
        const el = document.getElementById('previewNameAr');
        if (el) el.textContent = e.target.value || 'اسم المادة';
      });
    }
    
    if (nameEnEl) {
      nameEnEl.addEventListener('input', (e) => {
        const el = document.getElementById('previewNameEn');
        if (el) el.textContent = e.target.value || 'Subject Name';
      });
    }
  },
  
  async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitSubjectBtn');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    try {
      const subjectId = document.getElementById('subjectId')?.value?.trim()?.toLowerCase() || '';
      if (!/^[a-z0-9-_]{3,}$/.test(subjectId)) throw new Error('معرّف غير صالح (حروف وأرقام وشرطات فقط)');
      
      if (!currentEditingSubjectId) {
        const { data: existing } = await supabase
          .from('subjects')
          .select('id')
          .eq('id', subjectId)
          .maybeSingle();
        
        if (existing) throw new Error('هذا المعرّف مستخدم مسبقاً');
      }
      
      const subjectData = {
        id: subjectId,
        name_ar: document.getElementById('subjectNameAr')?.value || '',
        name_en: document.getElementById('subjectNameEn')?.value || '',
        icon: document.getElementById('subjectIcon')?.value || 'fa-book',
        color: document.getElementById('subjectColor')?.value || '#16a34a',
        order: parseInt(document.getElementById('subjectOrder')?.value) || 1,
        description: document.getElementById('subjectDescription')?.value || '',
        lecturer: document.getElementById('lecturerName')?.value || '',
        protection: document.getElementById('subjectProtection')?.value || 'free',
        is_active: true,
        customizations: { 
          iconColor: document.getElementById('iconColor')?.value || 'ffffff' 
        },
        updated_at: new Date().toISOString()
      };
      
      if (currentEditingSubjectId) {
        const { error } = await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', currentEditingSubjectId);
        
        if (error) throw error;
        
        showToast('تم تحديث المادة!', 'success');
        currentEditingSubjectId = null;
      } else {
        subjectData.created_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('subjects')
          .insert([subjectData]);
        
        if (error) throw error;
        
        showToast('تم إضافة المادة!', 'success');
      }
      
      document.getElementById('addSubjectForm').reset();
      this.resetPreview();
      await this.loadSubjects();
      
    } catch (error) {
      showToast(error.message || 'خطأ', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> حفظ المادة';
    }
  },
  
  resetPreview() {
    document.getElementById('subjectIcon').value = 'fa-book';
    document.getElementById('subjectColor').value = '#16a34a';
    document.getElementById('iconColor').value = 'ffffff';
    this.populateIconPicker();
    this.populateColorPicker('colorGrid', this.colorPresets);
    this.populateColorPicker('iconColorGrid', this.iconColorPresets);
    
    const previewNameAr = document.getElementById('previewNameAr');
    const previewNameEn = document.getElementById('previewNameEn');
    const previewIcon = document.getElementById('previewIcon');
    const previewContainer = document.getElementById('previewIconContainer');
    
    if (previewNameAr) previewNameAr.textContent = 'اسم المادة';
    if (previewNameEn) previewNameEn.textContent = 'Subject Name';
    if (previewIcon) {
      previewIcon.className = 'fas fa-book';
      previewIcon.style.color = '#ffffff';
    }
    if (previewContainer) previewContainer.style.background = 'linear-gradient(135deg, #16a34a, #10b981)';
  },
  
  async loadSubjects() {
    try {
      const { data: subjects, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      
      const list = document.getElementById('subjectsList');
      const lectureSelect = document.getElementById('lectureSubject');
      const filterSelect = document.getElementById('filterBySubject');
      
      if (!list) return;
      
      list.innerHTML = '';
      if (lectureSelect) lectureSelect.innerHTML = '<option value="">اختر مادة...</option>';
      if (filterSelect) filterSelect.innerHTML = '<option value="">جميع المواد</option>';
      subjectsCache = subjects || [];
      
      (subjects || []).forEach((subject) => {
        const iconColor = subject.customizations?.iconColor || 'ffffff';
        const protectionIcon = subject.protection === 'code' ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-gift"></i>';
        
        list.innerHTML += `
          <div class="subject-item">
            <div class="subject-item-header">
              <div class="subject-item-icon" style="background: linear-gradient(135deg, ${subject.color}, ${adjustColor(subject.color, 20)})">
                <i class="fas ${subject.icon}" style="color: #${iconColor};"></i>
              </div>
              <div class="subject-item-info">
                <h3>${subject.name_ar} ${protectionIcon}</h3>
                <p>${subject.name_en}</p>
              </div>
            </div>
            <div class="subject-item-actions">
              <button class="action-btn edit-btn" onclick="SubjectManager.editSubject('${subject.id}')">
                <i class="fas fa-edit"></i> تعديل
              </button>
              <button class="action-btn delete-btn" onclick="SubjectManager.deleteSubject('${subject.id}')">
                <i class="fas fa-trash"></i> حذف
              </button>
            </div>
          </div>
        `;
        
        if (lectureSelect) lectureSelect.innerHTML += `<option value="${subject.id}">${subject.name_ar}</option>`;
        if (filterSelect) filterSelect.innerHTML += `<option value="${subject.id}">${subject.name_ar}</option>`;
      });
      
    } catch (error) {
      console.error('خطأ:', error);
    }
  },
  
  async editSubject(subjectId) {
    try {
      const { data: subject, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
      
      if (error || !subject) throw new Error('المادة غير موجودة');
      
      currentEditingSubjectId = subjectId;
      
      document.getElementById('subjectId').value = subject.id;
      document.getElementById('subjectNameAr').value = subject.name_ar;
      document.getElementById('subjectNameEn').value = subject.name_en;
      document.getElementById('subjectOrder').value = subject.order || 1;
      document.getElementById('lecturerName').value = subject.lecturer || '';
      document.getElementById('subjectDescription').value = subject.description || '';
      document.getElementById('subjectProtection').value = subject.protection || 'free';
      
      document.querySelector('.admin-card h2').scrollIntoView({ behavior: 'smooth' });
      showToast('تم تحميل بيانات المادة', 'success');
      
    } catch (error) {
      showToast('خطأ في التحميل', 'error');
    }
  },
  
  async deleteSubject(subjectId) {
    if (!confirm('هل تريد حذف هذه المادة نهائياً؟ سيتم حذف جميع المحاضرات المرتبطة بها.')) return;
    
    try {
      // Delete subject
      const { error: deleteError } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);
      
      if (deleteError) throw deleteError;
      
      // Delete related lectures
      const { error: lecturesError } = await supabase
        .from('lectures')
        .delete()
        .eq('subject', subjectId);
      
      if (lecturesError) console.warn('Warning deleting lectures:', lecturesError);
      
      showToast('تم حذف المادة والمحاضرات المرتبطة', 'success');
      await this.loadSubjects();
      
    } catch (error) {
      showToast('خطأ في الحذف', 'error');
    }
  }
};

// ==========================================
// 2. 🎬 LECTURE MANAGER - V17.0 SUPABASE
// ==========================================
const LectureManager = {
  init() {
    const form = document.getElementById('addLectureForm');
    if (!form) return;
    
    this.setupLectureIconPicker();
    this.setupLectureColorPicker();
    this.setupLinkTypeToggle();
    
    const defaultLinkType = document.querySelector('input[name="linkType"]:checked')?.value || 'github';
    this.toggleLinkTypeFields(defaultLinkType);
    
    const protectionEl = document.getElementById('lectureProtection');
    if (protectionEl) {
      protectionEl.addEventListener('change', (e) => {
        const options = document.getElementById('protectionOptions');
        if (options) options.style.display = e.target.value === 'code' ? 'block' : 'none';
      });
    }
    
    document.querySelectorAll('input[name="codeMode"]').forEach(r => {
      r.addEventListener('change', (e) => {
        const mode = e.target.value;
        const createFields = document.getElementById('createCodeFields');
        const attachFields = document.getElementById('attachCodeFields');
        if (createFields) createFields.style.display = mode === 'create' ? 'block' : 'none';
        if (attachFields) attachFields.style.display = mode === 'attach' ? 'block' : 'none';
      });
    });
    
    form.addEventListener('submit', this.handleSubmit.bind(this));
    window.LectureManager = this;
  },
  
  setupLectureIconPicker() {
    const grid = document.getElementById('lectureIconPicker');
    const searchInput = document.getElementById('lectureIconSearchInput');
    if (!grid) return;
    
    const commonIcons = ['fa-video', 'fa-book-open', 'fa-file-pdf', 'fa-microphone', 'fa-play-circle', 'fa-book', 'fa-chalkboard', 'fa-laptop'];
    grid.innerHTML = commonIcons.map((icon, idx) => `
      <div class="icon-option ${idx === 0 ? 'selected' : ''}" 
           data-icon="${icon}"
           onclick="LectureManager.selectLectureIcon(this, '${icon}')">
        <i class="fas ${icon}"></i>
      </div>
    `).join('');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        grid.innerHTML = EDUCATION_ICONS
          .filter(icon => {
            const name = icon.replace('fa-', '').replace(/-/g, ' ');
            return name.includes(query) || query === '';
          })
          .slice(0, 20)
          .map(icon => `
            <div class="icon-option" data-icon="${icon}" onclick="LectureManager.selectLectureIcon(this, '${icon}')">
              <i class="fas ${icon}"></i>
            </div>
          `).join('');
      });
    }
  },
  
  selectLectureIcon(el, icon) {
    document.getElementById('lectureIcon').value = icon;
    document.querySelectorAll('#lectureIconPicker .icon-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
  },
  
  setupLectureColorPicker() {
    const grid = document.getElementById('lectureColorGrid');
    if (!grid) return;
    
    const commonColors = ['3b82f6', 'ef4444', '10b981', 'f59e0b', '8b5cf6', 'ec4899', '06b6d4', '16a34a'];
    grid.innerHTML = commonColors.map((color, idx) => `
      <div class="color-option ${idx === 0 ? 'selected' : ''}" 
           style="background: #${color}" 
           onclick="LectureManager.selectLectureColor(this, '${color}')"></div>
    `).join('');
  },
  
  selectLectureColor(el, color) {
    document.getElementById('lectureColor').value = '#' + color;
    document.querySelectorAll('#lectureColorGrid .color-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
  },
  
  setupLinkTypeToggle() {
    document.querySelectorAll('input[name="linkType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.toggleLinkTypeFields(e.target.value);
      });
    });
  },
  
  toggleLinkTypeFields(type) {
    const githubField = document.getElementById('githubPathField');
    const cloudflareField = document.getElementById('cloudflareUrlField');
    
    if (githubField && cloudflareField) {
      if (type === 'github') {
        githubField.style.display = 'block';
        cloudflareField.style.display = 'none';
        const cloudflareInput = document.getElementById('lectureUrlCloudflare');
        if (cloudflareInput) cloudflareInput.value = '';
      } else {
        githubField.style.display = 'none';
        cloudflareField.style.display = 'block';
        const githubInput = document.getElementById('lectureUrlGithub');
        if (githubInput) githubInput.value = '';
      }
    }
  },
  
  validateLectureUrl(linkType, url, protection) {
    if (!url || url.trim() === '') {
      throw new Error('❌ أدخل رابط المحاضرة');
    }
    
    if (linkType === 'github') {
      if (!url.includes('lectures/')) {
        throw new Error('❌ مسار GitHub يجب أن يحتوي على /lectures/ في المسار');
      }
      if (!url.endsWith('.html')) {
        throw new Error('❌ مسار GitHub يجب أن ينتهي بـ: .html');
      }
    }
    
    if (linkType === 'cloudflare') {
      if (protection === 'code') {
        throw new Error('❌ المحاضرات المحمية (بكود) يجب أن تستخدم GitHub Path وليس Cloudflare URL');
      }
      
      try {
        new URL(url);
      } catch {
        throw new Error('❌ رابط Cloudflare غير صالح (يجب أن يبدأ بـ https://)');
      }
    }
    
    return true;
  },
  
  async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitLectureBtn');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    try {
      const lectureId = document.getElementById('lectureId')?.value?.trim() || '';
      const subject = document.getElementById('lectureSubject')?.value || '';
      const protection = document.getElementById('lectureProtection')?.value || 'free';
      
      if (!lectureId || !subject) {
        throw new Error('❌ أكمل الحقول المطلوبة (المعرّف + المادة)');
      }
      
      if (!/^[a-z0-9-_]{3,50}$/.test(lectureId)) {
        throw new Error('❌ معرّف المحاضرة غير صالح (حروف إنجليزية صغيرة وأرقام وشرطات فقط)');
      }
      
      const linkType = document.querySelector('input[name="linkType"]:checked')?.value || 'github';
      let lectureUrl = '';
      
      if (linkType === 'github') {
        lectureUrl = document.getElementById('lectureUrlGithub')?.value?.trim() || '';
      } else if (linkType === 'cloudflare') {
        lectureUrl = document.getElementById('lectureUrlCloudflare')?.value?.trim() || '';
      }
      
      this.validateLectureUrl(linkType, lectureUrl, protection);
      
      if (!currentEditingLectureId) {
        const { data: existing } = await supabase
          .from('lectures')
          .select('id')
          .eq('id', lectureId)
          .maybeSingle();
        
        if (existing) {
          throw new Error('❌ معرّف المحاضرة مستخدم مسبقاً. اختر معرّف آخر.');
        }
      }
      
      const lectureData = {
        id: lectureId,
        subject,
        title: document.getElementById('lectureTitle')?.value?.trim() || '',
        description: document.getElementById('lectureDescription')?.value?.trim() || '',
        url: lectureUrl,
        link_type: linkType,
        protection,
        is_free: protection === 'free',
        price: protection === 'free' ? 0 : (parseFloat(document.getElementById('lecturePrice')?.value) || 0),
        order: parseInt(document.getElementById('lectureOrder')?.value) || 1,
        icon: document.getElementById('lectureIcon')?.value || 'fa-video',
        color: document.getElementById('lectureColor')?.value || '#3b82f6',
        duration: '',
        customizations: {},
        is_active: true,
        updated_at: new Date().toISOString()
      };
      
      if (currentEditingLectureId) {
        const { error } = await supabase
          .from('lectures')
          .update(lectureData)
          .eq('id', currentEditingLectureId);
        
        if (error) throw error;
        
        showToast('✅ تم تحديث المحاضرة بنجاح!', 'success');
        currentEditingLectureId = null;
      } else {
        lectureData.created_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('lectures')
          .insert([lectureData]);
        
        if (error) throw error;
        
        showToast('✅ تم إضافة المحاضرة بنجاح!', 'success');
      }
      
      if (protection === 'code' && !currentEditingLectureId) {
        const mode = document.querySelector('input[name="codeMode"]:checked')?.value || 'create';
        
        if (mode === 'create') {
          const code = 'ATHR-' + Math.random().toString(36).substring(2, 10).toUpperCase();
          const maxUses = parseInt(document.getElementById('newCodeMaxUses')?.value) || 0;
          const expiresAtVal = document.getElementById('newCodeExpiresAt')?.value;
          
          const { error: codeError } = await supabase
            .from('activation_codes')
            .insert([{
              code,
              target_type: 'lecture',
              target_ids: [lectureId],
              max_uses: maxUses,
              uses_count: 0,
              expires_at: expiresAtVal || null,
              is_active: true,
              notes: document.getElementById('codeNotes')?.value?.trim() || '',
              created_at: new Date().toISOString()
            }]);
          
          if (codeError) throw codeError;
          
          showToast(`✅ تم إنشاء الكود: ${code}`, 'success');
          
          try {
            await navigator.clipboard.writeText(code);
            showToast('📋 تم نسخ الكود تلقائياً!', 'success');
          } catch (err) {
            console.log('لم يتم نسخ الكود');
          }
          
        } else if (mode === 'attach') {
          const codeStr = document.getElementById('existingCodeString')?.value?.trim().toUpperCase();
          if (!codeStr) throw new Error('❌ أدخل الكود المراد ربطه');
          
          const { data: existingCode, error: codeError } = await supabase
            .from('activation_codes')
            .select('*')
            .eq('code', codeStr)
            .maybeSingle();
          
          if (codeError || !existingCode) throw new Error('❌ الكود غير موجود في قاعدة البيانات');
          
          if (!existingCode.is_active) throw new Error('❌ الكود معطل ولا يمكن استخدامه');
          
          const { error: updateError } = await supabase
            .from('activation_codes')
            .update({ 
              target_type: 'lecture',
              target_ids: [lectureId]
            })
            .eq('code', codeStr);
          
          if (updateError) throw updateError;
          
          showToast('✅ تم ربط الكود بالمحاضرة بنجاح!', 'success');
        }
      }
      
      document.getElementById('addLectureForm').reset();
      this.resetForm();
      await this.loadLectures();
      
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message || 'خطأ في الحفظ', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> حفظ المحاضرة';
    }
  },
  
  resetForm() {
    this.setupLectureIconPicker();
    this.setupLectureColorPicker();
    
    const githubRadio = document.querySelector('input[name="linkType"][value="github"]');
    if (githubRadio) githubRadio.checked = true;
    this.toggleLinkTypeFields('github');
    
    const protectionOptions = document.getElementById('protectionOptions');
    if (protectionOptions) protectionOptions.style.display = 'none';
    
    currentEditingLectureId = null;
  },
  
  async loadLectures() {
    const tbody = document.getElementById('lecturesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
    
    try {
      const { data: lecturesData, error } = await supabase
        .from('lectures')
        .select('*')
        .order('subject', { ascending: true })
        .order('order', { ascending: true });
      
      if (error) throw error;
      
      const lectures = lecturesData || [];
      
      if (lectures.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">لا توجد محاضرات بعد</td></tr>';
        return;
      }
      
      tbody.innerHTML = '';
      
      lectures.forEach((lecture) => {
        const subject = subjectsCache.find(s => s.id === lecture.subject);
        const subjectName = subject?.name_ar || lecture.subject;
        
        let protection = '<span class="status-badge status-inactive"><i class="fas fa-gift"></i> مجانية</span>';
        if (lecture.protection === 'code' || !lecture.is_free) {
          protection = '<span class="status-badge status-active"><i class="fas fa-lock"></i> محمية</span>';
        }
        
        const linkType = lecture.link_type === 'cloudflare' 
          ? '<i class="fas fa-cloud"></i> Cloudflare' 
          : '<i class="fas fa-folder"></i> GitHub';
        
        const shortUrl = (lecture.url || '').length > 35 
          ? (lecture.url || '').substring(0, 35) + '...' 
          : (lecture.url || '');
        
        tbody.innerHTML += `
          <tr>
            <td><strong>${lecture.title}</strong></td>
            <td>${subjectName}</td>
            <td><strong>${lecture.order}</strong></td>
            <td>${protection}</td>
            <td title="${lecture.url}">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div>${linkType}</div>
                <small style="color:#64748b;">${shortUrl}</small>
              </div>
            </td>
            <td style="display:flex; gap:6px; flex-wrap:nowrap;">
              <button class="action-btn edit-btn" onclick="LectureManager.editLecture('${lecture.id}')" style="flex:none;padding:8px 14px;">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete-btn" onclick="LectureManager.deleteLecture('${lecture.id}')" style="flex:none;padding:8px 14px;">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
      
    } catch (error) {
      console.error('خطأ:', error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">خطأ في تحميل المحاضرات</td></tr>';
    }
  },
  
  async editLecture(lectureId) {
    try {
      const { data: lecture, error } = await supabase
        .from('lectures')
        .select('*')
        .eq('id', lectureId)
        .single();
      
      if (error || !lecture) throw new Error('المحاضرة غير موجودة');
      
      currentEditingLectureId = lectureId;
      
      document.getElementById('lectureId').value = lecture.id;
      document.getElementById('lectureSubject').value = lecture.subject;
      document.getElementById('lectureTitle').value = lecture.title;
      document.getElementById('lectureDescription').value = lecture.description || '';
      document.getElementById('lectureProtection').value = lecture.protection || 'free';
      document.getElementById('lectureOrder').value = lecture.order || 1;
      document.getElementById('lectureIcon').value = lecture.icon || 'fa-video';
      document.getElementById('lectureColor').value = lecture.color || '#3b82f6';
      
      const linkType = lecture.link_type || 'github';
      const linkTypeRadio = document.querySelector(`input[name="linkType"][value="${linkType}"]`);
      if (linkTypeRadio) linkTypeRadio.checked = true;
      
      if (linkType === 'github') {
        document.getElementById('lectureUrlGithub').value = lecture.url || '';
        document.getElementById('lectureUrlCloudflare').value = '';
      } else {
        document.getElementById('lectureUrlCloudflare').value = lecture.url || '';
        document.getElementById('lectureUrlGithub').value = '';
      }
      
      this.toggleLinkTypeFields(linkType);
      document.getElementById('protectionOptions').style.display = 'none';
      
      document.querySelector('.admin-card h2').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('✅ تم تحميل بيانات المحاضرة', 'success');
      
    } catch (error) {
      console.error('Error:', error);
      showToast('❌ خطأ في تحميل المحاضرة', 'error');
    }
  },
  
  async deleteLecture(lectureId) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه المحاضرة نهائياً؟\n\nسيتم أيضاً:\n-  حذف الأكواد المرتبطة\n-  إزالتها من جميع المستخدمين')) return;
    
    try {
      // Delete lecture
      const { error: deleteError } = await supabase
        .from('lectures')
        .delete()
        .eq('id', lectureId);
      
      if (deleteError) throw deleteError;
      
      // Delete related activation codes
      const { error: codesError } = await supabase
        .from('activation_codes')
        .delete()
        .contains('target_ids', [lectureId]);
      
      if (codesError) console.warn('Warning deleting codes:', codesError);
      
      // Remove from user libraries
      const { error: libraryError } = await supabase
        .from('user_library')
        .delete()
        .eq('lecture_id', lectureId);
      
      if (libraryError) console.warn('Warning removing from libraries:', libraryError);
      
      showToast('✅ تم حذف المحاضرة والأكواد المرتبطة', 'success');
      await this.loadLectures();
      
    } catch (error) {
      console.error('Error:', error);
      showToast('❌ خطأ في الحذف', 'error');
    }
  }
};

// ==========================================
// 3. 🔑 CODES MANAGER - V17.0 SUPABASE
// ==========================================
const CodesManager = {
  init() {
    window.CodesManager = this;
    window.refreshCodes = () => this.loadCodes();
  },
  
  async loadCodes() {
    const tbody = document.getElementById('codesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
    
    try {
      const { data: codes, error } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!codes || codes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">لا توجد أكواد تفعيل</td></tr>';
        return;
      }
      
      tbody.innerHTML = '';
      const now = new Date();
      
      codes.forEach((code) => {
        let targetName = '-';
        if (code.target_type === 'lecture') {
          const lectureIds = code.target_ids || [];
          targetName = `محاضرة (${lectureIds.length})`;
        } else if (code.target_type === 'subject') {
          const subjectId = code.target_ids?.[0];
          const subject = subjectsCache.find(s => s.id === subjectId);
          targetName = `مادة: ${subject?.name_ar || subjectId}`;
        } else if (code.target_type === 'bundle') {
          targetName = `باقة (${(code.target_ids || []).length} مواد)`;
        }
        
        let status = '<span class="status-badge status-active"><i class="fas fa-circle-check"></i> نشط</span>';
        if (!code.is_active) {
          status = '<span class="status-badge status-inactive"><i class="fas fa-ban"></i> معطل</span>';
        } else if (code.expires_at && new Date(code.expires_at) < now) {
          status = '<span class="status-badge status-inactive"><i class="fas fa-hourglass-end"></i> منتهي</span>';
        } else if (code.max_uses > 0 && code.uses_count >= code.max_uses) {
          status = '<span class="status-badge status-inactive"><i class="fas fa-check"></i> مستنفد</span>';
        }
        
        const expiryDate = code.expires_at ? new Date(code.expires_at).toLocaleDateString('ar-EG') : '—';
        
        tbody.innerHTML += `
          <tr>
            <td><strong>${code.code}</strong></td>
            <td>${code.target_type || 'lecture'}</td>
            <td>${targetName}</td>
            <td>${code.uses_count || 0} / ${code.max_uses === 0 ? '∞' : code.max_uses}</td>
            <td>${expiryDate}</td>
            <td>${status}</td>
            <td>
              <button class="action-btn delete-btn" onclick="CodesManager.deleteCode('${code.id}')" style="flex:none;width:auto;padding:8px 12px;">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
      
    } catch (error) {
      console.error('خطأ:', error);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;">خطأ في تحميل الأكواد</td></tr>';
    }
  },
  
  async deleteCode(codeId) {
    if (!confirm('⚠️ هل تريد حذف هذا الكود؟\n\nملاحظة: المستخدمين الذين فعّلوا المحاضرة سيحتفظون بها.')) return;
    
    try {
      const { error } = await supabase
        .from('activation_codes')
        .delete()
        .eq('id', codeId);
      
      if (error) throw error;
      
      showToast('✅ تم حذف الكود بنجاح', 'success');
      await this.loadCodes();
    } catch (error) {
      console.error('Error:', error);
      showToast('❌ خطأ في الحذف', 'error');
    }
  }
};

// ==========================================
// 4. 👥 USERS MANAGER - V17.0 SUPABASE
// ==========================================
const UsersManager = {
  init() {
    window.UsersManager = this;
  },
  
  async loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    const countEl = document.getElementById('totalUsersCount');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
    
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (countEl) countEl.textContent = users?.length || 0;
      
      if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">لا يوجد مستخدمين مسجلين</td></tr>';
        return;
      }
      
      tbody.innerHTML = '';
      
      // Get lecture counts for each user
      const { data: libraryCounts } = await supabase
        .from('user_library')
        .select('user_id');
      
      const lectureCounts = {};
      (libraryCounts || []).forEach(item => {
        lectureCounts[item.user_id] = (lectureCounts[item.user_id] || 0) + 1;
      });
      
      users.forEach((user) => {
        const lectureCount = lectureCounts[user.uid] || 0;
        const role = user.role || 'student';
        const roleText = role === 'admin' 
          ? '<span class="status-badge status-active"><i class="fas fa-crown"></i> إدارة</span>' 
          : '<span class="status-badge status-inactive"><i class="fas fa-user"></i> طالب</span>';
        
        const joinDate = user.created_at 
          ? new Date(user.created_at).toLocaleDateString('ar-EG') 
          : '—';
        
        tbody.innerHTML += `
          <tr>
            <td><strong>${user.name || '-'}</strong></td>
            <td>${user.email || '-'}</td>
            <td>${user.university || '-'}</td>
            <td><strong style="color:var(--color-primary);">${lectureCount}</strong></td>
            <td>${roleText}</td>
            <td>
              <button class="action-btn edit-btn" onclick="UsersManager.viewUser('${user.uid}')" style="flex:none;width:auto;padding:8px 12px;">
                <i class="fas fa-eye"></i> عرض
              </button>
            </td>
          </tr>
        `;
      });
      
    } catch (error) {
      console.error('خطأ:', error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">خطأ في تحميل المستخدمين</td></tr>';
    }
  },
  
  async viewUser(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', userId)
        .single();
      
      if (error || !user) {
        showToast('❌ المستخدم غير موجود', 'error');
        return;
      }
      
      const { data: userLectures } = await supabase
        .from('user_library')
        .select('lecture_id')
        .eq('user_id', userId);
      
      const lectureCount = userLectures?.length || 0;
      const joinDate = user.created_at 
        ? new Date(user.created_at).toLocaleDateString('ar-EG') 
        : 'غير متوفر';
      
      const message = `
        📌 الاسم: ${user.name}
        📧 البريد: ${user.email}
        🎓 الجامعة: ${user.university || 'غير محدد'}
        📚 عدد المحاضرات: ${lectureCount}
        📅 تاريخ التسجيل: ${joinDate}
      `;
      
      alert(message);
      showToast('✅ تم عرض بيانات المستخدم', 'success');
      
    } catch (error) {
      console.error('Error:', error);
      showToast('❌ خطأ في عرض البيانات', 'error');
    }
  }
};

// ==========================================
// 🚪 LOGOUT FUNCTION
// ==========================================
window.logout = async function() {
  if (!confirm('هل تريد تسجيل الخروج من لوحة التحكم؟')) return;
  
  try {
    await supabase.auth.signOut();
    showToast('✅ تم تسجيل الخروج بنجاح', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
    showToast('❌ خطأ في تسجيل الخروج', 'error');
  }
};

// ==========================================
// ✅ READY LOG
// ==========================================
console.log('✅ Admin Dashboard V17.0 - Supabase Edition');
console.log('📦 Features:');
console.log('  -  90+ Education Icons');
console.log('  -  50+ Color Presets');
console.log('  -  GitHub Path + Cloudflare URL Support');
console.log('  -  ✅ Full Supabase Integration');
console.log('  -  ✅ NO STUDY TIME Feature');
console.log('  -  Protected Lectures with Codes');
console.log('  -  Users Management');
console.log('  -  Full CRUD Operations');
console.log('🚀 Ready to use!');
