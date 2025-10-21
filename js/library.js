// ==================== LIBRARY PAGE - IMPROVED & OPTIMIZED ====================
import { auth, db } from './app.js';
import { onAuthStateChanged, signOut, updatePassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  setDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ==================== STATE ====================
let currentUser = null;
let userData = null;
let lecturesDB = {};
let userLectures = [];
let subjects = {};

// ==================== CACHING ====================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let subjectsCache = { data: null, timestamp: null };
let lecturesCache = { data: null, timestamp: null };

// ==================== UI STATE ====================
let userMenuTimeout;

// ==================== AVATAR SEEDS ====================
const avatarSeeds = [
  'Ahmad', 'Omar', 'Ali', 'Youssef', 'Khaled', 'Mohamed',
  'Sara', 'Nour', 'Layla', 'Maryam', 'Huda', 'Amira',
  'Success', 'Victory', 'Hope', 'Dream', 'Star', 'Bright',
  'Scholar', 'Wisdom', 'Knowledge', 'Learning', 'Growth', 'Future'
];

const avatarStyle = 'notionists';
let selectedUniversityValue = 'دمنهور';

// ==================== RETRY HELPER ====================
async function fetchWithRetry(fetchFunction, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFunction();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`⚠️ Retry ${i + 1}/${retries}:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// ==================== INITIALIZE ====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = user;
  
  try {
    await loadUserData();
    await loadSubjectsFromFirestore();
    await loadLectures();
    await loadUserLibrary();
    renderSubjectsGrid();
    updateLibraryCount();
    setupAvatarHandler();
  } catch (error) {
    console.error('❌ Initialization error:', error);
    showToast('خطأ في تحميل البيانات', 'error');
  }
});

// ==================== LOAD USER DATA ====================
async function loadUserData() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (!userDoc.exists()) {
      console.error('❌ User document not found');
      await signOut(auth);
      window.location.href = 'login.html';
      return;
    }
    
    userData = userDoc.data();
    
    // Update UI
    document.getElementById('headerUserName').textContent = userData.name;
    document.getElementById('headerUserUniversity').textContent = userData.university || 'جامعة دمنهور';
    
    // Avatar
    const userAvatarStyle = userData.avatarStyle || 'notionists';
    const avatarUrl = userData.avatar || `https://api.dicebear.com/7.x/${userAvatarStyle}/svg?seed=${encodeURIComponent(userData.name)}`;
    document.getElementById('headerUserAvatar').src = avatarUrl;
    document.getElementById('profileAvatarImg').src = avatarUrl;
    
    // Profile form
    document.getElementById('profileName').value = userData.name;
    document.getElementById('profileEmail').value = userData.email;
    
    // University
    const uni = userData.university || 'دمنهور';
    document.getElementById('selectedUniversity').textContent = `جامعة ${uni}`;
    document.getElementById('profileUniversity').value = uni;
    selectedUniversityValue = uni;
    
    document.querySelectorAll('.select-option').forEach(opt => {
      opt.classList.remove('selected');
      if (opt.dataset.value === uni) opt.classList.add('selected');
    });
    
    console.log('✅ User data loaded');
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    throw error;
  }
}

// ==================== LOAD SUBJECTS FROM FIRESTORE ====================
async function loadSubjectsFromFirestore(forceRefresh = false) {
  try {
    const now = Date.now();
    
    // Check cache
    if (!forceRefresh && subjectsCache.data && subjectsCache.timestamp && 
        (now - subjectsCache.timestamp < CACHE_DURATION)) {
      console.log('✅ Using cached subjects');
      subjects = subjectsCache.data;
      return;
    }
    
    // Show loading
    const subjectsGrid = document.getElementById('subjectsGrid');
    if (subjectsGrid) {
      subjectsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
          <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 20px;"></i>
          <p style="font-size: 1.1rem; font-weight: 600;">جاري تحميل المواد...</p>
        </div>
      `;
    }
    
    console.log('📡 Fetching subjects from Firestore...');
    
    const snapshot = await fetchWithRetry(() => getDocs(collection(db, 'subjects')));
    
    console.log('📊 Total subjects in Firestore:', snapshot.size);
    
    subjects = {};
    let visibleCount = 0;
    
    snapshot.forEach(docSnap => {
      const subject = docSnap.data();
      
      if (subject.isVisible !== false) {
        subjects[subject.id] = {
          name: subject.nameAr,
          nameEn: subject.nameEn,
          icon: subject.icon,
          color: subject.color,
          description: subject.description || '',
          order: subject.order || 999,
          customizations: subject.customizations || {}
        };
        visibleCount++;
      }
    });
    
    // Update cache
    subjectsCache = {
      data: subjects,
      timestamp: now
    };
    
    console.log('✅ Loaded subjects from Firestore:', visibleCount);
    console.log('📋 Subjects:', Object.keys(subjects));
    
    if (visibleCount === 0) {
      console.warn('⚠️ No subjects in Firestore! Add subjects from admin.html');
    }
    
  } catch (error) {
    console.error('❌ Error loading subjects:', error);
    
    // Use cached data if available
    if (subjectsCache.data) {
      console.log('⚠️ Using stale cache due to error');
      subjects = subjectsCache.data;
    } else {
      subjects = {};
      showToast('خطأ في تحميل المواد', 'error');
    }
  }
}

// ==================== RENDER SUBJECTS GRID ====================
function renderSubjectsGrid() {
  const subjectsGrid = document.getElementById('subjectsGrid');
  if (!subjectsGrid) {
    console.error('❌ subjectsGrid element not found!');
    return;
  }
  
  subjectsGrid.innerHTML = '';
  
  const sortedSubjects = Object.entries(subjects).sort((a, b) => {
    return (a[1].order || 999) - (b[1].order || 999);
  });
  
  console.log('🎨 Rendering', sortedSubjects.length, 'subjects');
  
  if (sortedSubjects.length === 0) {
    subjectsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
        <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
        <h3 style="font-size: 1.5rem; margin-bottom: 10px; font-weight: 800;">لا توجد مواد متاحة</h3>
        <p>تواصل مع الإدارة لإضافة مواد من لوحة التحكم</p>
      </div>
    `;
    return;
  }
  
  sortedSubjects.forEach(([subjectId, subject]) => {
    const lectureCount = lecturesDB[subjectId] ? lecturesDB[subjectId].length : 0;
    
    const subjectCard = document.createElement('div');
    subjectCard.className = 'subject-capsule';
    subjectCard.onclick = () => showLectures(subjectId);
    
    subjectCard.innerHTML = `
      <div class="subject-icon-container" style="background: linear-gradient(135deg, ${subject.color}, ${adjustColor(subject.color, 20)});">
        <i class="fas ${subject.icon}"></i>
      </div>
      <h3 class="subject-title">${subject.name}</h3>
      <p style="color: #64748b; font-weight: 600; margin: 10px 0; font-size: 0.95rem;">${subject.nameEn}</p>
      ${subject.description ? `<small style="color: #64748b; font-size: 0.85rem; margin-top: 5px; display: block; line-height: 1.4;">${subject.description}</small>` : ''}
      <span class="lecture-count" id="${subjectId}-count">
        <i class="fas fa-book-open"></i> ${lectureCount} محاضرة
      </span>
    `;
    
    subjectsGrid.appendChild(subjectCard);
  });
  
  console.log('✅ Subjects grid rendered successfully');
}

// Color helper
function adjustColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ==================== LOAD LECTURES ====================
async function loadLectures(forceRefresh = false) {
  try {
    const now = Date.now();
    
    // Check cache
    if (!forceRefresh && lecturesCache.data && lecturesCache.timestamp && 
        (now - lecturesCache.timestamp < CACHE_DURATION)) {
      console.log('✅ Using cached lectures');
      lecturesDB = lecturesCache.data;
      updateCounts();
      return;
    }
    
    console.log('📡 Fetching lectures from Firestore...');
    
    const snapshot = await fetchWithRetry(() => getDocs(collection(db, 'lectures')));
    
    console.log('📊 Total lectures in Firestore:', snapshot.size);
    
    lecturesDB = {};
    Object.keys(subjects).forEach(subjectId => {
      lecturesDB[subjectId] = [];
    });
    
    let activeCount = 0;
    
    snapshot.forEach((docSnap) => {
      const lec = docSnap.data();
      
      if ((lec.status === 'active' || !lec.status) && lecturesDB[lec.subject]) {
        lecturesDB[lec.subject].push({
          id: lec.lectureId,
          title: lec.title,
          url: lec.url,
          description: lec.description || '',
          icon: lec.icon || 'fa-book-open',
          color: lec.color || subjects[lec.subject]?.color || '#16a34a',
          price: lec.price || 'free',
          activationCode: lec.activationCode || null,
          order: lec.order || 999
        });
        activeCount++;
      }
    });
    
    // Sort lectures
    Object.keys(lecturesDB).forEach(subjectId => {
      lecturesDB[subjectId].sort((a, b) => a.order - b.order);
    });
    
    // Update cache
    lecturesCache = {
      data: lecturesDB,
      timestamp: now
    };
    
    console.log('✅ Loaded active lectures:', activeCount);
    updateCounts();
    
  } catch (error) {
    console.error('❌ Error loading lectures:', error);
    
    // Use cached data if available
    if (lecturesCache.data) {
      console.log('⚠️ Using stale cache due to error');
      lecturesDB = lecturesCache.data;
      updateCounts();
    } else {
      showToast('خطأ في تحميل المحاضرات', 'error');
    }
  }
}

// ==================== LOAD USER LIBRARY ====================
async function loadUserLibrary() {
  try {
    const libraryDoc = await getDoc(doc(db, 'userLibrary', currentUser.uid));
    
    if (libraryDoc.exists()) {
      userLectures = libraryDoc.data().lectures || [];
      console.log('✅ User library loaded:', userLectures.length, 'lectures');
    } else {
      userLectures = [];
      console.log('ℹ️ No user library found - creating empty library');
      
      // Create empty library
      await setDoc(doc(db, 'userLibrary', currentUser.uid), {
        uid: currentUser.uid,
        lectures: [],
        activatedAt: {},
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('❌ Error loading user library:', error);
    userLectures = [];
  }
}

// ==================== UPDATE COUNTS ====================
function updateCounts() {
  Object.keys(subjects).forEach(subjectId => {
    const countEl = document.getElementById(`${subjectId}-count`);
    if (countEl) {
      const count = lecturesDB[subjectId] ? lecturesDB[subjectId].length : 0;
      countEl.innerHTML = `<i class="fas fa-book-open"></i> ${count} محاضرة`;
    }
  });
}

// ==================== UPDATE LIBRARY COUNT ====================
function updateLibraryCount() {
  const count = userLectures.length;
  const myLibraryCountEl = document.getElementById('myLibraryCount');
  const headerLibraryCountEl = document.getElementById('headerLibraryCount');
  
  if (myLibraryCountEl) myLibraryCountEl.textContent = count;
  if (headerLibraryCountEl) headerLibraryCountEl.textContent = count;
}
// ==================== SHOW LECTURES ====================
window.showLectures = function(subjectId) {
  const subject = subjects[subjectId];
  if (!subject) {
    console.error('❌ Subject not found:', subjectId);
    return;
  }
  
  const lectures = lecturesDB[subjectId] || [];
  
  document.getElementById('subjectsGrid').style.display = 'none';
  document.getElementById('myLibraryView').style.display = 'none';
  document.getElementById('lecturesView').style.display = 'block';
  document.getElementById('subjectTitle').textContent = `${subject.name} (${subject.nameEn})`;
  
  const lecturesList = document.getElementById('lecturesList');
  
  if (lectures.length === 0) {
    lecturesList.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #64748b;">
        <i class="fas fa-book-open" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
        <h3 style="font-size: 1.3rem; margin-bottom: 10px;">لا توجد محاضرات في هذه المادة</h3>
        <p>ترقب المحاضرات قريباً</p>
      </div>
    `;
    return;
  }
  
  lecturesList.innerHTML = lectures.map(lec => {
    const hasAccess = userLectures.includes(lec.id);
    const isFree = lec.price === 'free';
    
    if (hasAccess) {
      return `
        <div class="lecture-capsule" onclick="openLecture('${lec.url}')" style="border-left: 4px solid ${lec.color};">
          <div class="lecture-icon-box" style="background: ${lec.color};">
            <i class="fas ${lec.icon}"></i>
          </div>
          <div class="lecture-info">
            <h3>${lec.title}</h3>
            ${lec.description ? `<p style="margin: 5px 0 0; color: #64748b; font-size: 0.9rem; line-height: 1.4;">${lec.description}</p>` : ''}
            <p style="margin: 5px 0 0; color: #10b981; font-size: 0.9rem; font-weight: 600;">
              <i class="fas fa-check-circle"></i> متاحة للمشاهدة
            </p>
          </div>
          <span class="lecture-status-active">
            <i class="fas fa-play-circle"></i> مفتوحة
          </span>
        </div>
      `;
    } else if (isFree) {
      return `
        <div class="lecture-capsule lecture-locked" style="border-left: 4px solid #94a3b8;">
          <div class="lecture-icon-box-locked">
            <i class="fas fa-gift"></i>
          </div>
          <div class="lecture-info">
            <h3>${lec.title}</h3>
            ${lec.description ? `<p style="margin: 5px 0 0; color: #64748b; font-size: 0.9rem; line-height: 1.4;">${lec.description}</p>` : ''}
            <p style="margin: 5px 0 0; color: #64748b; font-size: 0.9rem; font-weight: 600;">
              <i class="fas fa-star"></i> محاضرة مجانية
            </p>
          </div>
          <button class="get-lecture-btn" onclick="event.stopPropagation(); getLecture('${lec.id}', '${subjectId}')">
            <i class="fas fa-plus"></i> احصل عليها
          </button>
        </div>
      `;
    } else {
      return `
        <div class="lecture-capsule lecture-locked" style="border-left: 4px solid #94a3b8;">
          <div class="lecture-icon-box-locked">
            <i class="fas fa-lock"></i>
          </div>
          <div class="lecture-info">
            <h3>${lec.title}</h3>
            ${lec.description ? `<p style="margin: 5px 0 0; color: #64748b; font-size: 0.9rem; line-height: 1.4;">${lec.description}</p>` : ''}
            <p style="margin: 5px 0 0; color: #64748b; font-size: 0.9rem; font-weight: 600;">
              <i class="fas fa-crown"></i> محاضرة مدفوعة
            </p>
          </div>
          <button class="activate-lecture-btn" onclick="event.stopPropagation(); showActivationModal('${lec.id}', '${subjectId}')">
            <i class="fas fa-key"></i> تفعيل
          </button>
        </div>
      `;
    }
  }).join('');
};

// ==================== TOAST ====================
function showToast(message, type = 'info') {
  if (typeof window.showToastNotification === 'function') {
    window.showToastNotification(message, type);
  } else {
    // Fallback
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 99999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// ==================== GET FREE LECTURE ====================
window.getLecture = async function(lectureId, subjectId) {
  try {
    const btn = event.target.closest('button');
    if (!btn) return;
    
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
    
    const libraryRef = doc(db, 'userLibrary', currentUser.uid);
    const libraryDoc = await getDoc(libraryRef);
    
    let lectures = [];
    let activatedAt = {};
    
    if (libraryDoc.exists()) {
      lectures = libraryDoc.data().lectures || [];
      activatedAt = libraryDoc.data().activatedAt || {};
    }
    
    if (!lectures.includes(lectureId)) {
      lectures.push(lectureId);
      activatedAt[lectureId] = serverTimestamp();
      
      if (libraryDoc.exists()) {
        await updateDoc(libraryRef, { lectures, activatedAt });
      } else {
        await setDoc(libraryRef, {
          uid: currentUser.uid,
          lectures,
          activatedAt,
          createdAt: serverTimestamp()
        });
      }
      
      userLectures = lectures;
      updateLibraryCount();
      
      showToast('تم إضافة المحاضرة لمكتبتك بنجاح!', 'success');
      showLectures(subjectId);
    } else {
      showToast('المحاضرة موجودة بالفعل!', 'info');
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    showToast('خطأ في الإضافة', 'error');
    
    const btn = event.target.closest('button');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-plus"></i> احصل عليها';
    }
  }
};

// ==================== ACTIVATION MODAL ====================
window.showActivationModal = function(lectureId, subjectId) {
  const code = prompt('🔑 أدخل كود التفعيل:');
  if (code && code.trim()) {
    activateLecture(lectureId, subjectId, code.trim());
  }
};

window.activateLecture = async function(lectureId, subjectId, code) {
  try {
    const lectures = lecturesDB[subjectId];
    if (!lectures) {
      showToast('مادة غير موجودة', 'error');
      return;
    }
    
    const lecture = lectures.find(l => l.id === lectureId);
    
    if (!lecture) {
      showToast('محاضرة غير موجودة', 'error');
      return;
    }
    
    if (lecture.activationCode !== code) {
      showToast('كود التفعيل خاطئ', 'error');
      return;
    }
    
    const libraryRef = doc(db, 'userLibrary', currentUser.uid);
    const libraryDoc = await getDoc(libraryRef);
    
    let userLecturesList = [];
    let activatedAt = {};
    
    if (libraryDoc.exists()) {
      userLecturesList = libraryDoc.data().lectures || [];
      activatedAt = libraryDoc.data().activatedAt || {};
    }
    
    if (!userLecturesList.includes(lectureId)) {
      userLecturesList.push(lectureId);
      activatedAt[lectureId] = serverTimestamp();
      
      if (libraryDoc.exists()) {
        await updateDoc(libraryRef, { lectures: userLecturesList, activatedAt });
      } else {
        await setDoc(libraryRef, {
          uid: currentUser.uid,
          lectures: userLecturesList,
          activatedAt,
          createdAt: serverTimestamp()
        });
      }
      
      userLectures = userLecturesList;
      updateLibraryCount();
      
      showToast('تم تفعيل المحاضرة بنجاح!', 'success');
      showLectures(subjectId);
    } else {
      showToast('المحاضرة مفعلة بالفعل!', 'info');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    showToast('خطأ في التفعيل', 'error');
  }
};

// ==================== BUNDLE CODE ACTIVATION ====================
window.activateBundleCode = async function(code) {
  if (!code || !code.trim()) {
    showToast('يرجى إدخال كود التفعيل', 'error');
    return;
  }
  
  try {
    const snapshot = await getDocs(collection(db, 'activationCodes'));
    
    let codeDoc = null;
    let codeData = null;
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.code === code.toUpperCase() && data.isActive === true) {
        codeDoc = docSnap;
        codeData = data;
      }
    });
    
    if (!codeDoc) {
      showToast('كود التفعيل غير صحيح أو منتهي', 'error');
      return;
    }
    
    const now = new Date();
    const expiresAt = codeData.expiresAt.toDate();
    
    if (now > expiresAt) {
      showToast('انتهت صلاحية هذا الكود', 'error');
      return;
    }
    
    if (codeData.currentUses >= codeData.maxUses) {
      showToast('وصل الكود للحد الأقصى من الاستخدامات', 'error');
      return;
    }
    
    if (codeData.usedBy && codeData.usedBy.includes(currentUser.uid)) {
      showToast('لقد استخدمت هذا الكود من قبل!', 'info');
      return;
    }
    
    const libraryRef = doc(db, 'userLibrary', currentUser.uid);
    const libraryDoc = await getDoc(libraryRef);
    
    let userLecturesList = [];
    let activatedAt = {};
    
    if (libraryDoc.exists()) {
      userLecturesList = libraryDoc.data().lectures || [];
      activatedAt = libraryDoc.data().activatedAt || {};
    }
    
    const newLectures = codeData.lectures.filter(l => !userLecturesList.includes(l));
    userLecturesList = [...userLecturesList, ...newLectures];
    
    newLectures.forEach(lecId => {
      activatedAt[lecId] = serverTimestamp();
    });
    
    if (libraryDoc.exists()) {
      await updateDoc(libraryRef, { lectures: userLecturesList, activatedAt });
    } else {
      await setDoc(libraryRef, {
        uid: currentUser.uid,
        lectures: userLecturesList,
        activatedAt,
        createdAt: serverTimestamp()
      });
    }
    
    await updateDoc(doc(db, 'activationCodes', codeDoc.id), {
      currentUses: codeData.currentUses + 1,
      usedBy: [...(codeData.usedBy || []), currentUser.uid]
    });
    
    userLectures = userLecturesList;
    updateLibraryCount();
    
    showToast(`تم تفعيل ${newLectures.length} محاضرة بنجاح!`, 'success');
    setTimeout(() => location.reload(), 1500);
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 'permission-denied') {
      showToast('ليس لديك صلاحية لهذه العملية', 'error');
    } else if (error.code === 'unavailable') {
      showToast('خطأ في الاتصال، حاول مرة أخرى', 'error');
    } else {
      showToast('خطأ في التفعيل', 'error');
    }
  }
};

// ==================== USER MENU ====================
window.toggleUserMenu = function() {
  const menu = document.getElementById('userDropdownMenu');
  if (!menu) return;
  
  clearTimeout(userMenuTimeout);
  menu.classList.toggle('active');
  
  if (menu.classList.contains('active')) {
    userMenuTimeout = setTimeout(() => {
      menu.classList.remove('active');
    }, 10000);
  }
};

document.addEventListener('click', function(event) {
  const userSection = document.querySelector('.user-section');
  const menu = document.getElementById('userDropdownMenu');
  
  if (menu && userSection && !userSection.contains(event.target)) {
    menu.classList.remove('active');
    clearTimeout(userMenuTimeout);
  }
});

// ==================== SHOW MY LIBRARY ====================
window.showMyLibrary = function() {
  document.getElementById('subjectsGrid').style.display = 'none';
  document.getElementById('lecturesView').style.display = 'none';
  document.getElementById('myLibraryView').style.display = 'block';
  
  const menu = document.getElementById('userDropdownMenu');
  if (menu) menu.classList.remove('active');
  
  loadMyLectures();
};

function loadMyLectures() {
  const container = document.getElementById('myLecturesList');
  if (!container) return;
  
  if (userLectures.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>لا توجد محاضرات بعد</h3>
        <p>ابدأ بإضافة محاضرات من "جميع المواد"</p>
        <button onclick="showAllSubjects()" class="browse-btn">تصفح المواد</button>
      </div>
    `;
    return;
  }
  
  let myLecturesData = [];
  
  Object.keys(lecturesDB).forEach(subjectId => {
    lecturesDB[subjectId].forEach(lec => {
      if (userLectures.includes(lec.id)) {
        myLecturesData.push({ 
          ...lec, 
          subjectName: subjects[subjectId]?.name || subjectId,
          subjectOrder: subjects[subjectId]?.order || 999
        });
      }
    });
  });
  
  // Sort by subject order, then lecture order
  myLecturesData.sort((a, b) => {
    if (a.subjectOrder !== b.subjectOrder) {
      return a.subjectOrder - b.subjectOrder;
    }
    return a.order - b.order;
  });
  
  container.innerHTML = myLecturesData.map(lec => `
    <div class="lecture-capsule" onclick="openLecture('${lec.url}')" style="margin-bottom: 20px; border-left: 4px solid ${lec.color};">
      <div class="lecture-icon-box" style="background: ${lec.color};">
        <i class="fas ${lec.icon}"></i>
      </div>
      <div class="lecture-info">
        <h3>${lec.title}</h3>
        <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 600;">
          <i class="fas fa-tag"></i> ${lec.subjectName}
        </p>
      </div>
      <span class="lecture-status-active">
        <i class="fas fa-play-circle"></i> مفتوحة
      </span>
    </div>
  `).join('');
}

// ==================== NAVIGATION ====================
window.showAllSubjects = function() {
  document.getElementById('myLibraryView').style.display = 'none';
  document.getElementById('lecturesView').style.display = 'none';
  document.getElementById('subjectsGrid').style.display = 'grid';
};

window.backToSubjects = function() {
  document.getElementById('subjectsGrid').style.display = 'grid';
  document.getElementById('lecturesView').style.display = 'none';
  document.getElementById('myLibraryView').style.display = 'none';
};

window.openLecture = (url) => {
  console.log('📖 Opening lecture:', url);
  window.location.href = url;
};

window.logout = async function() {
  if (confirm('هل تريد تسجيل الخروج؟')) {
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      console.error('❌ Logout error:', error);
      showToast('خطأ في تسجيل الخروج', 'error');
    }
  }
};

// ==================== PROFILE MODAL ====================
window.openProfile = function() {
  document.getElementById('profileModal').classList.add('active');
  const menu = document.getElementById('userDropdownMenu');
  if (menu) {
    menu.classList.remove('active');
    clearTimeout(userMenuTimeout);
  }
};

window.closeProfile = function() {
  document.getElementById('profileModal').classList.remove('active');
  document.getElementById('avatarSelector').style.display = 'none';
  document.getElementById('profileFormSection').style.display = 'block';
  
  const select = document.getElementById('universitySelect');
  const dropdown = document.getElementById('universityDropdown');
  if (select) select.classList.remove('active');
  if (dropdown) dropdown.classList.remove('active');
};

// ==================== AVATAR HANDLER ====================
function setupAvatarHandler() {
  setTimeout(() => {
    const avatarContainer = document.getElementById('avatarContainer');
    if (!avatarContainer) return;
    
    avatarContainer.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      document.getElementById('avatarSelector').style.display = 'block';
      document.getElementById('profileFormSection').style.display = 'none';
      
      const grid = document.querySelector('.avatars-grid');
      if (!grid) return;
      
      grid.innerHTML = avatarSeeds.map(seed => `
        <div class="avatar-option" data-seed="${seed}">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=${seed}" alt="${seed}">
        </div>
      `).join('');
      
      grid.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', function() {
          selectAvatarNew(this.dataset.seed);
        });
      });
      
      if (userData && userData.avatarSeed) {
        const current = grid.querySelector(`[data-seed="${userData.avatarSeed}"]`);
        if (current) current.classList.add('selected');
      }
    });
  }, 500);
}

function selectAvatarNew(seed) {
  document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
  
  const clickedElement = document.querySelector(`[data-seed="${seed}"]`);
  if (clickedElement) clickedElement.classList.add('selected');
  
  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}`;
  
  document.getElementById('profileAvatarImg').src = avatarUrl;
  document.getElementById('headerUserAvatar').src = avatarUrl;
  
  if (currentUser) {
    updateDoc(doc(db, 'users', currentUser.uid), {
      avatarSeed: seed,
      avatarStyle: avatarStyle,
      avatar: avatarUrl
    }).then(() => {
      if (userData) {
        userData.avatarSeed = seed;
        userData.avatarStyle = avatarStyle;
        userData.avatar = avatarUrl;
      }
      showToast('تم تحديث الصورة بنجاح!', 'success');
    }).catch(error => {
      console.error('❌ Error:', error);
      showToast('خطأ في حفظ الصورة', 'error');
    });
  }
}

window.closeAvatarSelector = function() {
  document.getElementById('avatarSelector').style.display = 'none';
  document.getElementById('profileFormSection').style.display = 'block';
};

// ==================== CUSTOM SELECT ====================
window.toggleUniversityDropdown = function() {
  const select = document.getElementById('universitySelect');
  const dropdown = document.getElementById('universityDropdown');
  if (select) select.classList.toggle('active');
  if (dropdown) dropdown.classList.toggle('active');
};

window.selectUniversity = function(value) {
  selectedUniversityValue = value;
  
  const selectedUniv = document.getElementById('selectedUniversity');
  const profileUniv = document.getElementById('profileUniversity');
  
  if (selectedUniv) selectedUniv.textContent = `جامعة ${value}`;
  if (profileUniv) profileUniv.value = value;
  
  document.querySelectorAll('.select-option').forEach(opt => {
    opt.classList.remove('selected');
    if (opt.dataset.value === value) opt.classList.add('selected');
  });
  
  const select = document.getElementById('universitySelect');
  const dropdown = document.getElementById('universityDropdown');
  if (select) select.classList.remove('active');
  if (dropdown) dropdown.classList.remove('active');
};

// ==================== PROFILE FORM ====================
const profileForm = document.getElementById('profileForm');
if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value.trim();
    const university = document.getElementById('profileUniversity').value;
    const password = document.getElementById('profilePassword').value;
    const btn = document.getElementById('saveProfileBtn');
    
    if (!name) {
      showToast('يرجى إدخال الاسم', 'error');
      return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name,
        university
      });
      
      if (password && password.length >= 6) {
        await updatePassword(currentUser, password);
      }
      
      userData.name = name;
      userData.university = university;
      
      document.getElementById('headerUserName').textContent = name;
      document.getElementById('headerUserUniversity').textContent = university;
      
      showToast('تم حفظ التغييرات بنجاح!', 'success');
      closeProfile();
      
    } catch (error) {
      console.error('❌ Error:', error);
      
      let errorMsg = 'خطأ في الحفظ';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMsg = 'يجب تسجيل الدخول مرة أخرى لتغيير كلمة المرور';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'كلمة المرور ضعيفة جداً';
      }
      
      showToast(errorMsg, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> حفظ التغييرات';
      document.getElementById('profilePassword').value = '';
    }
  });
}
