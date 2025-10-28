// ==========================================
// ✅ LIBRARY.JS V9.0 - OPTIMIZED & COMPLETE
// Profile Modal + AI Recommendations + Tabs + Avatar Selector
// ==========================================

import { auth, db, AVATAR_CONFIGS, AVATAR_STYLE, AVATAR_API_VERSION, generateAvatarUrl } from './app.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ==========================================
// 📌 STATE MANAGEMENT
// ==========================================
let currentUser = null;
let userData = null;
let lecturesDB = {};
let userLectures = [];
let subjects = {};
let currentTab = 'all';
let eventListeners = [];

// ==========================================
// 💾 CACHING CONFIGURATION
// ==========================================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let subjectsCache = { data: null, timestamp: null };
let lecturesCache = { data: null, timestamp: null };

// Cache Helper
function shouldRefreshCache(cacheObj) {
  return !cacheObj.data || 
         !cacheObj.timestamp || 
         (Date.now() - cacheObj.timestamp) > CACHE_DURATION;
}

// ==========================================
// 🔐 AUTH STATE LISTENER
// ==========================================
onAuthStateChanged(auth, async (user) => {
  console.log('🔐 Auth state changed:', user?.email || 'No user');
  
  if (user) {
    currentUser = user;
    try {
      await loadUserData();
      await loadSubjects();
      updateUI();
    } catch (error) {
      console.error('❌ Initialization error:', error);
      showToast('خطأ في تحميل البيانات', 'error');
    }
  } else {
    console.log('🚪 No user, redirecting to login...');
    window.location.href = 'login.html';
  }
});

// ==========================================
// 👤 LOAD USER DATA (WITH ERROR HANDLING)
// ==========================================
async function loadUserData() {
  if (!currentUser) {
    throw new Error('No current user');
  }
  
  try {
    console.log('👤 Loading user data for:', currentUser.uid);
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (userDoc?.exists()) {
      userData = { 
        ...userDoc.data(), 
        uid: currentUser.uid 
      };
      console.log('✅ User data loaded:', userData.name);
      
      // Load user library
      const libraryDoc = await getDoc(doc(db, 'userLibrary', currentUser.uid));
      if (libraryDoc?.exists()) {
        userLectures = libraryDoc.data().lectures || [];
        console.log('📚 User library loaded:', userLectures.length, 'lectures');
      } else {
        console.log('📚 No library found, creating empty one...');
        userLectures = [];
        // Create empty library
        await setDoc(doc(db, 'userLibrary', currentUser.uid), {
          uid: currentUser.uid,
          lectures: [],
          activatedAt: {},
          createdAt: serverTimestamp()
        });
      }
      
    } else {
      console.warn('⚠️ User document not found, creating default...');
      
      userData = {
        uid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.displayName || 'مستخدم جديد',
        university: 'جامعة دمنهور',
        faculty: '',
        level: '',
        avatarSeed: 'User',
        avatarParams: '',
        avatarStyle: AVATAR_STYLE,
        avatar: generateAvatarUrl('User', ''),
        totalStudyTime: 0,
        completedLectures: 0,
        role: 'student',
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', currentUser.uid), userData);
      
      // Create empty library
      await setDoc(doc(db, 'userLibrary', currentUser.uid), {
        uid: currentUser.uid,
        lectures: [],
        activatedAt: {},
        createdAt: serverTimestamp()
      });
    }
    
    // Remove loading state
    const userSection = document.querySelector('.user-section');
    userSection?.classList.remove('loading');
    
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    showToast('خطأ في تحميل بيانات المستخدم', 'error');
    throw error;
  }
}

// ==========================================
// 📚 LOAD SUBJECTS (WITH CACHING)
// ==========================================
async function loadSubjects() {
  try {
    console.log('📚 Loading subjects...');
    
    // Check cache
    if (!shouldRefreshCache(subjectsCache)) {
      console.log('✅ Using cached subjects');
      subjects = subjectsCache.data;
      await loadLectures();
      return;
    }
    
    const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
    subjects = {};
    
    subjectsSnapshot.forEach(docSnap => {
      subjects[docSnap.id] = { 
        id: docSnap.id, 
        ...docSnap.data() 
      };
    });
    
    // Update cache
    subjectsCache = {
      data: subjects,
      timestamp: Date.now()
    };
    
    console.log('✅ Subjects loaded:', Object.keys(subjects).length);
    await loadLectures();
    
  } catch (error) {
    console.error('❌ Error loading subjects:', error);
    showToast('خطأ في تحميل المواد', 'error');
    throw error;
  }
}

// ==========================================
// 🎓 LOAD LECTURES (WITH CACHING)
// ==========================================
async function loadLectures() {
  try {
    console.log('🎓 Loading lectures...');
    
    // Check cache
    if (!shouldRefreshCache(lecturesCache)) {
      console.log('✅ Using cached lectures');
      lecturesDB = lecturesCache.data;
      renderSubjects();
      return;
    }
    
    lecturesDB = {};
    const subjectIds = Object.keys(subjects);
    
    if (subjectIds.length === 0) {
      console.warn('⚠️ No subjects found');
      renderSubjects();
      return;
    }
    
    // Load lectures for each subject
    await Promise.all(
      subjectIds.map(async (subjectId) => {
        try {
          const lecturesSnapshot = await getDocs(
            collection(db, 'subjects', subjectId, 'lectures')
          );
          
          const subjectLectures = [];
          lecturesSnapshot.forEach(docSnap => {
            subjectLectures.push({ 
              id: docSnap.id, 
              ...docSnap.data() 
            });
          });
          
          lecturesDB[subjectId] = subjectLectures;
        } catch (error) {
          console.error(`❌ Error loading lectures for ${subjectId}:`, error);
          lecturesDB[subjectId] = [];
        }
      })
    );
    
    // Update cache
    lecturesCache = {
      data: lecturesDB,
      timestamp: Date.now()
    };
    
    console.log('✅ Lectures loaded for', Object.keys(lecturesDB).length, 'subjects');
    renderSubjects();
    
  } catch (error) {
    console.error('❌ Error loading lectures:', error);
    showToast('خطأ في تحميل المحاضرات', 'error');
    lecturesDB = {};
    renderSubjects();
  }
}

// ==========================================
// 🎨 RENDER SUBJECTS (OPTIMIZED)
// ==========================================
function renderSubjects() {
  const grid = document.getElementById('subjectsGrid');
  const skeletonGrid = document.getElementById('skeletonSubjects');
  
  if (!grid) {
    console.warn('⚠️ Subjects grid not found');
    return;
  }
  
  // Hide skeleton
  skeletonGrid?.classList.add('hidden');
  
  // Show real grid
  grid.classList.remove('hidden');
  
  // Check current tab
  if (currentTab === 'library') {
    renderMyLibrary();
    return;
  }
  
  // Render all subjects
  const subjectsList = Object.values(subjects);
  
  if (subjectsList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-book-open"></i>
        <h3>لا توجد مواد متاحة</h3>
        <p>سيتم إضافة المواد قريباً</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = subjectsList
    .map(subject => renderSubjectCard(subject))
    .join('');
}

// ==========================================
// 📋 RENDER SUBJECT CARD
// ==========================================
function renderSubjectCard(subject) {
  const lectures = lecturesDB[subject.id] || [];
  const isActivated = userLectures.some(lec => lec.subjectId === subject.id);
  const lectureCount = lectures.length;
  
  return `
    <div 
      class="subject-capsule ${isActivated ? '' : 'locked'}" 
      onclick="showSubjectLectures('${subject.id}')"
      role="button"
      tabindex="0"
    >
      ${isActivated 
        ? '<div class="badge badge-activated"><i class="fas fa-check"></i> مُفعّلة</div>' 
        : '<div class="lock-badge"><i class="fas fa-lock"></i> مُغلقة</div>'
      }
      
      <div 
        class="subject-icon-container" 
        style="background: ${subject.color || 'linear-gradient(135deg, #10b981, #059669)'};"
      >
        <i class="${subject.icon || 'fas fa-book'}"></i>
      </div>
      
      <h3 class="subject-title">${subject.name || 'مادة'}</h3>
      <p class="subject-description">${subject.description || 'وصف المادة'}</p>
      
      <div class="lecture-count">
        <i class="fas fa-video"></i>
        <span>${lectureCount} محاضرة</span>
      </div>
    </div>
  `;
}

// ==========================================
// 📑 RENDER MY LIBRARY (OPTIMIZED)
// ==========================================
function renderMyLibrary() {
  const grid = document.getElementById('subjectsGrid');
  if (!grid) return;
  
  grid.classList.remove('hidden');
  
  // Get unique subject IDs from user's lectures
  const userSubjectIds = [...new Set(userLectures.map(lec => lec.subjectId))];
  const mySubjects = userSubjectIds
    .map(id => subjects[id])
    .filter(Boolean);
  
  if (mySubjects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-book-open"></i>
        <h3>مكتبتك فارغة</h3>
        <p>لم تقم بتفعيل أي مواد بعد</p>
        <button 
          onclick="switchTab('all')" 
          class="btn-capsule mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold"
          style="
            margin-top: 20px; 
            padding: 12px 24px; 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            border: none; 
            border-radius: 12px; 
            font-weight: 700; 
            cursor: pointer; 
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.3s;
          "
        >
          <i class="fas fa-search"></i> تصفح المواد المتاحة
        </button>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = mySubjects
    .map(subject => renderLibrarySubjectCard(subject))
    .join('');
}

// ==========================================
// 📋 RENDER LIBRARY SUBJECT CARD
// ==========================================
function renderLibrarySubjectCard(subject) {
  const lectures = lecturesDB[subject.id] || [];
  const userSubjectLectures = userLectures.filter(lec => lec.subjectId === subject.id);
  const lectureCount = lectures.length;
  const activatedCount = userSubjectLectures.length;
  const progress = lectureCount > 0 
    ? Math.round((activatedCount / lectureCount) * 100) 
    : 0;
  
  return `
    <div 
      class="subject-capsule" 
      onclick="showSubjectLectures('${subject.id}')"
      role="button"
      tabindex="0"
    >
      <div class="badge badge-activated"><i class="fas fa-check"></i> مُفعّلة</div>
      
      <div 
        class="subject-icon-container" 
        style="background: ${subject.color || 'linear-gradient(135deg, #10b981, #059669)'};"
      >
        <i class="${subject.icon || 'fas fa-book'}"></i>
      </div>
      
      <h3 class="subject-title">${subject.name || 'مادة'}</h3>
      <p class="subject-description">${subject.description || 'وصف المادة'}</p>
      
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          style="width: ${progress}%; background: linear-gradient(to right, #10b981, #059669);"
        ></div>
      </div>
      <span class="progress-text">${activatedCount} من ${lectureCount} محاضرة</span>
      
      <div class="lecture-count" style="margin-top: 15px;">
        <i class="fas fa-video"></i>
        <span>${lectureCount} محاضرة</span>
      </div>
    </div>
  `;
}
// ==========================================
// 📊 UPDATE UI (OPTIMIZED)
// ==========================================
function updateUI() {
  if (!userData) {
    console.warn('⚠️ No user data available');
    return;
  }
  
  try {
    // Update header
    const avatarUrl = userData.avatar || 
                      generateAvatarUrl(userData.avatarSeed || 'User', userData.avatarParams || '');
    
    const headerAvatar = document.getElementById('headerUserAvatar');
    const headerName = document.getElementById('headerUserName');
    const headerUniversity = document.getElementById('headerUserUniversity');
    
    if (headerAvatar) headerAvatar.src = avatarUrl;
    if (headerName) headerName.textContent = userData.name || 'مستخدم';
    if (headerUniversity) headerUniversity.textContent = userData.university || 'جامعة دمنهور';
    
    // Update stats
    updateStats();
    
    // Load recommendations
    loadRecommendations();
    
    // Load daily tip
    loadDailyTip();
    
    console.log('✅ UI updated successfully');
  } catch (error) {
    console.error('❌ Error updating UI:', error);
  }
}

// ==========================================
// 📈 UPDATE STATS (OPTIMIZED)
// ==========================================
function updateStats() {
  try {
    // Hide skeleton
    const skeleton1 = document.getElementById('skeletonStats1');
    const skeleton2 = document.getElementById('skeletonStats2');
    skeleton1?.classList.add('hidden');
    skeleton2?.classList.add('hidden');
    
    // Show real stats
    const progressCard = document.getElementById('progressCard');
    const studyTimeCard = document.getElementById('studyTimeCard');
    progressCard?.classList.remove('hidden');
    studyTimeCard?.classList.remove('hidden');
    
    // Calculate progress
    const totalSubjects = Object.keys(subjects).length;
    const activatedSubjects = [...new Set(userLectures.map(lec => lec.subjectId))].length;
    const progress = totalSubjects > 0 
      ? Math.round((activatedSubjects / totalSubjects) * 100) 
      : 0;
    
    // Update progress text
    const progressText = document.getElementById('levelProgressText');
    if (progressText) {
      progressText.textContent = `${progress}%`;
    }
    
    // Update progress circle
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (progress / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }
    
    // Update study time
    const studyTime = userData.totalStudyTime || 0;
    const hours = Math.floor(studyTime / 60);
    const minutes = studyTime % 60;
    
    const studyTimeDisplay = document.getElementById('studyTimeDisplay');
    if (studyTimeDisplay) {
      if (hours > 0) {
        studyTimeDisplay.textContent = `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ''}`;
      } else {
        studyTimeDisplay.textContent = `${minutes} دقيقة`;
      }
    }
  } catch (error) {
    console.error('❌ Error updating stats:', error);
  }
}

// ==========================================
// 🤖 AI RECOMMENDATIONS (OPTIMIZED)
// ==========================================
async function loadRecommendations() {
  const container = document.getElementById('recommendationsContainer');
  const skeleton = document.getElementById('skeletonRecommendations');
  
  if (!container) {
    console.warn('⚠️ Recommendations container not found');
    return;
  }
  
  try {
    console.log('🤖 Generating AI recommendations...');
    
    // Get user's activated subjects
    const userSubjectIds = [...new Set(userLectures.map(lec => lec.subjectId))];
    const userSubjects = userSubjectIds
      .map(id => subjects[id])
      .filter(Boolean);
    
    // Get all available subjects
    const availableSubjects = Object.values(subjects);
    
    // Generate recommendations
    const recommendations = generateSmartRecommendations(userSubjects, availableSubjects);
    
    // Hide skeleton
    skeleton?.classList.add('hidden');
    
    // Show container
    container.classList.remove('hidden');
    
    if (recommendations.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-lightbulb"></i>
          <h3>لا توجد توصيات حالياً</h3>
          <p>ابدأ بتفعيل بعض المواد لنعطيك توصيات مخصصة</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = recommendations
      .map(rec => renderRecommendationCard(rec))
      .join('');
    
    console.log('✅ Recommendations loaded:', recommendations.length);
    
  } catch (error) {
    console.error('❌ Error loading recommendations:', error);
    skeleton?.classList.add('hidden');
    container?.classList.remove('hidden');
    if (container) {
      container.innerHTML = `
        <p style="text-align: center; color: #64748b; grid-column: 1 / -1;">
          خطأ في تحميل التوصيات
        </p>
      `;
    }
  }
}

// ==========================================
// 📋 RENDER RECOMMENDATION CARD
// ==========================================
function renderRecommendationCard(rec) {
  const defaultThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
  
  return `
    <div 
      class="recommendation-card" 
      onclick="showSubjectLectures('${rec.id}')"
      role="button"
      tabindex="0"
    >
      <div 
        class="rec-thumbnail" 
        style="background-image: url('${rec.thumbnail || defaultThumbnail}');"
      ></div>
      <h3>${rec.name}</h3>
      <div class="rec-reason">
        <strong>لماذا؟</strong> ${rec.reason}
      </div>
      <span class="rec-subject">
        <i class="fas fa-star"></i>
        ${rec.category || 'موصى به'}
      </span>
    </div>
  `;
}

// ==========================================
// 🧠 GENERATE SMART RECOMMENDATIONS
// ==========================================
function generateSmartRecommendations(userSubjects, allSubjects) {
  const recommendations = [];
  
  // If no subjects activated, recommend popular ones
  if (userSubjects.length === 0) {
    return allSubjects
      .slice(0, 3)
      .map(subject => ({
        ...subject,
        reason: 'مادة شائعة بين الطلاب، ابدأ رحلتك التعليمية معنا!',
        category: 'مواد شائعة',
        score: 5
      }));
  }
  
  // Get activated subject IDs
  const userSubjectIds = userSubjects.map(s => s.id);
  
  // Find non-activated subjects
  const notActivated = allSubjects.filter(s => !userSubjectIds.includes(s.id));
  
  // Get user's categories
  const userCategories = [...new Set(
    userSubjects
      .map(s => s.category)
      .filter(Boolean)
  )];
  
  // Score each non-activated subject
  for (const subject of notActivated) {
    let reason = '';
    let score = 0;
    
    // Same category bonus
    if (subject.category && userCategories.includes(subject.category)) {
      reason = `لأنك مهتم بـ ${subject.category}، هذه المادة ستكمل معرفتك`;
      score += 3;
    }
    
    // Prerequisites check
    if (subject.prerequisites?.length > 0) {
      const completedPrereqs = subject.prerequisites.filter(req => 
        userSubjectIds.includes(req)
      );
      if (completedPrereqs.length > 0) {
        reason = 'أكملت المتطلبات الأساسية لهذه المادة';
        score += 2;
      }
    }
    
    // Popularity bonus
    if (subject.popularity && subject.popularity > 80) {
      if (!reason) {
        reason = 'مادة شائعة بين الطلاب في نفس مجالك';
      }
      score += 1;
    }
    
    // Default reason
    if (!reason) {
      reason = 'مادة مميزة تساعدك على توسيع معرفتك';
      score += 1;
    }
    
    if (score > 0) {
      recommendations.push({
        ...subject,
        reason,
        score,
        category: subject.category || 'موصى به'
      });
    }
  }
  
  // Sort by score and return top 3
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ==========================================
// 💡 DAILY TIP
// ==========================================
function loadDailyTip() {
  const tipElement = document.getElementById('dailyTip');
  if (!tipElement) return;
  
  const tips = [
    'حاول مراجعة أصعب درس من الأسبوع الماضي لتعزيز الذاكرة طويلة المدى 🧠',
    'خصص 25 دقيقة للدراسة المركزة، ثم استرح 5 دقائق (تقنية بومودورو) ⏱️',
    'اكتب ملخصاً بيدك لما تعلمته اليوم، الكتابة تقوي الذاكرة ✍️',
    'علّم شخصاً آخر ما تعلمته، التعليم أفضل طريقة للفهم العميق 👥',
    'نم جيداً! النوم الكافي ضروري لتثبيت المعلومات في الذاكرة 😴',
    'راجع ملاحظاتك خلال 24 ساعة من الدرس لزيادة الاحتفاظ بالمعلومات 📝',
    'حل أسئلة تطبيقية بدل الاكتفاء بالقراءة، التطبيق يعزز الفهم 💪',
    'خذ استراحات منتظمة، الدماغ يحتاج وقت للراحة والمعالجة ☕'
  ];
  
  // Get tip based on day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const tip = tips[dayOfYear % tips.length];
  tipElement.textContent = tip;
}

// ==========================================
// 📑 TABS FUNCTIONALITY
// ==========================================
window.switchTab = function(tabName) {
  if (currentTab === tabName) return;
  
  currentTab = tabName;
  
  const allTab = document.getElementById('allSubjectsTab');
  const libraryTab = document.getElementById('myLibraryTab');
  
  if (!allTab || !libraryTab) return;
  
  // Active classes
  const activeClasses = ['border-green-500', 'text-green-600', 'dark:text-green-400', 'bg-green-500/10'];
  const inactiveClasses = ['text-slate-500', 'dark:text-slate-400'];
  
  if (tabName === 'all') {
    // Activate "All Subjects"
    allTab.classList.add(...activeClasses);
    allTab.classList.remove(...inactiveClasses);
    
    // Deactivate "My Library"
    libraryTab.classList.remove(...activeClasses);
    libraryTab.classList.add(...inactiveClasses);
    
    renderSubjects();
  } else {
    // Activate "My Library"
    libraryTab.classList.add(...activeClasses);
    libraryTab.classList.remove(...inactiveClasses);
    
    // Deactivate "All Subjects"
    allTab.classList.remove(...activeClasses);
    allTab.classList.add(...inactiveClasses);
    
    renderMyLibrary();
  }
};

// Setup tabs event listeners
function setupTabs() {
  const allTab = document.getElementById('allSubjectsTab');
  const libraryTab = document.getElementById('myLibraryTab');
  
  if (allTab) {
    addGlobalListener(allTab, 'click', () => switchTab('all'));
  }
  
  if (libraryTab) {
    addGlobalListener(libraryTab, 'click', () => switchTab('library'));
  }
}

// ==========================================
// 🎬 NAVIGATION
// ==========================================
window.showSubjectLectures = function(subjectId) {
  if (!subjectId) {
    console.error('❌ No subject ID provided');
    return;
  }
  
  console.log('📖 Opening subject:', subjectId);
  window.location.href = `subject.html?id=${encodeURIComponent(subjectId)}`;
};
// ==========================================
// 👤 PROFILE MODAL FUNCTIONS
// ==========================================

// Open Profile Modal
window.openProfileModal = function() {
  const modal = document.getElementById('profileModal');
  if (!modal) {
    console.warn('⚠️ Profile modal not found');
    return;
  }
  
  modal.classList.add('active');
  loadProfileData();
};

// Close Profile Modal
window.closeProfileModal = function() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;
  
  modal.classList.remove('active');
  
  // Hide avatar selector if open
  const avatarSelector = document.getElementById('avatarSelector');
  avatarSelector?.classList.add('hidden');
};

// Load Profile Data
function loadProfileData() {
  if (!currentUser || !userData) {
    console.warn('⚠️ No user data to load');
    return;
  }
  
  try {
    // Basic Info
    const modalName = document.getElementById('modalName');
    const modalEmail = document.getElementById('modalEmail');
    const modalUniversity = document.getElementById('modalUniversity');
    const modalFaculty = document.getElementById('modalFaculty');
    const modalLevel = document.getElementById('modalLevel');
    
    if (modalName) modalName.value = userData.name || '';
    if (modalEmail) modalEmail.value = currentUser.email || '';
    if (modalUniversity) modalUniversity.value = userData.university || '';
    if (modalFaculty) modalFaculty.value = userData.faculty || '';
    if (modalLevel) modalLevel.value = userData.level || '';
    
    // Stats
    const studyTime = userData.totalStudyTime || 0;
    const hours = Math.floor(studyTime / 60);
    const minutes = studyTime % 60;
    
    const modalStudyTime = document.getElementById('modalStudyTime');
    if (modalStudyTime) {
      if (hours > 0) {
        modalStudyTime.textContent = `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ''}`;
      } else {
        modalStudyTime.textContent = `${minutes} دقيقة`;
      }
    }
    
    // Subjects count
    const userSubjectIds = [...new Set(userLectures.map(lec => lec.subjectId))];
    const modalSubjectsCount = document.getElementById('modalSubjectsCount');
    if (modalSubjectsCount) {
      modalSubjectsCount.textContent = userSubjectIds.length || 0;
    }
    
    // Completed lectures
    const modalLecturesCompleted = document.getElementById('modalLecturesCompleted');
    if (modalLecturesCompleted) {
      modalLecturesCompleted.textContent = userData.completedLectures || 0;
    }
    
    // Member since
    if (userData.createdAt?.toDate) {
      const date = userData.createdAt.toDate();
      const year = date.getFullYear();
      const month = date.toLocaleDateString('ar-EG', { month: 'long' });
      const modalMemberSince = document.getElementById('modalMemberSince');
      if (modalMemberSince) {
        modalMemberSince.textContent = `${month} ${year}`;
      }
    }
    
    // Avatar
    const avatarUrl = userData.avatar || 
                      generateAvatarUrl(userData.avatarSeed || 'User', userData.avatarParams || '');
    const modalAvatar = document.getElementById('modalAvatar');
    if (modalAvatar) {
      modalAvatar.src = avatarUrl;
    }
    
    console.log('✅ Profile data loaded');
  } catch (error) {
    console.error('❌ Error loading profile data:', error);
  }
}

// Toggle Avatar Selector
window.toggleAvatarSelector = function() {
  const selector = document.getElementById('avatarSelector');
  if (!selector) return;
  
  const isHidden = selector.classList.contains('hidden');
  selector.classList.toggle('hidden');
  
  // Load avatars if showing for first time
  if (isHidden) {
    const grid = selector.querySelector('.avatars-grid');
    if (grid && grid.children.length === 0) {
      loadAvatarsInModal();
    }
  }
};

// Load Avatars in Modal
function loadAvatarsInModal() {
  const grid = document.querySelector('#avatarSelector .avatars-grid');
  if (!grid) {
    console.warn('⚠️ Avatars grid not found');
    return;
  }
  
  try {
    // Check if AVATAR_CONFIGS exists
    if (!AVATAR_CONFIGS || AVATAR_CONFIGS.length === 0) {
      console.warn('⚠️ AVATAR_CONFIGS not found, using defaults');
      
      // Default seeds
      const defaultSeeds = ['Felix', 'Aneka', 'Jasper', 'Luna', 'Oliver', 'Emma', 'Max', 'Sophie'];
      
      grid.innerHTML = defaultSeeds.map((seed, index) => {
        const url = generateAvatarUrl(seed, '');
        const isSelected = userData?.avatarSeed === seed;
        
        return `
          <img 
            src="${url}" 
            alt="Avatar ${index + 1}"
            class="avatar-option ${isSelected ? 'selected' : ''}"
            onclick="selectAvatar('${seed}', '')"
            loading="lazy"
          />
        `;
      }).join('');
      
      return;
    }
    
    // Use AVATAR_CONFIGS
    grid.innerHTML = AVATAR_CONFIGS.map((config, index) => {
      const url = generateAvatarUrl(config.seed, config.params);
      const isSelected = userData?.avatarSeed === config.seed;
      
      return `
        <img 
          src="${url}" 
          alt="Avatar ${index + 1}"
          class="avatar-option ${isSelected ? 'selected' : ''}"
          onclick="selectAvatar('${config.seed}', '${config.params}')"
          loading="lazy"
        />
      `;
    }).join('');
    
    console.log('✅ Avatars loaded in modal');
  } catch (error) {
    console.error('❌ Error loading avatars:', error);
  }
}

// Select Avatar
window.selectAvatar = async function(seed, params) {
  if (!currentUser) return;
  
  console.log('🎨 Selecting avatar:', seed);
  
  try {
    // Update UI immediately
    const clickedAvatar = event?.target;
    if (clickedAvatar) {
      document.querySelectorAll('.avatar-option').forEach(img => {
        img.classList.remove('selected');
      });
      clickedAvatar.classList.add('selected');
    }
    
    const avatarUrl = generateAvatarUrl(seed, params);
    const modalAvatar = document.getElementById('modalAvatar');
    if (modalAvatar) {
      modalAvatar.src = avatarUrl;
    }
    
    // Update Firestore
    await updateDoc(doc(db, 'users', currentUser.uid), {
      avatarSeed: seed,
      avatarParams: params,
      avatarStyle: AVATAR_STYLE,
      avatar: avatarUrl,
      updatedAt: serverTimestamp()
    });
    
    // Update local userData
    userData.avatarSeed = seed;
    userData.avatarParams = params;
    userData.avatar = avatarUrl;
    
    // Update header avatar
    const headerAvatar = document.getElementById('headerUserAvatar');
    if (headerAvatar) {
      headerAvatar.src = avatarUrl;
    }
    
    showToast('تم تحديث الصورة بنجاح!', 'success');
    
  } catch (error) {
    console.error('❌ Error updating avatar:', error);
    showToast('خطأ في حفظ الصورة', 'error');
  }
};

// Change Password
window.changePassword = async function() {
  const email = currentUser?.email;
  if (!email) {
    showToast('البريد الإلكتروني غير متوفر', 'error');
    return;
  }
  
  const confirmed = await showConfirmDialog(
    'تغيير كلمة المرور',
    'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    'إرسال',
    'إلغاء'
  );
  
  if (confirmed) {
    try {
      const { sendPasswordResetEmail } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
      );
      
      await sendPasswordResetEmail(auth, email);
      showToast('تم إرسال رابط إعادة تعيين كلمة المرور', 'success');
      
    } catch (error) {
      console.error('❌ Error sending password reset:', error);
      showToast('خطأ في إرسال البريد الإلكتروني', 'error');
    }
  }
};

// Save Profile
window.saveProfile = async function() {
  if (!currentUser) {
    showToast('يجب تسجيل الدخول أولاً', 'error');
    return;
  }
  
  const name = document.getElementById('modalName')?.value?.trim();
  const university = document.getElementById('modalUniversity')?.value || '';
  const faculty = document.getElementById('modalFaculty')?.value || '';
  const level = document.getElementById('modalLevel')?.value || '';
  
  if (!name) {
    showToast('الرجاء إدخال الاسم', 'error');
    return;
  }
  
  try {
    await updateDoc(doc(db, 'users', currentUser.uid), {
      name,
      university,
      faculty,
      level,
      updatedAt: serverTimestamp()
    });
    
    // Update local userData
    userData.name = name;
    userData.university = university;
    userData.faculty = faculty;
    userData.level = level;
    
    // Update header
    const headerName = document.getElementById('headerUserName');
    const headerUniversity = document.getElementById('headerUserUniversity');
    if (headerName) headerName.textContent = name;
    if (headerUniversity) headerUniversity.textContent = university || 'جامعة دمنهور';
    
    showToast('تم حفظ التغييرات بنجاح!', 'success');
    closeProfileModal();
    
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    showToast('خطأ في حفظ البيانات', 'error');
  }
};

// Handle Logout
window.handleLogout = async function() {
  const confirmed = await showConfirmDialog(
    'تسجيل الخروج',
    'هل أنت متأكد من تسجيل الخروج؟',
    'تسجيل الخروج',
    'إلغاء',
    true
  );

  if (confirmed) {
    try {
      await signOut(auth);
      // Clear cache
      subjectsCache = { data: null, timestamp: null };
      lecturesCache = { data: null, timestamp: null };
      
      window.location.href = 'login.html';
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      showToast('خطأ في تسجيل الخروج', 'error');
    }
  }
};

// ==========================================
// 🔔 TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}" style="margin-left: 10px;"></i>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    z-index: 10001;
    animation: slideInRight 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// ❓ CONFIRM DIALOG
// ==========================================
async function showConfirmDialog(
  title, 
  message, 
  confirmText = 'تأكيد', 
  cancelText = 'إلغاء', 
  isDanger = false
) {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog-overlay';
    dialog.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(5px);
      animation: fadeIn 0.2s ease;
    `;
    
    dialog.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 25px 70px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
      ">
        <h3 style="
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 15px;
          color: #0f172a;
        ">${title}</h3>
        <p style="
          color: #64748b;
          margin-bottom: 25px;
          line-height: 1.6;
        ">${message}</p>
        <div style="
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        ">
          <button class="cancel-btn" style="
            padding: 10px 24px;
            border-radius: 12px;
            background: #e2e8f0;
            color: #475569;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
          ">${cancelText}</button>
          <button class="confirm-btn" style="
            padding: 10px 24px;
            border-radius: 12px;
            background: ${isDanger ? '#ef4444' : '#10b981'};
            color: white;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
          ">${confirmText}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const cancelBtn = dialog.querySelector('.cancel-btn');
    const confirmBtn = dialog.querySelector('.confirm-btn');
    
    const cleanup = (result) => {
      dialog.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => {
        dialog.remove();
        resolve(result);
      }, 200);
    };
    
    cancelBtn.onclick = () => cleanup(false);
    confirmBtn.onclick = () => cleanup(true);
    dialog.onclick = (e) => {
      if (e.target === dialog) cleanup(false);
    };
  });
}

// ==========================================
// 🔧 HELPER FUNCTIONS
// ==========================================

// Add global event listener with cleanup
function addGlobalListener(element, event, handler) {
  if (!element) return;
  
  element.addEventListener(event, handler);
  eventListeners.push({ element, event, handler });
}

// Cleanup all event listeners
function cleanupEventListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    element?.removeEventListener(event, handler);
  });
  eventListeners = [];
}

// ==========================================
// 🎉 INITIALIZE EVENT LISTENERS
// ==========================================
function initializeEventListeners() {
  console.log('🎉 Initializing event listeners...');
  
  // User section click
  const userSection = document.querySelector('.user-section');
  if (userSection) {
    addGlobalListener(userSection, 'click', openProfileModal);
  }
  
  // Profile modal overlay click
  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    addGlobalListener(profileModal, 'click', (e) => {
      if (e.target.id === 'profileModal') {
        closeProfileModal();
      }
    });
  }
  
  // Close modal button
  const closeBtn = document.querySelector('.close-modal-btn');
  if (closeBtn) {
    addGlobalListener(closeBtn, 'click', closeProfileModal);
  }
  
  // Setup tabs
  setupTabs();
  
  // Keyboard shortcuts
  addGlobalListener(document, 'keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
      closeProfileModal();
    }
  });
  
  console.log('✅ Event listeners initialized');
}

// ==========================================
// 🚀 INITIALIZATION & CLEANUP
// ==========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
  initializeEventListeners();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupEventListeners);

// ==========================================
// ✅ LIBRARY.JS V9.0 - COMPLETE!
// ==========================================
console.log('✅ Library.js V9.0 Initialized - All Features Ready! 🎉');
console.log('📌 Features: Profile Modal, AI Recommendations, Tabs, Avatar Selector, Caching, Error Handling');
