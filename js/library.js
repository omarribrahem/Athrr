// ==========================================
// ✅ ATHR LIBRARY - V18.0 ULTIMATE
// Username + Phone Support (No University)
// All Critical Fixes Applied + New User Schema
// ==========================================

import { auth, db, generateAvatarUrl, AVATAR_CONFIGS } from './app.js';
import { onAuthStateChanged, signOut, updatePassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  doc, getDoc, collection, getDocs, updateDoc, serverTimestamp,
  query, where, limit, arrayUnion, increment, setDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ==========================================
// STATE
// ==========================================
let currentUser = null, userData = null, lecturesDB = {}, userLectures = [], subjects = {};
let currentTab = 'allSubjects', selectedAvatarConfig = null, tempAvatarConfig = null;
let continueItems = [];
let allLectures = [];
let searchTimeout = null;
let studyTimerInterval = null;
let currentLibraryView = 'grid';
let loadingToast = null;

// ⏱️ Study Time State
let studyTimeData = {
  totalMinutes: 0,
  sessions: [],
  lectureStats: {}
};

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'login.html'; return; }
    currentUser = user;
    await initializeLibrary();
    initializeEventListeners();
    await loadContinueWatching();
    await loadStudyTimeData();
    updateSmartGreeting();
    updateOverallProgress();
    updateStudyTimeDisplay();
  });
});

// ==========================================
// ✅ ENHANCED: LIBRARY DATA INITIALIZATION
// ==========================================
async function initializeLibrary() {
  try {
    loadingToast = showToast('جاري تحميل المكتبة...', 'info', 0);
    showLoadingSkeleton();
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    userData = userDoc.data() || {};
    userLectures = userData.lectures || [];

    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    subjects = {};
    subjectsSnap.forEach(d => { subjects[d.id] = d.data(); });

    const lecturesSnap = await getDocs(collection(db, 'lectures'));
    lecturesDB = {};
    allLectures = [];
    const existingLectureIds = [];
    
    lecturesSnap.forEach(d => {
      const lecture = d.data();
      allLectures.push({ id: d.id, ...lecture });
      existingLectureIds.push(d.id);
      
      const subjectId = lecture.subject;
      if (!lecturesDB[subjectId]) lecturesDB[subjectId] = [];
      lecturesDB[subjectId].push({ 
        id: d.id, 
        ...lecture, 
        color: subjects[subjectId]?.color || '#16a34a' 
      });
    });

    // ✅ AUTO-CLEANUP
    const validUserLectures = userLectures.filter(lectureId => 
      existingLectureIds.includes(lectureId)
    );
    
    if (validUserLectures.length !== userLectures.length) {
      const deletedCount = userLectures.length - validUserLectures.length;
      console.log(`🧹 Auto-cleanup: Removing ${deletedCount} deleted lecture(s)`);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        lectures: validUserLectures,
        updatedAt: serverTimestamp()
      });
      
      userLectures = validUserLectures;
      showToast(`🧹 تم تنظيف ${deletedCount} محاضرة محذوفة`, 'info');
    }

    Object.keys(lecturesDB).forEach(sid => {
      lecturesDB[sid].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    updateHeaderInfo();
    updateLibraryCount();
    hideLoadingSkeleton();
    
    if (loadingToast) loadingToast.remove();
    
    renderSubjectsGrid();
    renderMyLibrary();
    updateOverallProgress();
  } catch (e) {
    hideLoadingSkeleton();
    if (loadingToast) loadingToast.remove();
    
    console.error('❌ خطأ التهيئة:', e);
    showToast('❌ خطأ في التحميل، حاول تحديث الصفحة', 'error');
  }
}

// ==========================================
// ⏱️ STUDY TIME TRACKER SYSTEM
// ==========================================

async function loadStudyTimeData() {
  try {
    const studyDoc = await getDoc(doc(db, 'studyTime', currentUser.uid));
    
    if (studyDoc.exists()) {
      const data = studyDoc.data();
      studyTimeData = {
        totalMinutes: data.totalMinutes || 0,
        sessions: data.sessions || [],
        lectureStats: data.lectureStats || {}
      };
    } else {
      await setDoc(doc(db, 'studyTime', currentUser.uid), {
        userId: currentUser.uid,
        totalMinutes: 0,
        sessions: [],
        lectureStats: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    updateStudyTimeDisplay();
  } catch (e) {
    console.error('❌ Error loading study time:', e);
  }
}

function updateStudyTimeDisplay() {
  const totalEl = document.getElementById('totalStudyTime');
  const circleEl = document.getElementById('studyTimerCircle');
  
  if (totalEl) {
    const hours = Math.floor(studyTimeData.totalMinutes / 60);
    const mins = studyTimeData.totalMinutes % 60;
    totalEl.textContent = `${hours}س ${mins}د`;
  }
  
  if (circleEl) {
    const maxMinutes = 300;
    const progress = Math.min(studyTimeData.totalMinutes / maxMinutes, 1);
    const circumference = 339.29;
    const offset = circumference - (circumference * progress);
    circleEl.style.strokeDashoffset = offset;
  }
}

async function startStudySession(lectureId) {
  const lecture = allLectures.find(l => l.id === lectureId);
  if (!lecture) return;
  
  const sessionStart = Date.now();
  const sessionKey = `study_session_${lectureId}`;
  
  localStorage.setItem(sessionKey, JSON.stringify({
    lectureId,
    lectureTitle: lecture.title,
    subjectName: subjects[lecture.subject]?.nameAr || 'غير محدد',
    startTime: sessionStart
  }));
  
  console.log(`⏱️ Study session started for: ${lecture.title}`);
}

async function endStudySession(lectureId) {
  const sessionKey = `study_session_${lectureId}`;
  const sessionData = localStorage.getItem(sessionKey);
  
  if (!sessionData) return;
  
  const session = JSON.parse(sessionData);
  const endTime = Date.now();
  const durationMinutes = Math.round((endTime - session.startTime) / 60000);
  
  if (durationMinutes < 1) {
    localStorage.removeItem(sessionKey);
    return;
  }
  
  try {
    studyTimeData.totalMinutes += durationMinutes;
    studyTimeData.lectureStats[lectureId] = (studyTimeData.lectureStats[lectureId] || 0) + durationMinutes;
    studyTimeData.sessions.push({
      lectureId,
      lectureTitle: session.lectureTitle,
      subjectName: session.subjectName,
      duration: durationMinutes,
      date: new Date().toISOString()
    });
    
    if (studyTimeData.sessions.length > 100) {
      studyTimeData.sessions = studyTimeData.sessions.slice(-100);
    }
    
    await updateDoc(doc(db, 'studyTime', currentUser.uid), {
      totalMinutes: studyTimeData.totalMinutes,
      sessions: studyTimeData.sessions,
      lectureStats: studyTimeData.lectureStats,
      updatedAt: serverTimestamp()
    });
    
    updateStudyTimeDisplay();
    localStorage.removeItem(sessionKey);
    
    console.log(`✅ Study session saved: ${durationMinutes} minutes for ${session.lectureTitle}`);
  } catch (e) {
    console.error('❌ Error saving study session:', e);
  }
}

export { startStudySession, endStudySession };

window.openStudyTimeModal = function() {
  const modal = document.getElementById('studyTimeModal');
  if (!modal) return;
  
  modal.classList.add('active');
  renderStudyTimeStats();
}

window.closeStudyTimeModal = function() {
  const modal = document.getElementById('studyTimeModal');
  if (modal) modal.classList.remove('active');
}

function renderStudyTimeStats() {
  const totalLecturesEl = document.getElementById('totalLecturesWatched');
  const studyDaysEl = document.getElementById('studyDaysCount');
  const studyStreakEl = document.getElementById('studyStreak');
  
  if (totalLecturesEl) {
    totalLecturesEl.textContent = Object.keys(studyTimeData.lectureStats).length;
  }
  
  if (studyDaysEl) {
    const uniqueDays = new Set(studyTimeData.sessions.map(s => s.date.split('T')[0]));
    studyDaysEl.textContent = uniqueDays.size;
  }
  
  if (studyStreakEl) {
    studyStreakEl.textContent = calculateStudyStreak();
  }
  
  const recordsContainer = document.getElementById('studyTimeRecords');
  if (!recordsContainer) return;
  
  if (studyTimeData.sessions.length === 0) {
    recordsContainer.innerHTML = `
      <div class="study-record-empty">
        <i class="fas fa-clock"></i>
        <p>لا توجد سجلات دراسة حتى الآن</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">ابدأ بفتح أي محاضرة وسيتم تسجيل وقتك تلقائياً</p>
      </div>
    `;
    return;
  }
  
  const lectureGroups = {};
  studyTimeData.sessions.forEach(session => {
    if (!lectureGroups[session.lectureId]) {
      lectureGroups[session.lectureId] = {
        lectureTitle: session.lectureTitle,
        subjectName: session.subjectName,
        totalMinutes: 0,
        sessionsCount: 0
      };
    }
    lectureGroups[session.lectureId].totalMinutes += session.duration;
    lectureGroups[session.lectureId].sessionsCount++;
  });
  
  const sortedLectures = Object.entries(lectureGroups)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
  
  recordsContainer.innerHTML = sortedLectures.map((item, index) => {
    const hours = Math.floor(item.totalMinutes / 60);
    const mins = item.totalMinutes % 60;
    const timeText = hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
    
    const iconColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const iconColor = iconColors[index % iconColors.length];
    
    return `
      <div class="study-record-item">
        <div class="study-record-info">
          <div class="study-record-icon" style="background: linear-gradient(135deg, ${iconColor}, ${adjustColor(iconColor, 20)});">
            <i class="fas fa-video"></i>
          </div>
          <div class="study-record-text">
            <p class="study-record-title">${item.lectureTitle}</p>
            <p class="study-record-subtitle">${item.subjectName} • ${item.sessionsCount} جلسة</p>
          </div>
        </div>
        <div class="study-record-time">${timeText}</div>
      </div>
    `;
  }).join('');
}

function calculateStudyStreak() {
  if (studyTimeData.sessions.length === 0) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const uniqueDays = [...new Set(studyTimeData.sessions.map(s => s.date.split('T')[0]))].sort().reverse();
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const day of uniqueDays) {
    const dayDate = new Date(day);
    const diffDays = Math.floor((currentDate - dayDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = dayDate;
    } else {
      break;
    }
  }
  
  return streak;
}

// ==========================================
// 📚 MODERN LIBRARY VIEW TOGGLE
// ==========================================

window.setLibraryView = function(view) {
  currentLibraryView = view;
  
  document.querySelectorAll('.view-control-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  const grid = document.getElementById('myLibraryGrid');
  if (grid) {
    grid.classList.toggle('list-view', view === 'list');
  }
  
  renderModernLibrary();
}

function renderModernLibrary() {
  const container = document.getElementById('myLibraryGrid');
  const lecturesCountEl = document.getElementById('myLibraryLecturesCount');
  if (!container) return;
  
  const subjectsWithLecs = {};
  Object.keys(lecturesDB).forEach(sid => {
    const userLecsInSubj = lecturesDB[sid].filter(l => userLectures.includes(l.id));
    if (userLecsInSubj.length > 0) subjectsWithLecs[sid] = userLecsInSubj;
  });
  
  const totalLectures = Object.values(subjectsWithLecs).reduce((sum, lecs) => sum + lecs.length, 0);
  if (lecturesCountEl) lecturesCountEl.textContent = totalLectures;
  
  if (currentLibraryView === 'grid') {
    container.innerHTML = Object.entries(subjectsWithLecs).map(([sid, lecs]) => {
      const subj = subjects[sid];
      if (!subj) return '';
      
      const total = lecturesDB[sid]?.length || 1;
      const prog = Math.round((lecs.length / total) * 100);
      const col = subj.color || '#16a34a';
      const icon = subj.icon || 'fa-book';
      
      return `
        <div class="modern-library-card" onclick="window.location.href='subject.html?s=${sid}'">
          <div class="modern-library-card-banner" style="background: linear-gradient(135deg, ${col}, ${adjustColor(col, 20)});">
            <i class="fas ${icon} modern-library-card-banner-icon"></i>
            <div class="modern-library-progress-overlay">
              <div class="modern-library-progress-bar" style="width: ${prog}%;"></div>
            </div>
          </div>
          <div class="modern-library-card-body">
            <h3 class="modern-library-card-title">${subj.nameAr || 'بدون عنوان'}</h3>
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
            <button class="modern-library-btn" onclick="event.stopPropagation(); window.location.href='subject.html?s=${sid}'">
              <i class="fas fa-arrow-left"></i> متابعة
            </button>
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = Object.entries(subjectsWithLecs).map(([sid, lecs]) => {
      const subj = subjects[sid];
      if (!subj) return '';
      
      const total = lecturesDB[sid]?.length || 1;
      const prog = Math.round((lecs.length / total) * 100);
      const col = subj.color || '#16a34a';
      const icon = subj.icon || 'fa-book';
      
      return `
        <div class="modern-library-card" onclick="window.location.href='subject.html?s=${sid}'">
          <div class="modern-library-card-banner" style="background: linear-gradient(135deg, ${col}, ${adjustColor(col, 20)});">
            <i class="fas ${icon} modern-library-card-banner-icon"></i>
          </div>
          <div class="modern-library-card-body" style="flex: 1;">
            <h3 class="modern-library-card-title">${subj.nameAr || 'بدون عنوان'}</h3>
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
            <button class="modern-library-btn" onclick="event.stopPropagation(); window.location.href='subject.html?s=${sid}'">
              <i class="fas fa-arrow-left"></i> متابعة
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ==========================================
// LOADING SKELETON
// ==========================================
function showLoadingSkeleton() {
  const grid = document.getElementById('subjectsGrid');
  if (!grid) return;
  
  grid.classList.add('loading');
  grid.innerHTML = Array(6).fill(`
    <div class="skeleton-card">
      <div class="skeleton-text title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text subtitle"></div>
    </div>
  `).join('');
}

function hideLoadingSkeleton() {
  const grid = document.getElementById('subjectsGrid');
  if (grid) grid.classList.remove('loading');
}

// ==========================================
// ✅ UPDATED: UPDATE HEADER (USERNAME + PHONE)
// ==========================================
function updateHeaderInfo() {
  const nameEl = document.getElementById('headerUserName');
  const infoEl = document.getElementById('headerUserUniversity'); // هنعيد استخدامه للـ username
  const avatarEl = document.getElementById('headerUserAvatar');

  // ✅ عرض الاسم أو username
  if (nameEl) nameEl.textContent = userData.name || userData.username || 'المستخدم';
  
  // ✅ عرض username + phone بدلاً من university
  if (infoEl) {
    const usernameText = userData.username ? `@${userData.username}` : '';
    const phoneText = userData.phone ? `📱 ${userData.phone}` : '';
    infoEl.textContent = usernameText || phoneText || 'غير محدد';
  }
  
  if (avatarEl) avatarEl.src = userData.avatar || generateAvatarUrl(currentUser.uid);

  document.querySelector('.user-section')?.classList.remove('loading');
}

// ==========================================
// LIBRARY COUNT ON HEADER
// ==========================================
function updateLibraryCount() {
  const cnt = document.getElementById('headerLibraryCount');
  if (cnt) cnt.textContent = userLectures.length;
}

// ==========================================
// UPDATE OVERALL PROGRESS VISUAL
// ==========================================
function updateOverallProgress() {
  const fill = document.getElementById('overallProgressFill');
  const circle = document.getElementById('userProgressCircle');
  const pctText = document.getElementById('userProgressPercentage');
  const progressTextEl = document.getElementById('progressText');

  const totalLectures = Object.values(lecturesDB).reduce((acc, arr) => acc + arr.length, 0);
  const owned = userLectures.length;
  const pct = totalLectures ? Math.round((owned / totalLectures) * 100) : 0;

  if (fill) fill.style.width = `${pct}%`;
  if (pctText) pctText.textContent = `${pct}%`;
  if (progressTextEl) progressTextEl.textContent = `${owned}/${totalLectures} محاضرة`;
  
  if (circle) {
    const circumference = 339.29;
    circle.style.strokeDashoffset = `${circumference - (circumference * pct) / 100}`;
  }
}

// ==========================================
// ✅ FIXED: INIT EVENT LISTENERS
// ==========================================
function initializeEventListeners() {
  const userSection = document.querySelector('.user-section');
  if (userSection) {
    userSection.addEventListener('click', (e) => {
      e.stopPropagation();
      window.openProfile();
    });
    userSection.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') window.openProfile();
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar-container')) {
      const searchResults = document.getElementById('searchResults');
      if (searchResults) searchResults.style.display = 'none';
    }
  });

  document.querySelector('.profile-modal-overlay')?.addEventListener('click', window.closeProfile);

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfile(e);
    });
  }

  const saveBtn = document.getElementById('saveProfileBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveProfile(e);
    });
  }

  document.querySelectorAll('.tab-btn-new').forEach(btn => {
    btn.addEventListener('click', () => window.switchTab(btn.dataset.tab));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') window.switchTab(btn.dataset.tab);
    });
  });

  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  document.querySelector('.study-time-modal-overlay')?.addEventListener('click', window.closeStudyTimeModal);
}

// ==========================================
// KEYBOARD SHORTCUTS HANDLER
// ==========================================
function handleKeyboardShortcuts(e) {
  if (e.key === 'Escape') {
    window.closeProfile();
    window.closeStudyTimeModal();
    window.closeAvatarSelector();
    document.querySelector('.custom-dialog-overlay')?.remove();
    const searchResults = document.getElementById('searchResults');
    if (searchResults) searchResults.style.display = 'none';
  }
  
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) searchInput.focus();
  }
}

// ==========================================
// ✅ ENHANCED: GLOBAL SEARCH
// ==========================================
window.handleGlobalSearch = function(query) {
  clearTimeout(searchTimeout);
  
  const searchClear = document.getElementById('searchClear');
  if (query.trim()) {
    if (searchClear) searchClear.style.display = 'flex';
  } else {
    if (searchClear) searchClear.style.display = 'none';
    const searchResults = document.getElementById('searchResults');
    if (searchResults) searchResults.style.display = 'none';
    return;
  }
  
  searchTimeout = setTimeout(() => {
    performSearch(query.trim());
  }, 300);
}

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
}

function performSearch(query) {
  const results = [];
  const searchResults = document.getElementById('searchResults');
  
  if (!query) {
    if (searchResults) searchResults.style.display = 'none';
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  
  Object.entries(subjects).forEach(([subjectId, subject]) => {
    if (subject.nameAr?.toLowerCase().includes(lowerQuery) ||
        subject.nameEn?.toLowerCase().includes(lowerQuery) ||
        subject.description?.toLowerCase().includes(lowerQuery)) {
      results.push({
        type: 'subject',
        id: subjectId,
        title: subject.nameAr,
        subtitle: `${lecturesDB[subjectId]?.length || 0} محاضرة`,
        color: subject.color || '#16a34a',
        icon: subject.icon || 'fa-book'
      });
    }
  });
  
  Object.entries(lecturesDB).forEach(([subjectId, lectures]) => {
    lectures.forEach(lecture => {
      if (lecture.title?.toLowerCase().includes(lowerQuery) ||
          lecture.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'lecture',
          id: lecture.id,
          title: lecture.title,
          subtitle: `في: ${subjects[subjectId]?.nameAr || 'بدون عنوان'}`,
          color: lecture.color,
          icon: lecture.icon || 'fa-video'
        });
      }
    });
  });
  
  renderSearchResults(results);
}

function renderSearchResults(results) {
  const container = document.getElementById('searchResults');
  
  if (results.length === 0) {
    container.innerHTML = `
      <div class="search-empty">
        <i class="fas fa-search"></i>
        <p>لم نجد نتائج</p>
      </div>
    `;
    container.style.display = 'block';
    return;
  }
  
  container.innerHTML = results.slice(0, 10).map(result => `
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

window.searchResultClick = function(type, id) {
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) searchInput.value = '';
  const searchResults = document.getElementById('searchResults');
  if (searchResults) searchResults.style.display = 'none';
  const searchClear = document.getElementById('searchClear');
  if (searchClear) searchClear.style.display = 'none';
  
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
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '22, 163, 74';
}

// ==========================================
// TABS MANAGEMENT
// ==========================================
window.switchTab = function(tabId) {
  currentTab = tabId;
  
  document.querySelectorAll('.tab-btn-new').forEach(b => {
    const isActive = b.dataset.tab === tabId;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  
  document.querySelectorAll('.tab-panel-new').forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
  
  if (tabId === 'myLibrary') {
    renderMyLibrary();
    renderModernLibrary();
    updateSmartGreeting();
  } else if (tabId === 'continueWatching') {
    loadContinueWatching();
  } else if (tabId === 'allSubjects') {
    renderSubjectsGrid();
  }
}

// ==========================================
// RENDER SUBJECTS GRID
// ==========================================
function renderSubjectsGrid() {
  const container = document.getElementById('subjectsGrid');
  if (!container) return;
  
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
      const protectionText = isProtected ? '<i class="fas fa-lock" aria-hidden="true"></i> محمية' : '<i class="fas fa-gift" aria-hidden="true"></i> مجانية';
      const buttonText = ownedLectures > 0 ? 'استمر' : 'ابدأ';

      return `
        <div class="subject-card" 
          onclick="window.location.href='subject.html?s=${subjectId}'"
          role="button"
          tabindex="0"
          aria-label="${subject.nameAr}: ${lectures.length} محاضرة"
          onkeydown="if(event.key==='Enter') window.location.href='subject.html?s=${subjectId}'">
          ${isProtected ? `<div class="status-icon-mini"><i class="fas fa-lock"></i></div>` : ''}
          
          <div class="subject-icon" style="background: linear-gradient(135deg, ${color}, ${adjustColor(color, 20)});">
            <i class="fas ${icon}" style="color:#${iconColor};"></i>
          </div>

          <h3 class="subject-title">${subject.nameAr || 'بدون عنوان'}</h3>
          <p class="subject-desc">${subject.description || ''}</p>

          <div class="subject-meta">
            <span><i class="fas fa-layer-group" aria-hidden="true"></i> ${lectures.length} محاضرة</span>
            <span>${protectionText}</span>
          </div>

          <div class="subject-progress" aria-hidden="true">
            <div class="subject-progress-fill" style="width:${progress}%;"></div>
          </div>

          <div class="subject-card-footer">
            <button class="capsule-btn-sm" onclick="event.stopPropagation(); window.location.href='subject.html?s=${subjectId}'" aria-label="ابدأ ${subject.nameAr}">
              <i class="fas fa-play" aria-hidden="true"></i> ${buttonText}
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

// ==========================================
// RENDER MY LIBRARY
// ==========================================
function renderMyLibrary() {
  const container = document.getElementById('myLibraryGrid');
  const emptyState = document.getElementById('libraryEmptyState');
  const myLibCount = document.getElementById('myLibraryCount');
  if (!container) return;

  if (userLectures.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (myLibCount) myLibCount.textContent = '0 مادة';
    container.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const subjectsWithLecs = {};
  Object.keys(lecturesDB).forEach(sid => {
    const userLecsInSubj = lecturesDB[sid].filter(l => userLectures.includes(l.id));
    if (userLecsInSubj.length > 0) subjectsWithLecs[sid] = userLecsInSubj;
  });

  const totalOwned = Object.values(subjectsWithLecs).reduce((sum, lecs) => sum + lecs.length, 0);
  if (myLibCount) myLibCount.textContent = `${Object.keys(subjectsWithLecs).length} مادة`;

  container.innerHTML = Object.entries(subjectsWithLecs).map(([sid, lecs]) => {
    const subj = subjects[sid];
    if (!subj) return '';

    const total = lecturesDB[sid]?.length || 1;
    const prog = (lecs.length / total) * 100;
    const col = subj.color || '#16a34a';
    const icon = subj.icon || 'fa-book';
    const iconColor = subj.customizations?.iconColor || 'ffffff';

    return `
      <div class="subject-card" 
        onclick="window.location.href='subject.html?s=${sid}'"
        role="button"
        tabindex="0"
        aria-label="${subj.nameAr}: ${lecs.length} من ${total} محاضرة"
        onkeydown="if(event.key==='Enter') window.location.href='subject.html?s=${sid}'">
        <div class="subject-icon" style="background: linear-gradient(135deg, ${col}, ${adjustColor(col, 20)});">
          <i class="fas ${icon}" style="color:#${iconColor};"></i>
        </div>

        <h3 class="subject-title">${subj.nameAr || 'بدون عنوان'}</h3>
        <p class="subject-desc">${lecs.length} من ${total} محاضرة</p>

        <div class="subject-meta">
          <span><i class="fas fa-check-double" aria-hidden="true"></i> مملوكة</span>
          <span>${prog.toFixed(0)}%</span>
        </div>

        <div class="subject-progress" aria-hidden="true">
          <div class="subject-progress-fill" style="width:${prog}%;"></div>
        </div>

        <div class="subject-card-footer">
          <button class="capsule-btn-sm" onclick="event.stopPropagation(); window.location.href='subject.html?s=${sid}'" aria-label="استمر ${subj.nameAr}">
            <i class="fas fa-play" aria-hidden="true"></i> استمر
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  renderModernLibrary();
}

// ==========================================
// CONTINUE WATCHING LIST
// ==========================================
async function loadContinueWatching() {
  const container = document.getElementById('continueWatchingGrid');
  const tabBtn = document.querySelector('[data-tab="continueWatching"]');
  const badge = document.getElementById('cwCount');
  if (!container || !tabBtn) return;

  let items = [];
  const owned = [];

  Object.keys(lecturesDB).forEach(sid => {
    lecturesDB[sid].forEach(l => {
      if (userLectures.includes(l.id)) {
        owned.push({ ...l, subjectName: subjects[sid]?.nameAr || subjects[sid]?.name || sid, subjectId: sid });
      }
    });
  });

  items = owned.slice(-5).reverse();
  continueItems = items;

  if (items.length === 0) {
    tabBtn.style.display = 'none';
    if (badge) badge.style.display = 'none';
    container.innerHTML = '';
    updateSmartGreeting();
    return;
  }

  tabBtn.style.display = 'flex';
  if (badge) { badge.textContent = items.length; badge.style.display = 'inline-block'; }

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
          <i class="fas ${icon}" style="color:#${iconColor};"></i>
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
// SMART GREETING
// ==========================================
function updateSmartGreeting() {
  const box = document.getElementById('smartGreeting');
  const head = document.getElementById('greetHeadline');
  const sub = document.getElementById('greetSub');
  const btn = document.getElementById('greetContinueBtn');
  if (!box || !head || !sub || !btn) return;

  // ✅ استخدام name أو username
  const firstName = (userData?.name || userData?.username || 'صديقي').split(' ')[0];
  const h = new Date().getHours();
  const timeText = h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور';
  head.textContent = `${timeText} ${firstName}`;

  const totalLectures = Object.values(lecturesDB).reduce((acc, arr) => acc + arr.length, 0);
  const owned = userLectures.length;
  const ownedPct = totalLectures ? Math.round((owned / totalLectures) * 100) : 0;

  if (continueItems.length) {
    sub.textContent = 'نكمل من حيث توقفت؟';
    const last = continueItems[0];
    btn.style.display = 'inline-flex';
    btn.innerHTML = `<i class="fas fa-play"></i> ${last.title.substring(0, 20)}`;
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
// ✅ ENHANCED: ADD TO LIBRARY (WITH ROLLBACK)
// ==========================================
window.addToLibrary = async function(lectureId) {
  if (userLectures.includes(lectureId)) {
    showToast('أنت تملك هذه المحاضرة', 'info');
    return;
  }

  const originalLectures = [...userLectures];

  try {
    userLectures = [...userLectures, lectureId];
    updateLibraryCount();
    updateOverallProgress();

    await updateDoc(doc(db, 'users', currentUser.uid), { 
      lectures: arrayUnion(lectureId), 
      updatedAt: serverTimestamp() 
    });

    showToast('✅ تمت الإضافة بنجاح', 'success');

    const sid = Object.keys(lecturesDB).find(id => lecturesDB[id].some(l => l.id === lectureId));
    if (sid) window.location.href = `subject.html?s=${sid}`;
  } catch (e) {
    userLectures = originalLectures;
    updateLibraryCount();
    updateOverallProgress();
    
    console.error('❌ خطأ الإضافة:', e);
    showToast('❌ خطأ في الإضافة، حاول مرة أخرى', 'error');
  }
}

// ==========================================
// ADD MULTIPLE LECTURES TO LIBRARY
// ==========================================
window.addMultipleLecturesToLibrary = async function(lectureIds = []) {
  try {
    if (!lectureIds || lectureIds.length === 0) return;

    const uniqueIds = lectureIds.filter(id => !userLectures.includes(id));
    if (uniqueIds.length === 0) {
      showToast('أنت تمتلك هذه المحاضرات بالفعل', 'info');
      return;
    }

    const updatedLectures = [...userLectures, ...uniqueIds];
    await updateDoc(doc(db, 'users', currentUser.uid), { 
      lectures: updatedLectures, 
      updatedAt: serverTimestamp() 
    });

    userLectures = updatedLectures;
    updateLibraryCount();
    updateOverallProgress();
    renderMyLibrary();
    showToast(`✅ تمت إضافة ${uniqueIds.length} محاضرة بنجاح`, 'success');
  } catch (e) {
    console.error(e);
    showToast('❌ خطأ في الإضافة', 'error');
  }
}

// ==========================================
// SHOW ACTIVATION DIALOG
// ==========================================
window.showActivationDialog = function(lectureId) {
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog-overlay';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.innerHTML = `
    <div class="capsule-dialog">
      <div class="dialog-header">
        <div class="dialog-icon-mini">
          <i class="fas fa-key"></i>
        </div>
        <div>
          <h3 class="dialog-title">تفعيل المحاضرة</h3>
          <p class="dialog-message">أدخل كود التفعيل (مثال: ATHR-ABC12345)</p>
        </div>
      </div>
      <input 
        type="text" 
        class="dialog-input" 
        id="activationCodeInput" 
        placeholder="الكود" 
        style="direction: ltr; text-transform: uppercase;"
        aria-label="إدخال كود التفعيل"
        autocomplete="off">
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-primary" onclick="window.confirmActivation('${lectureId}', this)" aria-label="تفعيل الكود">
          <i class="fas fa-check"></i> تفعيل
        </button>
        <button class="dialog-btn dialog-btn-secondary" onclick="this.closest('.custom-dialog-overlay').remove()" aria-label="إلغاء">
          <i class="fas fa-times"></i> إلغاء
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  dialog.style.display = 'flex';
  const input = document.getElementById('activationCodeInput');
  if (input) {
    input.focus();
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') window.confirmActivation(lectureId, dialog.querySelector('.dialog-btn-primary'));
    });
  }
}

// ==========================================
// VALIDATION HELPERS
// ==========================================
function showValidationError(input, message) {
  if (!input) return;
  input.classList.add('error');
  input.style.borderColor = '#ef4444';
  input.style.background = 'rgba(239, 68, 68, 0.1)';
  let errorMsg = input.parentElement.querySelector('.error-message');
  if (!errorMsg) {
    errorMsg = document.createElement('p');
    errorMsg.className = 'error-message';
    errorMsg.style.cssText = 'color: #ef4444; font-size: 0.85rem; margin-top: 6px; font-weight: 600; display: flex; align-items: center; gap: 6px;';
    input.parentElement.appendChild(errorMsg);
  }
  errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  errorMsg.style.display = 'block';
}

function clearValidationError(input) {
  if (!input) return;
  input.classList.remove('error');
  input.style.borderColor = 'var(--glass-border)';
  input.style.background = 'rgba(255, 255, 255, 0.5)';
  const errorMsg = input.parentElement.querySelector('.error-message');
  if (errorMsg) errorMsg.style.display = 'none';
}

// ==========================================
// CONFIRM ACTIVATION
// ==========================================
window.confirmActivation = async function(lectureId, btnEl) {
  const codeInput = document.getElementById('activationCodeInput');
  const code = codeInput?.value.trim().toUpperCase() || '';

  if (!code) {
    showValidationError(codeInput, 'يرجى إدخال الكود');
    return;
  }

  if (!/^ATHR-[A-Z0-9]{8}$/.test(code)) {
    showValidationError(codeInput, '❌ صيغة الكود خاطئة (مثال: ATHR-ABC12345)');
    return;
  }

  try {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري...';
    }

    const codeSnap = await getDocs(query(
      collection(db, 'activationCodes'),
      where('code', '==', code),
      limit(1)
    ));

    if (codeSnap.empty) { 
      showValidationError(codeInput, '❌ كود غير موجود');
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل';
      }
      return; 
    }

    const codeData = codeSnap.docs[0].data();
    const codeDocId = codeSnap.docs[0].id;
    const now = new Date();
    const isExpired = codeData.expiresAt && codeData.expiresAt.toDate() < now;
    const isMaxed = codeData.maxUses > 0 && codeData.usesCount >= codeData.maxUses;

    if (!codeData.isActive) {
      showValidationError(codeInput, '⚠️ الكود معطّل');
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل'; }
      return;
    }
    
    if (isExpired) {
      showValidationError(codeInput, '⏰ انتهت صلاحية الكود');
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل'; }
      return;
    }
    
    if (isMaxed) {
      showValidationError(codeInput, '🚫 انتهت عدد الاستخدامات');
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<i class="fas fa-check"></i> تفعيل'; }
      return;
    }

    let lecturestoAdd = [];
    if (codeData.targetType === 'lecture') {
      lecturestoAdd = codeData.targetIds || [];
    } else if (codeData.targetType === 'subject') {
      const subjectId = codeData.targetIds?.[0];
      if (subjectId) {
        lecturestoAdd = allLectures.filter(l => l.subject === subjectId).map(l => l.id);
      }
    } else if (codeData.targetType === 'bundle') {
      const subjectIds = codeData.targetIds || [];
      lecturestoAdd = allLectures.filter(l => subjectIds.includes(l.subject)).map(l => l.id);
    }

    await window.addMultipleLecturesToLibrary(lecturestoAdd);

    await updateDoc(doc(db, 'activationCodes', codeDocId), {
      usesCount: increment(1),
      lastUsedAt: serverTimestamp(),
      lastUsedBy: currentUser.uid
    });

    document.querySelector('.custom-dialog-overlay')?.remove();
    showToast('✅ تم التفعيل بنجاح!', 'success');
    clearValidationError(codeInput);
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
}

// ==========================================
// OPEN LECTURE
// ==========================================
window.openLecture = function(url) {
  if (!url || url === '#') { showToast('المحاضرة قيد التطوير', 'info'); return; }
  window.open(url, '_blank');
}

// ==========================================
// ✅ UPDATED: PROFILE MODAL (USERNAME + PHONE)
// ==========================================
window.openProfile = function() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;

  modal.classList.add('active');
  
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const usernameEl = document.getElementById('profileUsername');
  const phoneEl = document.getElementById('profilePhone');
  const imgEl = document.getElementById('profileAvatarImg');

  if (nameEl) nameEl.value = userData.name || '';
  if (emailEl) emailEl.value = currentUser.email || '';
  if (usernameEl) usernameEl.value = userData.username || '';
  if (phoneEl) phoneEl.value = userData.phone || '';
  if (imgEl) imgEl.src = userData.avatar || generateAvatarUrl(currentUser.uid);

  window.loadAvatarSelector();
}

window.closeProfile = function() {
  document.getElementById('profileModal')?.classList.remove('active');
}

window.backToLibrary = function() {
  const lecturesView = document.getElementById('lecturesView');
  if (lecturesView) lecturesView.style.display = 'none';
  window.switchTab('allSubjects');
}

// ==========================================
// ✅ UPDATED: SAVE PROFILE (USERNAME + PHONE)
// ==========================================
async function saveProfile(e) {
  if (e) e.preventDefault();
  
  try {
    const nameEl = document.getElementById('profileName');
    const phoneEl = document.getElementById('profilePhone');
    const passEl = document.getElementById('profilePassword');
    const btnEl = document.getElementById('saveProfileBtn');

    const name = nameEl?.value.trim() || '';
    const phone = phoneEl?.value.trim() || '';
    const newPass = passEl?.value.trim() || '';

    // ✅ Validate phone if provided
    if (phone && !/^(010|011|012|015)[0-9]{8}$/.test(phone)) {
      showToast('❌ رقم الهاتف غير صحيح', 'error');
      phoneEl.focus();
      return;
    }

    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    }

    const updateData = { updatedAt: serverTimestamp() };
    
    // ✅ Only update fields that are provided
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    
    // ✅ Save new avatar if changed
    if (selectedAvatarConfig?.avatar) {
      updateData.avatar = selectedAvatarConfig.avatar;
      if (selectedAvatarConfig.seed) updateData.avatarSeed = selectedAvatarConfig.seed;
      if (selectedAvatarConfig.params) updateData.avatarParams = selectedAvatarConfig.params;
    }

    await updateDoc(doc(db, 'users', currentUser.uid), updateData);
    
    // ✅ Update password if provided
    if (newPass) {
      try {
        await updatePassword(currentUser, newPass);
        showToast('✅ تم تحديث كلمة المرور', 'success');
      } catch (passErr) {
        console.error('❌ خطأ كلمة المرور:', passErr);
        showToast('⚠️ فشل تحديث كلمة المرور (سجل دخول مجدداً)', 'error');
      }
    }

    userData = { ...userData, ...updateData };
    updateHeaderInfo();
    showToast('✅ تم الحفظ بنجاح', 'success');
    window.closeProfile();

    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check-circle"></i> حفظ';
    }
  } catch (e) {
    console.error('❌ خطأ الحفظ:', e);
    showToast('❌ خطأ في الحفظ', 'error');
    const btnEl = document.getElementById('saveProfileBtn');
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-check-circle"></i> حفظ';
    }
  }
}

// ==========================================
// ✅ ENHANCED: AVATAR SELECTOR
// ==========================================
window.showAvatarSelector = function() {
  const selector = document.getElementById('avatarSelector');
  if (selector) selector.style.display = 'block';
}

window.closeAvatarSelector = function() {
  const selector = document.getElementById('avatarSelector');
  if (selector) selector.style.display = 'none';
  tempAvatarConfig = null;
}

window.loadAvatarSelector = function() {
  const grid = document.querySelector('.avatars-grid');
  if (!grid) return;

  grid.innerHTML = AVATAR_CONFIGS.slice(0, 6).map((config, i) => {
    const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(config.seed)}&${config.params}`;
    
    return `
      <div class="avatar-option" 
        onclick="window.selectDiceAvatar('${config.seed}', '${config.params.replace(/'/g, "&#39;")}')" 
        style="border:2px solid var(--glass-border);border-radius:var(--radius-md);overflow:hidden;cursor:pointer; transition: transform 0.2s; position: relative;" 
        tabindex="0" 
        onmouseover="this.style.transform='scale(1.05)'" 
        onmouseout="this.style.transform='scale(1)'"
        onkeydown="if(event.key==='Enter') window.selectDiceAvatar('${config.seed}', '${config.params.replace(/'/g, "&#39;")}')">
        <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover" alt="avatar ${i+1}">
      </div>
    `;
  }).join('');
}

window.selectDiceAvatar = function(seed, params) {
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&${params}`;
  
  tempAvatarConfig = { 
    avatar: avatarUrl,
    seed: seed,
    params: params 
  };
  
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.style.borderColor = 'var(--glass-border)';
    opt.style.boxShadow = 'none';
  });
  
  event.currentTarget.style.borderColor = '#16a34a';
  event.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.2)';
}

window.confirmAvatarSelection = function() {
  if (tempAvatarConfig) {
    selectedAvatarConfig = tempAvatarConfig;
    const imgEl = document.getElementById('profileAvatarImg');
    if (imgEl) imgEl.src = selectedAvatarConfig.avatar;
    showToast('✅ تم اختيار الصورة', 'success');
  }
  window.closeAvatarSelector();
}

window.cancelAvatarSelection = function() {
  tempAvatarConfig = null;
  window.closeAvatarSelector();
}

// ==========================================
// LOGOUT
// ==========================================
window.logout = async function() {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (e) {
    console.error('❌ خطأ الخروج:', e);
    showToast('❌ خطأ في تسجيل الخروج', 'error');
  }
}

// ==========================================
// UTILITIES
// ==========================================
function adjustColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toastContainer');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    min-width: 320px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 0.95rem;
    box-shadow: var(--shadow-lg);
    animation: slideInRight 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  `;
  
  toast.innerHTML = `
    <span>${message}</span>
    ${duration > 0 ? `<button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;padding:0;"><i class="fas fa-times"></i></button>` : ''}
  `;
  
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  
  container.appendChild(toast);
  
  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, duration);
  }
  
  return toast;
}

window.showToast = showToast;

console.log('✅ Library.js V18.0 ULTIMATE Ready - Username + Phone Support (No University)');
