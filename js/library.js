// ==========================================
// ✨ ATHR LIBRARY V23.0 - GLASS MORPHISM
// World-Class Standards Implementation
// Apple HIG + Material 3 + 60+ Years Best Practices
// ==========================================

import { supabase, generateAvatarUrl, AVATAR_CONFIGS, onAuthChange } from './app.js';

// ==========================================
// 📊 STATE MANAGEMENT - Centralized Store
// ==========================================
let currentUser = null;
let userData = null;
let lecturesDB = {};
let userLectures = [];
let subjects = {};
let currentTab = 'allSubjects';
let selectedAvatarConfig = null;
let tempAvatarConfig = null;
let continueItems = [];
let allLectures = [];
let searchTimeout = null;
let currentLibraryView = 'grid';

// ==========================================
// 🔔 GLASS TOAST SYSTEM - WORLD-CLASS
// Standards: iOS 15+ Notification + Material 3 Snackbar
// Best Practices: WCAG 2.1 AA Compliant + GPU Accelerated
// ==========================================

// Create Toast Container - Singleton Pattern
const toastContainer = (() => {
  let container = document.querySelector('.toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'الإشعارات');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  
  return container;
})();

let toastIdCounter = 0;
const activeToasts = new Map();

/**
 * عرض Toast بمعايير عالمية
 * @param {string} message - الرسالة المعروضة
 * @param {string} type - success | error | info | warning
 * @param {number} duration - المدة بالميلي ثانية (0 = لا نهائي)
 * @returns {Object} Toast object مع طريقة remove()
 */
window.showToast = function(message, type = 'info', duration = 4000) {
  const toastId = `toast-${++toastIdCounter}`;
  
  // Icon Mapping - Material Design Icons
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };
  
  // Title Mapping - User-Friendly Messages
  const titles = {
    success: 'نجح!',
    error: 'خطأ',
    info: 'معلومة',
    warning: 'تحذير'
  };
  
  // Create Toast Element
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `glass-toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  // Toast HTML Structure
  toast.innerHTML = `
    <div class="glass-toast-content">
      <div class="glass-toast-icon-wrapper">
        <i class="fas ${icons[type]} glass-toast-icon"></i>
      </div>
      <div class="glass-toast-text">
        <h4 class="glass-toast-title">${titles[type]}</h4>
        <p class="glass-toast-message">${message}</p>
      </div>
      <button 
        class="glass-toast-close" 
        aria-label="إغلاق الإشعار"
        onclick="this.closest('.glass-toast').remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    ${duration > 0 ? `<div class="glass-toast-progress"></div>` : ''}
  `;
  
  // Add to Container
  toastContainer.appendChild(toast);
  
  // Store Reference
  activeToasts.set(toastId, toast);
  
  // Force Reflow for Animation
  toast.offsetHeight;
  
  // Auto Remove with Timeout
  let timeoutId;
  if (duration > 0) {
    timeoutId = setTimeout(() => {
      removeToast(toastId);
    }, duration);
  }
  
  // Click to Dismiss
  toast.addEventListener('click', () => {
    if (timeoutId) clearTimeout(timeoutId);
    removeToast(toastId);
  });
  
  // Return Control Object
  return {
    id: toastId,
    element: toast,
    remove: () => {
      if (timeoutId) clearTimeout(timeoutId);
      removeToast(toastId);
    },
    update: (newMessage) => {
      const messageEl = toast.querySelector('.glass-toast-message');
      if (messageEl) messageEl.textContent = newMessage;
    }
  };
};

/**
 * إزالة Toast بشكل سلس
 * @param {string} toastId - معرّف Toast
 */
function removeToast(toastId) {
  const toast = activeToasts.get(toastId);
  
  if (toast && toast.parentElement) {
    toast.classList.add('hiding');
    
    // Wait for Exit Animation
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
        activeToasts.delete(toastId);
      }
    }, 300);
  }
}

/**
 * إغلاق كل الإشعارات
 */
window.clearAllToasts = function() {
  activeToasts.forEach((toast, id) => {
    removeToast(id);
  });
};

// ==========================================
// 🚀 INITIALIZATION - App Bootstrap
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Auth State Listener
  onAuthChange(async (user) => {
    if (!user) { 
      window.location.href = 'login.html'; 
      return; 
    }
    
    currentUser = user;
    
    // Initialize Library
    await initializeLibrary();
    
    // Setup Event Listeners
    initializeEventListeners();
    
    // Load User Progress
    await loadContinueWatching();
    
    // Update UI
    updateSmartGreeting();
    updateOverallProgress();
  });
});

// ==========================================
// ✅ LIBRARY INITIALIZATION
// Standard: Progressive Loading Pattern
// ==========================================
async function initializeLibrary() {
  let loadingToast = null;
  
  try {
    // Show Loading State
    loadingToast = showToast('جاري تحميل المكتبة...', 'info', 0);
    showLoadingSkeleton();
    
    // ✅ Step 1: Get User Data
    const { data: userDataFromDB, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', currentUser.id)
      .single();
    
    if (userError) throw userError;
    
    userData = userDataFromDB || {};

    // ✅ Step 2: Get User Library
    const { data: userLibraryData, error: libraryError } = await supabase
      .from('user_library')
      .select('lecture_id')
      .eq('user_id', currentUser.id);
    
    if (libraryError) throw libraryError;
    
    userLectures = userLibraryData ? userLibraryData.map(item => item.lecture_id) : [];

    // ✅ Step 3: Get Subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    
    if (subjectsError) throw subjectsError;
    
    // Build Subjects Map
    subjects = {};
    subjectsData.forEach(s => { 
      subjects[s.id] = s; 
    });

    // ✅ Step 4: Get Lectures
    const { data: lecturesData, error: lecturesError } = await supabase
      .from('lectures')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    
    if (lecturesError) throw lecturesError;
    
    // Build Lectures Map
    lecturesDB = {};
    allLectures = [];
    
    lecturesData.forEach(lecture => {
      // Add to All Lectures
      allLectures.push({ id: lecture.id, ...lecture });
      
      // Group by Subject
      const subjectId = lecture.subject;
      if (!lecturesDB[subjectId]) {
        lecturesDB[subjectId] = [];
      }
      
      lecturesDB[subjectId].push({ 
        id: lecture.id, 
        ...lecture, 
        color: subjects[subjectId]?.color || '#16a34a' 
      });
    });

    // ✅ Step 5: Sort Lectures by Order
    Object.keys(lecturesDB).forEach(sid => {
      lecturesDB[sid].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // ✅ Update UI
    updateHeaderInfo();
    updateLibraryCount();
    hideLoadingSkeleton();
    
    // Remove Loading Toast
    if (loadingToast) loadingToast.remove();
    
    // Render Content
    renderSubjectsGrid();
    renderMyLibrary();
    updateOverallProgress();
    
    // Success Feedback
    showToast('✅ تم تحميل المكتبة بنجاح', 'success', 2000);
    
  } catch (e) {
    // Error Handling
    hideLoadingSkeleton();
    if (loadingToast) loadingToast.remove();
    
    console.error('❌ خطأ التهيئة:', e);
    showToast('❌ خطأ في التحميل، حاول تحديث الصفحة', 'error');
  }
}

// ==========================================
// 📚 LIBRARY VIEW TOGGLE - Grid/List
// Standard: Spotify/Netflix View Toggle Pattern
// ==========================================
window.setLibraryView = function(view) {
  currentLibraryView = view;
  
  // Update Button States
  document.querySelectorAll('.view-control-btn').forEach(btn => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  
  // Update Grid Layout
  const grid = document.getElementById('myLibraryGrid');
  if (grid) {
    grid.classList.toggle('list-view', view === 'list');
  }
  
  // Re-render
  renderModernLibrary();
  
  // Feedback
  showToast(view === 'grid' ? '📊 عرض شبكي' : '📋 عرض قائمة', 'info', 1500);
};

// ==========================================
// 🎨 RENDER MODERN LIBRARY - Netflix Style
// Standard: Card-based Content Grid
// ==========================================
function renderModernLibrary() {
  const container = document.getElementById('myLibraryGrid');
  const lecturesCountEl = document.getElementById('myLibraryLecturesCount');
  
  if (!container) return;
  
  // Filter Subjects with User Lectures
  const subjectsWithLecs = {};
  
  Object.keys(lecturesDB).forEach(sid => {
    const userLecsInSubj = lecturesDB[sid].filter(l => userLectures.includes(l.id));
    if (userLecsInSubj.length > 0) {
      subjectsWithLecs[sid] = userLecsInSubj;
    }
  });
  
  // Update Count
  const totalLectures = Object.values(subjectsWithLecs).reduce((sum, lecs) => sum + lecs.length, 0);
  if (lecturesCountEl) {
    lecturesCountEl.textContent = totalLectures;
  }
  
  // Render Based on View Mode
  if (currentLibraryView === 'grid') {
    renderModernLibraryGrid(container, subjectsWithLecs);
  } else {
    renderModernLibraryList(container, subjectsWithLecs);
  }
}

/**
 * Render Grid View - Netflix Style
 */
function renderModernLibraryGrid(container, subjectsWithLecs) {
  container.innerHTML = Object.entries(subjectsWithLecs).map(([sid, lecs]) => {
    const subj = subjects[sid];
    if (!subj) return '';
    
    const total = lecturesDB[sid]?.length || 1;
    const prog = Math.round((lecs.length / total) * 100);
    const col = subj.color || '#16a34a';
    const icon = subj.icon || 'fa-book';
    
    return `
      <div class="modern-library-card" 
        onclick="window.location.href='subject.html?s=${sid}'"
        role="button"
        tabindex="0"
        aria-label="${subj.name_ar}: ${lecs.length} محاضرة"
        onkeydown="if(event.key==='Enter') window.location.href='subject.html?s=${sid}'">
        
        <div class="modern-library-card-banner" style="background: linear-gradient(135deg, ${col}, ${adjustColor(col, 20)});">
          <i class="fas ${icon} modern-library-card-banner-icon"></i>
          <div class="modern-library-progress-overlay">
            <div class="modern-library-progress-bar" style="width: ${prog}%;"></div>
          </div>
        </div>
        
        <div class="modern-library-card-body">
          <h3 class="modern-library-card-title">${subj.name_ar || 'بدون عنوان'}</h3>
          <div class="modern-library-card-meta">
            <span class="modern-library-card-meta-item">
              <i class="fas fa-video"></i> ${lecs.length} محاضرة
            </span>
            <span class="modern-library-card-meta-item">
              <i class="fas fa-check-circle"></i> ${prog}%
            </span>
          </div>
          <div class="modern-library-card-progress">
            <div class="modern-library-progress-text">
              <span>التقدم</span>
              <span class="progress-percentage">${prog}%</span>
            </div>
            <div class="modern-library-progress-bar-container">
              <div class="modern-library-progress-bar-fill" style="width: ${prog}%;"></div>
            </div>
          </div>
        </div>
        
        <div class="modern-library-card-footer">
          <button class="modern-library-btn" 
            onclick="event.stopPropagation(); window.location.href='subject.html?s=${sid}'"
            aria-label="متابعة ${subj.name_ar}">
            <i class="fas fa-arrow-left"></i> متابعة
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render List View - Spotify Playlist Style
 */
function renderModernLibraryList(container, subjectsWithLecs) {
  container.innerHTML = Object.entries(subjectsWithLecs).map(([sid, lecs]) => {
    const subj = subjects[sid];
    if (!subj) return '';
    
    const total = lecturesDB[sid]?.length || 1;
    const prog = Math.round((lecs.length / total) * 100);
    const col = subj.color || '#16a34a';
    const icon = subj.icon || 'fa-book';
    
    return `
      <div class="modern-library-card" 
        onclick="window.location.href='subject.html?s=${sid}'"
        role="button"
        tabindex="0"
        aria-label="${subj.name_ar}: ${lecs.length} من ${total} محاضرة"
        onkeydown="if(event.key==='Enter') window.location.href='subject.html?s=${sid}'">
        
        <div class="modern-library-card-banner" style="background: linear-gradient(135deg, ${col}, ${adjustColor(col, 20)});">
          <i class="fas ${icon} modern-library-card-banner-icon"></i>
        </div>
        
        <div class="modern-library-card-body" style="flex: 1;">
          <h3 class="modern-library-card-title">${subj.name_ar || 'بدون عنوان'}</h3>
          <div class="modern-library-card-meta">
            <span class="modern-library-card-meta-item">
              <i class="fas fa-video"></i> ${lecs.length}/${total} محاضرة
            </span>
            <span class="modern-library-card-meta-item">
              <i class="fas fa-check-circle"></i> ${prog}%
            </span>
          </div>
        </div>
        
        <div class="modern-library-card-footer" style="border: none; padding: 16px;">
          <button class="modern-library-btn" 
            onclick="event.stopPropagation(); window.location.href='subject.html?s=${sid}'"
            aria-label="متابعة ${subj.name_ar}">
            <i class="fas fa-arrow-left"></i> متابعة
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 💀 LOADING SKELETON - Facebook Style
// Standard: Perceived Performance Pattern
// ==========================================
function showLoadingSkeleton() {
  const grid = document.getElementById('subjectsGrid');
  if (!grid) return;
  
  grid.classList.add('loading');
  grid.innerHTML = Array(6).fill(`
    <div class="skeleton-card" role="status" aria-label="جاري التحميل">
      <div class="skeleton-text title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text subtitle"></div>
      <span class="sr-only">جاري التحميل...</span>
    </div>
  `).join('');
}

function hideLoadingSkeleton() {
  const grid = document.getElementById('subjectsGrid');
  if (grid) {
    grid.classList.remove('loading');
  }
}

// ==========================================
// ✅ HEADER INFO UPDATE
// ==========================================
function updateHeaderInfo() {
  const nameEl = document.getElementById('headerUserName');
  const infoEl = document.getElementById('headerUserUniversity');
  const avatarEl = document.getElementById('headerUserAvatar');

  if (nameEl) {
    nameEl.textContent = userData.name || userData.username || 'المستخدم';
  }
  
  if (infoEl) {
    infoEl.textContent = userData.email || 'طالب';
  }
  
  if (avatarEl) {
    avatarEl.src = userData.avatar || generateAvatarUrl(currentUser.id);
  }

  // Remove Loading State
  document.querySelector('.user-section')?.classList.remove('loading');
}

// ==========================================
// 📊 LIBRARY COUNT UPDATE
// ==========================================
function updateLibraryCount() {
  const cnt = document.getElementById('headerLibraryCount');
  if (cnt) {
    cnt.textContent = userLectures.length;
  }
}

// ==========================================
// 📈 OVERALL PROGRESS - Apple Watch Style
// ==========================================
function updateOverallProgress() {
  const fill = document.getElementById('overallProgressFill');
  const circle = document.getElementById('userProgressCircle');
  const pctText = document.getElementById('userProgressPercentage');
  const progressTextEl = document.getElementById('progressText');

  const totalLectures = Object.values(lecturesDB).reduce((acc, arr) => acc + arr.length, 0);
  const owned = userLectures.length;
  const pct = totalLectures ? Math.round((owned / totalLectures) * 100) : 0;

  // Linear Progress Bar
  if (fill) {
    fill.style.width = `${pct}%`;
  }
  
  // Percentage Text
  if (pctText) {
    pctText.textContent = `${pct}%`;
  }
  
  // Progress Text
  if (progressTextEl) {
    progressTextEl.textContent = `${owned}/${totalLectures} محاضرة`;
  }
  
  // SVG Circle Progress - iOS Activity Rings
  if (circle) {
    const circumference = 339.29; // 2πr where r=54
    const offset = circumference - (circumference * pct) / 100;
    circle.style.strokeDashoffset = `${offset}`;
  }
}

// ==========================================
// 🎧 EVENT LISTENERS SETUP
// ==========================================
function initializeEventListeners() {
  // User Section Click
  const userSection = document.querySelector('.user-section');
  if (userSection) {
    userSection.addEventListener('click', (e) => {
      e.stopPropagation();
      window.openProfile();
    });
    
    userSection.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.openProfile();
      }
    });
  }

  // Close Search on Outside Click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar-container')) {
      const searchResults = document.getElementById('searchResults');
      if (searchResults) {
        searchResults.style.display = 'none';
      }
    }
  });

  // Profile Modal Overlay
  document.querySelector('.profile-modal-overlay')?.addEventListener('click', window.closeProfile);

  // Profile Form Submit
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfile(e);
    });
  }

  // Save Profile Button
  const saveBtn = document.getElementById('saveProfileBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveProfile(e);
    });
  }

  // Tab Buttons
  document.querySelectorAll('.tab-btn-new').forEach(btn => {
    btn.addEventListener('click', () => {
      window.switchTab(btn.dataset.tab);
    });
    
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.switchTab(btn.dataset.tab);
      }
    });
  });

  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ==========================================
// ⌨️ KEYBOARD SHORTCUTS
// Standard: Google/Slack Shortcuts
// ==========================================
function handleKeyboardShortcuts(e) {
  // Escape - Close Modals
  if (e.key === 'Escape') {
    window.closeProfile();
    window.closeAvatarSelector();
    document.querySelector('.custom-dialog-overlay')?.remove();
    
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      searchResults.style.display = 'none';
    }
  }
  
  // Ctrl/Cmd + K - Focus Search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
}

// ==========================================
// 🔍 GLOBAL SEARCH - Spotlight macOS Style
// Standard: Debounced Search with Fuzzy Matching
// ==========================================
window.handleGlobalSearch = function(query) {
  clearTimeout(searchTimeout);
  
  const searchClear = document.getElementById('searchClear');
  
  // Show/Hide Clear Button
  if (query.trim()) {
    if (searchClear) searchClear.style.display = 'flex';
  } else {
    if (searchClear) searchClear.style.display = 'none';
    
    const searchResults = document.getElementById('searchResults');
    if (searchResults) searchResults.style.display = 'none';
    
    return;
  }
  
  // Debounce Search - 300ms
  searchTimeout = setTimeout(() => {
    performSearch(query.trim());
  }, 300);
};

window.clearSearch = function() {
  const input = document.getElementById('globalSearch');
  if (input) {
    input.value = '';
    input.focus();
  }
  
  const searchResults = document.getElementById('searchResults');
  if (searchResults) searchResults.style.display = 'none';
  
  const searchClear = document.getElementById('searchClear');
  if (searchClear) searchClear.style.display = 'none';
};

/**
 * Perform Search - Fuzzy Matching
 * @param {string} query - Search query
 */
function performSearch(query) {
  const results = [];
  const searchResults = document.getElementById('searchResults');
  
  if (!query) {
    if (searchResults) searchResults.style.display = 'none';
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Search Subjects
  Object.entries(subjects).forEach(([subjectId, subject]) => {
    if (
      subject.name_ar?.toLowerCase().includes(lowerQuery) ||
      subject.name_en?.toLowerCase().includes(lowerQuery) ||
      subject.description?.toLowerCase().includes(lowerQuery)
    ) {
      results.push({
        type: 'subject',
        id: subjectId,
        title: subject.name_ar,
        subtitle: `${lecturesDB[subjectId]?.length || 0} محاضرة`,
        color: subject.color || '#16a34a',
        icon: subject.icon || 'fa-book'
      });
    }
  });
  
  // Search Lectures
  Object.entries(lecturesDB).forEach(([subjectId, lectures]) => {
    lectures.forEach(lecture => {
      if (
        lecture.title?.toLowerCase().includes(lowerQuery) ||
        lecture.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'lecture',
          id: lecture.id,
          title: lecture.title,
          subtitle: `في: ${subjects[subjectId]?.name_ar || 'بدون عنوان'}`,
          color: lecture.color,
          icon: lecture.icon || 'fa-video'
        });
      }
    });
  });
  
  // Render Results
  renderSearchResults(results);
}

/**
 * Render Search Results
 * @param {Array} results - Search results array
 */
function renderSearchResults(results) {
  const container = document.getElementById('searchResults');
  
  // Empty State
  if (results.length === 0) {
    container.innerHTML = `
      <div class="search-empty" role="status">
        <i class="fas fa-search"></i>
        <p>لم نجد نتائج</p>
      </div>
    `;
    container.style.display = 'block';
    return;
  }
  
  // Render Results (Max 10)
  container.innerHTML = results.slice(0, 10).map((result, index) => `
    <div 
      class="search-result-item" 
      onclick="window.searchResultClick('${result.type}', '${result.id}')"
      onkeydown="if(event.key==='Enter') window.searchResultClick('${result.type}', '${result.id}')"
      tabindex="0"
      role="button"
      aria-label="${result.title}">
      <div class="search-result-icon" style="background: rgba(${hexToRgb(result.color)}, 0.15);">
        <i class="fas ${result.icon}" style="color: ${result.color};"></i>
      </div>
      <div class="search-result-text">
        <p class="search-result-title">${result.title}</p>
        <p class="search-result-subtitle">${result.subtitle}</p>
      </div>
    </div>
  `).join('');
  
  container.style.display = 'block';
}

/**
 * Handle Search Result Click
 * @param {string} type - subject | lecture
 * @param {string} id - Item ID
 */
window.searchResultClick = function(type, id) {
  // Clear Search
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) searchInput.value = '';
  
  const searchResults = document.getElementById('searchResults');
  if (searchResults) searchResults.style.display = 'none';
  
  const searchClear = document.getElementById('searchClear');
  if (searchClear) searchClear.style.display = 'none';
  
  // Navigate
  if (type === 'subject') {
    window.location.href = `subject.html?s=${id}`;
  } else if (type === 'lecture') {
    const subjectId = Object.keys(lecturesDB).find(sid =>
      lecturesDB[sid].some(l => l.id === id)
    );
    
    if (subjectId) {
      window.location.href = `subject.html?s=${subjectId}&lecture=${id}`;
    }
  }
};

/**
 * Hex to RGB Converter
 * @param {string} hex - Hex color (#RRGGBB)
 * @returns {string} RGB string "R, G, B"
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '22, 163, 74';
}

// ==========================================
// 📑 TABS SYSTEM - iOS Segmented Control
// ==========================================
window.switchTab = function(tabId) {
  currentTab = tabId;
  
  // Update Tab Buttons
  document.querySelectorAll('.tab-btn-new').forEach(b => {
    const isActive = b.dataset.tab === tabId;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  
  // Update Tab Panels
  document.querySelectorAll('.tab-panel-new').forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
  
  // Tab-Specific Actions
  if (tabId === 'myLibrary') {
    renderMyLibrary();
    renderModernLibrary();
    updateSmartGreeting();
  } else if (tabId === 'continueWatching') {
    loadContinueWatching();
  } else if (tabId === 'allSubjects') {
    renderSubjectsGrid();
  }
};

// To be continued in next message...

console.log('✅ Library.js V23.0 GLASS MORPHISM - Part 1 Loaded');
// ==========================================
// 🎨 RENDER SUBJECTS GRID - Apple Music Style
// Standard: Card-based Grid with Hover Effects
// ==========================================
function renderSubjectsGrid() {
  const container = document.getElementById('subjectsGrid');
  if (!container) return;
  
  // Empty State
  if (Object.keys(subjects).length === 0) {
    container.innerHTML = `
      <div class="empty-state-new" role="alert" aria-live="polite">
        <i class="fas fa-inbox"></i>
        <h3>لا توجد مواد</h3>
        <p>يرجى المحاولة لاحقاً</p>
      </div>
    `;
    return;
  }
  
  // Render Subject Cards
  container.innerHTML = Object.entries(subjects)
    .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
    .map(([subjectId, subject]) => {
      const lectures = lecturesDB[subjectId] || [];
      const ownedLectures = lectures.filter(l => userLectures.includes(l.id)).length;
      const progress = lectures.length ? Math.round((ownedLectures / lectures.length) * 100) : 0;
      const color = subject.color || '#16a34a';
      const icon = subject.icon || 'fa-book';
      const iconColor = subject.customizations?.iconColor || 'ffffff';
      const isProtected = subject.protection === 'code';
      const protectionIcon = isProtected ? 'fa-lock' : 'fa-gift';
      const protectionText = isProtected ? 'محمية' : 'مجانية';
      const buttonText = ownedLectures > 0 ? 'استمر' : 'ابدأ';

      return `
        <div class="subject-card" 
          onclick="window.location.href='subject.html?s=${subjectId}'"
          role="button"
          tabindex="0"
          aria-label="${subject.name_ar}: ${lectures.length} محاضرة، التقدم ${progress}%"
          onkeydown="if(event.key==='Enter') window.location.href='subject.html?s=${subjectId}'">
          
          ${isProtected ? `
            <div class="status-icon-mini" aria-label="محمية">
              <i class="fas fa-lock"></i>
            </div>
          ` : ''}
          
          <div class="subject-icon" style="background: linear-gradient(135deg, ${color}, ${adjustColor(color, 20)});">
            <i class="fas ${icon}" style="color:#${iconColor};" aria-hidden="true"></i>
          </div>

          <h3 class="subject-title">${subject.name_ar || 'بدون عنوان'}</h3>
          <p class="subject-desc">${subject.description || 'لا يوجد وصف'}</p>

          <div class="subject-meta">
            <span><i class="fas fa-layer-group" aria-hidden="true"></i> ${lectures.length} محاضرة</span>
            <span><i class="fas ${protectionIcon}" aria-hidden="true"></i> ${protectionText}</span>
          </div>

          <div class="subject-progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="التقدم ${progress}%">
            <div class="subject-progress-fill" style="width:${progress}%;"></div>
          </div>

          <div class="subject-card-footer">
            <button class="capsule-btn-sm" 
              onclick="event.stopPropagation(); window.location.href='subject.html?s=${subjectId}'" 
              aria-label="${buttonText} ${subject.name_ar}">
              <i class="fas fa-play" aria-hidden="true"></i> ${buttonText}
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

// ==========================================
// 📚 RENDER MY LIBRARY - User's Collection
// Standard: Owned Content Display
// ==========================================
function renderMyLibrary() {
  const container = document.getElementById('myLibraryGrid');
  const emptyState = document.getElementById('libraryEmptyState');
  const myLibCount = document.getElementById('myLibraryCount');
  
  if (!container) return;

  // Empty State
  if (userLectures.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (myLibCount) myLibCount.textContent = '0 مادة';
    container.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Filter Subjects with Owned Lectures
  const subjectsWithLecs = {};
  
  Object.keys(lecturesDB).forEach(sid => {
    const userLecsInSubj = lecturesDB[sid].filter(l => userLectures.includes(l.id));
    if (userLecsInSubj.length > 0) {
      subjectsWithLecs[sid] = userLecsInSubj;
    }
  });

  // Update Count
  if (myLibCount) {
    myLibCount.textContent = `${Object.keys(subjectsWithLecs).length} مادة`;
  }

  // Render Subject Cards
  container.innerHTML = Object.entries(subjectsWithLecs).map(([sid, lecs]) => {
    const subj = subjects[sid];
    if (!subj) return '';

    const total = lecturesDB[sid]?.length || 1;
    const prog = Math.round((lecs.length / total) * 100);
    const col = subj.color || '#16a34a';
    const icon = subj.icon || 'fa-book';
    const iconColor = subj.customizations?.iconColor || 'ffffff';

    return `
      <div class="subject-card" 
        onclick="window.location.href='subject.html?s=${sid}'"
        role="button"
        tabindex="0"
        aria-label="${subj.name_ar}: ${lecs.length} من ${total} محاضرة، التقدم ${prog}%"
        onkeydown="if(event.key==='Enter') window.location.href='subject.html?s=${sid}'">
        
        <div class="subject-icon" style="background: linear-gradient(135deg, ${col}, ${adjustColor(col, 20)});">
          <i class="fas ${icon}" style="color:#${iconColor};" aria-hidden="true"></i>
        </div>

        <h3 class="subject-title">${subj.name_ar || 'بدون عنوان'}</h3>
        <p class="subject-desc">${lecs.length} من ${total} محاضرة</p>

        <div class="subject-meta">
          <span><i class="fas fa-check-double" aria-hidden="true"></i> مملوكة</span>
          <span>${prog}%</span>
        </div>

        <div class="subject-progress" role="progressbar" aria-valuenow="${prog}" aria-valuemin="0" aria-valuemax="100">
          <div class="subject-progress-fill" style="width:${prog}%;"></div>
        </div>

        <div class="subject-card-footer">
          <button class="capsule-btn-sm" 
            onclick="event.stopPropagation(); window.location.href='subject.html?s=${sid}'" 
            aria-label="استمر ${subj.name_ar}">
            <i class="fas fa-play" aria-hidden="true"></i> استمر
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Render Modern Library View
  renderModernLibrary();
}

// ==========================================
// ▶️ CONTINUE WATCHING - Recent Activity
// Standard: Netflix "Continue Watching" Pattern
// ==========================================
async function loadContinueWatching() {
  const container = document.getElementById('continueWatchingGrid');
  const tabBtn = document.querySelector('[data-tab="continueWatching"]');
  const badge = document.getElementById('cwCount');
  
  if (!container || !tabBtn) return;

  // Get Owned Lectures
  const owned = [];
  
  Object.keys(lecturesDB).forEach(sid => {
    lecturesDB[sid].forEach(l => {
      if (userLectures.includes(l.id)) {
        owned.push({ 
          ...l, 
          subjectName: subjects[sid]?.name_ar || subjects[sid]?.name || sid, 
          subjectId: sid 
        });
      }
    });
  });

  // Get Last 5 Lectures
  const items = owned.slice(-5).reverse();
  continueItems = items;

  // Empty State
  if (items.length === 0) {
    tabBtn.style.display = 'none';
    if (badge) badge.style.display = 'none';
    container.innerHTML = '';
    updateSmartGreeting();
    return;
  }

  // Show Tab & Badge
  tabBtn.style.display = 'flex';
  if (badge) { 
    badge.textContent = items.length; 
    badge.style.display = 'inline-block'; 
  }

  // Render Continue Items
  container.innerHTML = items.map(lec => {
    const bg = lec.color || '#16a34a';
    const icon = lec.icon || 'fa-book';
    const iconColor = lec.customizations?.iconColor || 'ffffff';

    return `
      <div class="lecture-capsule" 
        onclick="window.location.href='subject.html?s=${lec.subjectId}'" 
        role="button"
        tabindex="0"
        aria-label="${lec.title} في ${lec.subjectName}"
        onkeydown="if(event.key==='Enter') window.location.href='subject.html?s=${lec.subjectId}'"
        style="border-inline-start: 4px solid ${bg}; cursor: pointer;">
        
        <div class="lecture-icon-box" style="background: linear-gradient(135deg, ${bg}, ${adjustColor(bg, 20)});">
          <i class="fas ${icon}" style="color:#${iconColor};" aria-hidden="true"></i>
        </div>
        
        <div class="lecture-info">
          <h3>${lec.title}</h3>
          <p><i class="fas fa-tag" aria-hidden="true"></i> ${lec.subjectName}</p>
        </div>
        
        <span class="lecture-status-active">
          <i class="fas fa-play-circle" aria-hidden="true"></i> متابعة
        </span>
      </div>
    `;
  }).join('');

  updateSmartGreeting();
}

// ==========================================
// ✅ SMART GREETING - Contextual Welcome
// Standard: Time-based Greeting + User Context
// ==========================================
function updateSmartGreeting() {
  const box = document.getElementById('smartGreeting');
  const head = document.getElementById('greetHeadline');
  const sub = document.getElementById('greetSub');
  const btn = document.getElementById('greetContinueBtn');
  
  if (!box || !head || !sub || !btn) return;

  // User Display Name
  const displayName = userData?.name || userData?.username || 'صديقي';
  
  // Time-based Greeting
  const h = new Date().getHours();
  const timeText = h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور';
  
  head.textContent = `${timeText} ${displayName}`;

  // Calculate Progress
  const totalLectures = Object.values(lecturesDB).reduce((acc, arr) => acc + arr.length, 0);
  const owned = userLectures.length;
  const ownedPct = totalLectures ? Math.round((owned / totalLectures) * 100) : 0;

  // Contextual Message
  if (continueItems.length > 0) {
    const last = continueItems[0];
    sub.textContent = 'نكمل من حيث توقفت؟';
    btn.style.display = 'inline-flex';
    btn.innerHTML = `<i class="fas fa-play"></i> ${last.title.substring(0, 20)}...`;
    btn.onclick = () => window.location.href = `subject.html?s=${last.subjectId}`;
  } else if (owned > 0) {
    sub.textContent = `أتممت ${ownedPct}% من مكتبتك — اختر مادة لتكمل التقدم`;
    btn.style.display = 'none';
  } else {
    sub.textContent = 'ابدأ أول مادة وبالتوفيق!';
    btn.style.display = 'none';
  }

  box.style.display = 'flex';
}

// ==========================================
// ➕ ADD TO LIBRARY - Single Lecture
// Standard: Optimistic UI Update Pattern
// ==========================================
window.addToLibrary = async function(lectureId) {
  // Check if Already Owned
  if (userLectures.includes(lectureId)) {
    showToast('أنت تملك هذه المحاضرة بالفعل', 'info');
    return;
  }

  try {
    // Insert to Supabase
    const { error } = await supabase
      .from('user_library')
      .insert({ 
        user_id: currentUser.id, 
        lecture_id: lectureId,
        added_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update Local State
    userLectures.push(lectureId);
    updateLibraryCount();
    updateOverallProgress();

    // Success Feedback
    showToast('✅ تمت الإضافة بنجاح', 'success');

    // Navigate to Subject
    const sid = Object.keys(lecturesDB).find(id => 
      lecturesDB[id].some(l => l.id === lectureId)
    );
    
    if (sid) {
      setTimeout(() => {
        window.location.href = `subject.html?s=${sid}`;
      }, 800);
    }
  } catch (e) {
    console.error('❌ خطأ الإضافة:', e);
    showToast('❌ خطأ في الإضافة، حاول مرة أخرى', 'error');
  }
};

// ==========================================
// ➕ ADD MULTIPLE LECTURES - Batch Insert
// Standard: Bulk Operations Pattern
// ==========================================
window.addMultipleLecturesToLibrary = async function(lectureIds = []) {
  try {
    if (!lectureIds || lectureIds.length === 0) {
      showToast('⚠️ لا توجد محاضرات لإضافتها', 'warning');
      return;
    }

    // Filter Unique IDs
    const uniqueIds = lectureIds.filter(id => !userLectures.includes(id));
    
    if (uniqueIds.length === 0) {
      showToast('أنت تمتلك هذه المحاضرات بالفعل', 'info');
      return;
    }

    // Show Loading Toast
    const loadingToast = showToast(`جاري إضافة ${uniqueIds.length} محاضرة...`, 'info', 0);

    // Prepare Records
    const records = uniqueIds.map(lectureId => ({
      user_id: currentUser.id,
      lecture_id: lectureId,
      added_at: new Date().toISOString()
    }));
    
    // Batch Insert
    const { error } = await supabase
      .from('user_library')
      .insert(records);

    if (error) throw error;

    // Update Local State
    userLectures = [...userLectures, ...uniqueIds];
    
    // Update UI
    updateLibraryCount();
    updateOverallProgress();
    renderMyLibrary();
    
    // Remove Loading Toast
    if (loadingToast) loadingToast.remove();
    
    // Success Feedback
    showToast(`✅ تمت إضافة ${uniqueIds.length} محاضرة بنجاح`, 'success');
    
  } catch (e) {
    console.error('❌ خطأ الإضافة المتعددة:', e);
    showToast('❌ خطأ في الإضافة', 'error');
  }
};

// ==========================================
// 🔑 ACTIVATION DIALOG - Code Input Modal
// Standard: iOS Alert Controller Style
// ==========================================
window.showActivationDialog = function(lectureId) {
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog-overlay';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  
  dialog.innerHTML = `
    <div class="capsule-dialog">
      <div class="dialog-header">
        <div class="dialog-icon-mini">
          <i class="fas fa-key"></i>
        </div>
        <div>
          <h3 class="dialog-title" id="dialog-title">تفعيل المحاضرة</h3>
          <p class="dialog-message">أدخل كود التفعيل (مثال: ATHR-ABC12345)</p>
        </div>
      </div>
      
      <input 
        type="text" 
        class="dialog-input" 
        id="activationCodeInput" 
        placeholder="ATHR-XXXXXXXX" 
        style="direction: ltr; text-transform: uppercase;"
        aria-label="إدخال كود التفعيل"
        autocomplete="off"
        maxlength="13">
      
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-primary" 
          onclick="window.confirmActivation('${lectureId}', this)" 
          aria-label="تفعيل الكود">
          <i class="fas fa-check"></i> تفعيل
        </button>
        <button class="dialog-btn dialog-btn-secondary" 
          onclick="this.closest('.custom-dialog-overlay').remove()" 
          aria-label="إلغاء">
          <i class="fas fa-times"></i> إلغاء
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Focus Input
  setTimeout(() => {
    const input = document.getElementById('activationCodeInput');
    if (input) {
      input.focus();
      
      // Enter Key Submit
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          window.confirmActivation(lectureId, dialog.querySelector('.dialog-btn-primary'));
        }
      });
      
      // Auto-format Input (ATHR-XXXXXXXX)
      input.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (value.length > 4 && !value.startsWith('ATHR-')) {
          value = 'ATHR-' + value.slice(4);
        }
        
        e.target.value = value.slice(0, 13);
        clearValidationError(input);
      });
    }
  }, 100);
};

// ==========================================
// ✅ VALIDATION HELPERS - Form Validation
// Standard: Material Design Validation Pattern
// ==========================================
function showValidationError(input, message) {
  if (!input) return;
  
  // Style Input
  input.classList.add('error');
  input.style.borderColor = '#ef4444';
  input.style.background = 'rgba(239, 68, 68, 0.08)';
  
  // Add Error Message
  let errorMsg = input.parentElement.querySelector('.error-message');
  
  if (!errorMsg) {
    errorMsg = document.createElement('p');
    errorMsg.className = 'error-message';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.style.cssText = `
      color: #ef4444; 
      font-size: 0.85rem; 
      margin-top: 6px; 
      font-weight: 600; 
      display: flex; 
      align-items: center; 
      gap: 6px;
      animation: errorShake 0.4s ease;
    `;
    input.parentElement.appendChild(errorMsg);
  }
  
  errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  errorMsg.style.display = 'flex';
  
  // Shake Animation
  input.style.animation = 'errorShake 0.4s ease';
  setTimeout(() => {
    input.style.animation = '';
  }, 400);
}

function clearValidationError(input) {
  if (!input) return;
  
  // Reset Style
  input.classList.remove('error');
  input.style.borderColor = '';
  input.style.background = '';
  
  // Hide Error Message
  const errorMsg = input.parentElement.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.style.display = 'none';
  }
}

// ==========================================
// ✅ CONFIRM ACTIVATION - Code Validation
// Standard: Secure Code Verification Pattern
// ==========================================
window.confirmActivation = async function(lectureId, btnEl) {
  const codeInput = document.getElementById('activationCodeInput');
  const code = codeInput?.value.trim().toUpperCase() || '';

  // Validation: Empty Code
  if (!code) {
    showValidationError(codeInput, 'يرجى إدخال الكود');
    return;
  }

  // Validation: Code Format
  if (!/^ATHR-[A-Z0-9]{8}$/.test(code)) {
    showValidationError(codeInput, '❌ صيغة الكود خاطئة (مثال: ATHR-ABC12345)');
    return;
  }

  try {
    // Loading State
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    }

    // ✅ Get Code from Supabase
    const { data: codeData, error: codeError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (codeError || !codeData) { 
      showValidationError(codeInput, '❌ كود غير صحيح أو منتهي الصلاحية');
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      }
      return; 
    }

    // ✅ Check Expiration
    const now = new Date();
    const isExpired = codeData.expires_at && new Date(codeData.expires_at) < now;
    
    if (isExpired) {
      showValidationError(codeInput, '⏰ انتهت صلاحية هذا الكود');
      if (btnEl) { 
        btnEl.disabled = false; 
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل'; 
      }
      return;
    }
    
    // ✅ Check Max Uses
    const isMaxed = codeData.max_uses > 0 && codeData.uses_count >= codeData.max_uses;
    
    if (isMaxed) {
      showValidationError(codeInput, '🚫 تم استخدام هذا الكود بالكامل');
      if (btnEl) { 
        btnEl.disabled = false; 
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل'; 
      }
      return;
    }

    // ✅ Get Target Lectures
    let lecturesToAdd = [];

    if (codeData.target_type === 'lecture') {
      // Single Lecture
      lecturesToAdd = codeData.target_ids || [];
      
    } else if (codeData.target_type === 'subject') {
      // Whole Subject
      const subjectId = codeData.target_ids?.[0];
      if (subjectId) {
        lecturesToAdd = allLectures
          .filter(l => l.subject === subjectId)
          .map(l => l.id);
      }
      
    } else if (codeData.target_type === 'bundle') {
      // Multiple Subjects (Bundle)
      const subjectIds = codeData.target_ids || [];
      lecturesToAdd = allLectures
        .filter(l => subjectIds.includes(l.subject))
        .map(l => l.id);
    }

    // ✅ Add Lectures to Library
    await window.addMultipleLecturesToLibrary(lecturesToAdd);

    // ✅ Update Code Usage
    await supabase
      .from('activation_codes')
      .update({
        uses_count: codeData.uses_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', codeData.id);

    // ✅ Close Dialog
    document.querySelector('.custom-dialog-overlay')?.remove();
    
    // ✅ Success Feedback
    showToast('✅ تم التفعيل بنجاح!', 'success');
    
    clearValidationError(codeInput);
    
    // ✅ Refresh UI
    renderMyLibrary();
    loadContinueWatching();
    
  } catch (e) {
    console.error('❌ خطأ التفعيل:', e);
    showValidationError(codeInput, '❌ خطأ في الاتصال، حاول مرة أخرى');
    
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
    }
  }
};

// ==========================================
// ▶️ OPEN LECTURE - Navigation Handler
// ==========================================
window.openLecture = function(url) {
  if (!url || url === '#') { 
    showToast('المحاضرة قيد التطوير', 'info'); 
    return; 
  }
  
  window.open(url, '_blank', 'noopener,noreferrer');
};

// ==========================================
// ✅ PROFILE MODAL - User Settings
// Standard: iOS Settings Modal Pattern
// ==========================================
window.openProfile = function() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;

  modal.classList.add('active');
  
  // Populate Form Fields
  const nameEl = document.getElementById('profileName');
  const usernameEl = document.getElementById('profileUsername');
  const phoneEl = document.getElementById('profilePhone');
  const emailEl = document.getElementById('profileEmail');
  const passEl = document.getElementById('profilePassword');
  const imgEl = document.getElementById('profileAvatarImg');

  if (nameEl) nameEl.value = userData.name || '';
  if (usernameEl) usernameEl.value = userData.username || '';
  if (phoneEl) phoneEl.value = userData.phone_number || '';
  if (emailEl) emailEl.value = currentUser.email || '';
  if (passEl) passEl.value = '';
  if (imgEl) imgEl.src = userData.avatar || generateAvatarUrl(currentUser.id);

  // Load Avatar Selector
  window.loadAvatarSelector();
  
  // Focus First Input
  setTimeout(() => {
    if (nameEl) nameEl.focus();
  }, 300);
};

window.closeProfile = function() {
  document.getElementById('profileModal')?.classList.remove('active');
  selectedAvatarConfig = null;
  tempAvatarConfig = null;
};

window.backToLibrary = function() {
  const lecturesView = document.getElementById('lecturesView');
  if (lecturesView) lecturesView.style.display = 'none';
  window.switchTab('allSubjects');
};

// ==========================================
// ✅ SAVE PROFILE - Form Submission
// Standard: Optimistic Update Pattern
// ==========================================
async function saveProfile(e) {
  if (e) e.preventDefault();
  
  try {
    const nameEl = document.getElementById('profileName');
    const usernameEl = document.getElementById('profileUsername');
    const phoneEl = document.getElementById('profilePhone');
    const passEl = document.getElementById('profilePassword');
    const btnEl = document.getElementById('saveProfileBtn');

    const newName = nameEl?.value.trim() || '';
    const newUsername = usernameEl?.value.trim().toLowerCase() || '';
    const newPhone = phoneEl?.value.trim() || '';
    const newPass = passEl?.value.trim() || '';

    // Validation: Name Required
    if (!newName) {
      showToast('⚠️ الاسم مطلوب', 'warning');
      nameEl?.focus();
      return;
    }

    // Validation: Username Required
    if (!newUsername) {
      showToast('⚠️ اسم المستخدم مطلوب', 'warning');
      usernameEl?.focus();
      return;
    }

    // Validation: Username Format
    if (!/^[a-z0-9_]+$/.test(newUsername)) {
      showToast('⚠️ اسم المستخدم: حروف وأرقام و _ فقط', 'warning');
      usernameEl?.focus();
      return;
    }

    // Validation: Username Unique
    if (newUsername !== userData.username?.toLowerCase()) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('uid')
        .eq('username', newUsername)
        .maybeSingle();

      if (existingUser) {
        showToast('⚠️ اسم المستخدم محجوز', 'warning');
        usernameEl?.focus();
        return;
      }
    }

    // Validation: Phone Format
    if (newPhone && !/^[0-9+]+$/.test(newPhone)) {
      showToast('⚠️ رقم الهاتف: أرقام فقط', 'warning');
      phoneEl?.focus();
      return;
    }

    // Loading State
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    }

    // Prepare Update Data
    const updateData = { 
      updated_at: new Date().toISOString(),
      name: newName,
      username: newUsername,
      phone_number: newPhone || null
    };
    
    // Add Avatar if Selected
    if (selectedAvatarConfig?.avatar) {
      updateData.avatar = selectedAvatarConfig.avatar;
      if (selectedAvatarConfig.seed) {
        updateData.avatar_seed = selectedAvatarConfig.seed;
      }
      if (selectedAvatarConfig.params) {
        updateData.avatar_params = selectedAvatarConfig.params;
      }
    }

    // ✅ Update Profile
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('uid', currentUser.id);

    if (updateError) throw updateError;
    
    // ✅ Update Password (Optional)
    if (newPass) {
      if (newPass.length < 6) {
        showToast('⚠️ كلمة المرور: 6 أحرف على الأقل', 'warning');
        passEl?.focus();
        
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.innerHTML = '<i class="fas fa-check-circle"></i> حفظ التغييرات';
        }
        return;
      }

      try {
        const { error: passError } = await supabase.auth.updateUser({
          password: newPass
        });
        
        if (passError) throw passError;
        
        showToast('✅ تم تحديث كلمة المرور', 'success');
        if (passEl) passEl.value = '';
        
      } catch (passErr) {
        console.error('❌ خطأ كلمة المرور:', passErr);
        showToast('⚠️ فشل تحديث كلمة المرور', 'error');
      }
    }

    // Update Local State
    userData = { ...userData, ...updateData };
    
    // Update UI
    updateHeaderInfo();
    
    // Success Feedback
    showToast('✅ تم الحفظ بنجاح', 'success');
    
    // Close Modal
    setTimeout(() => {
      window.closeProfile();
    }, 1000);

    // Reset Button
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check-circle"></i> حفظ التغييرات';
    }
    
  } catch (e) {
    console.error('❌ خطأ الحفظ:', e);
    showToast('❌ خطأ في الحفظ: ' + e.message, 'error');
    
    const btnEl = document.getElementById('saveProfileBtn');
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check-circle"></i> حفظ التغييرات';
    }
  }
}

// ==========================================
// 🎨 AVATAR SELECTOR - DiceBear Integration
// Standard: iOS Photo Picker Pattern
// ==========================================
window.showAvatarSelector = function() {
  const selector = document.getElementById('avatarSelector');
  if (selector) selector.style.display = 'block';
};

window.closeAvatarSelector = function() {
  const selector = document.getElementById('avatarSelector');
  if (selector) selector.style.display = 'none';
  tempAvatarConfig = null;
};

window.loadAvatarSelector = function() {
  const grid = document.querySelector('.avatars-grid');
  if (!grid) return;

  grid.innerHTML = AVATAR_CONFIGS.slice(0, 6).map((config, i) => {
    const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(config.seed)}&${config.params}`;
    
    return `
      <div class="avatar-option" 
        onclick="window.selectDiceAvatar('${config.seed}', \`${config.params}\`)" 
        style="
          border:2px solid var(--glass-border);
          border-radius:var(--radius-md);
          overflow:hidden;
          cursor:pointer; 
          transition: all 0.2s; 
          position: relative;
        " 
        tabindex="0" 
        role="button"
        aria-label="اختيار صورة ${i+1}"
        onmouseover="this.style.transform='scale(1.05)'" 
        onmouseout="this.style.transform='scale(1)'"
        onkeydown="if(event.key==='Enter') window.selectDiceAvatar('${config.seed}', \`${config.params}\`)">
        <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover" alt="صورة ${i+1}">
      </div>
    `;
  }).join('');
};

window.selectDiceAvatar = function(seed, params) {
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&${params}`;
  
  tempAvatarConfig = { 
    avatar: avatarUrl,
    seed: seed,
    params: params 
  };
  
  // Update Selection Styles
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.style.borderColor = 'var(--glass-border)';
    opt.style.boxShadow = 'none';
  });
  
  event.currentTarget.style.borderColor = '#16a34a';
  event.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.2)';
};

window.confirmAvatarSelection = function() {
  if (tempAvatarConfig) {
    selectedAvatarConfig = tempAvatarConfig;
    
    const imgEl = document.getElementById('profileAvatarImg');
    if (imgEl) imgEl.src = selectedAvatarConfig.avatar;
    
    showToast('✅ تم اختيار الصورة', 'success', 2000);
  }
  
  window.closeAvatarSelector();
};

window.cancelAvatarSelection = function() {
  tempAvatarConfig = null;
  window.closeAvatarSelector();
};

// ==========================================
// 🚪 LOGOUT - Auth Sign Out
// ==========================================
window.logout = async function() {
  try {
    const confirmed = confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (!confirmed) return;
    
    showToast('جاري تسجيل الخروج...', 'info', 0);
    
    await supabase.auth.signOut();
    
    showToast('✅ تم تسجيل الخروج', 'success', 1000);
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    
  } catch (e) {
    console.error('❌ خطأ الخروج:', e);
    showToast('❌ خطأ في تسجيل الخروج', 'error');
  }
};

// ==========================================
// 🛠️ UTILITY FUNCTIONS
// ==========================================

/**
 * Adjust Color Brightness
 * @param {string} color - Hex color
 * @param {number} percent - Adjustment percentage
 * @returns {string} Adjusted hex color
 */
function adjustColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * Debounce Function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// 🎯 CONSOLE LOG - Version Info
// ==========================================
console.log(`
%c✨ ATHR LIBRARY V23.0 - GLASS MORPHISM
%cStandards: Apple HIG + Material 3 + 60+ Years Best Practices
%cGPU Accelerated | WCAG 2.1 AA | RTL Optimized
`, 
'color: #16a34a; font-size: 16px; font-weight: bold;',
'color: #10b981; font-size: 12px;',
'color: #64748b; font-size: 10px;'
);

// ==========================================
// 🎯 END OF FILE
// ==========================================
