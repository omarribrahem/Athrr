// ==================== LIBRARY PAGE - WITH USER LIBRARY ====================
import { auth, db } from './app.js';
import { onAuthStateChanged, signOut, updatePassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, query, collection, where, getDocs, updateDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentUser = null;
let userData = null;
let lecturesDB = {};
let userLectures = [];

const subjects = {
  statistics: { name: 'الإحصاء', nameEn: 'Statistics' },
  economics: { name: 'الاقتصاد', nameEn: 'Economics' },
  production: { name: 'إدارة الإنتاج', nameEn: 'Production' },
  finance: { name: 'المالية العامة', nameEn: 'Public Finance' }
};

// ==================== NOTIONISTS AVATARS ====================
const avatarSeeds = [
  'Ahmad', 'Omar', 'Ali', 'Youssef', 'Khaled', 'Mohamed',
  'Sara', 'Nour', 'Layla', 'Maryam', 'Huda', 'Amira',
  'Success', 'Victory', 'Hope', 'Dream', 'Star', 'Bright',
  'Scholar', 'Wisdom', 'Knowledge', 'Learning', 'Growth', 'Future'
];

const avatarStyle = 'notionists';
let selectedUniversityValue = 'دمنهور';

// ==================== INITIALIZE ====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = user;
  await loadUserData();
  await loadLectures();
  await loadUserLibrary();
  updateCounts();
  updateLibraryCount();
  setupAvatarHandler();
});

// ==================== LOAD USER DATA ====================
async function loadUserData() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      userData = userDoc.data();
      
      // Update Header
      document.getElementById('headerUserName').textContent = userData.name;
      document.getElementById('headerUserUniversity').textContent = userData.university || 'جامعة دمنهور';
      
      // Update Avatar
      const userAvatarStyle = userData.avatarStyle || 'notionists';
      const avatarUrl = userData.avatar || `https://api.dicebear.com/7.x/${userAvatarStyle}/svg?seed=${encodeURIComponent(userData.name)}`;
      document.getElementById('headerUserAvatar').src = avatarUrl;
      document.getElementById('profileAvatarImg').src = avatarUrl;
      
      // Update Profile Modal
      document.getElementById('profileName').value = userData.name;
      document.getElementById('profileEmail').value = userData.email;
      
      // Update Custom Select
      const uni = userData.university || 'دمنهور';
      document.getElementById('selectedUniversity').textContent = `جامعة ${uni}`;
      document.getElementById('profileUniversity').value = uni;
      selectedUniversityValue = uni;
      
      // Highlight selected option
      document.querySelectorAll('.select-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.value === uni) {
          opt.classList.add('selected');
        }
      });
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// ==================== LOAD LECTURES ====================
async function loadLectures() {
  try {
    const q = query(collection(db, 'lectures'), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    lecturesDB = { statistics: [], economics: [], production: [], finance: [] };
    
    snapshot.forEach((docSnap) => {
      const lec = docSnap.data();
      if (lecturesDB[lec.subject]) {
        lecturesDB[lec.subject].push({
          id: lec.lectureId,
          title: lec.title,
          url: lec.url,
          price: lec.price || 'free',
          activationCode: lec.activationCode || null
        });
      }
    });
    
    // Fallback (إذا Firestore فاضية)
    if (snapshot.empty) {
      lecturesDB = {
        statistics: [
          { id: 'stat_l1', title: 'مقدمة في الإحصاء', url: 'lectures/statistics/lecture1.html', price: 'free' },
          { id: 'stat_l2', title: 'الإحصاء الوصفي', url: 'lectures/statistics/lecture2.html', price: 'paid', activationCode: 'STAT2024' }
        ],
        economics: [
          { id: 'econ_l1', title: 'مبادئ الاقتصاد', url: 'lectures/economics/lecture1.html', price: 'free' }
        ],
        production: [
          { id: 'prod_l1', title: 'مقدمة في إدارة الإنتاج', url: 'lectures/production/lecture1.html', price: 'free' }
        ],
        finance: [
          { id: 'fin_l1', title: 'مقدمة في المالية العامة', url: 'lectures/finance/lecture1.html', price: 'free' }
        ]
      };
    }
  } catch (error) {
    console.error('Error loading lectures:', error);
  }
}

// ==================== LOAD USER LIBRARY ====================
async function loadUserLibrary() {
  try {
    const libraryDoc = await getDoc(doc(db, 'userLibrary', currentUser.uid));
    if (libraryDoc.exists()) {
      userLectures = libraryDoc.data().lectures || [];
    } else {
      userLectures = [];
    }
  } catch (error) {
    console.error('Error loading user library:', error);
    userLectures = [];
  }
}

// ==================== UPDATE COUNTS ====================
function updateCounts() {
  document.getElementById('stat-count').textContent = lecturesDB.statistics.length;
  document.getElementById('econ-count').textContent = lecturesDB.economics.length;
  document.getElementById('prod-count').textContent = lecturesDB.production.length;
  document.getElementById('fin-count').textContent = lecturesDB.finance.length;
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
  const lectures = lecturesDB[subjectId] || [];
  
  document.getElementById('subjectsGrid').style.display = 'none';
  document.getElementById('myLibraryView').style.display = 'none';
  document.getElementById('lecturesView').style.display = 'block';
  document.getElementById('subjectTitle').textContent = `${subject.name} (${subject.nameEn})`;
  
  document.getElementById('lecturesList').innerHTML = lectures.map(lec => {
    const hasAccess = userLectures.includes(lec.id);
    const isFree = lec.price === 'free';
    
    if (hasAccess) {
      return `
        <div class="lecture-capsule" onclick="openLecture('${lec.url}')">
          <div class="lecture-icon-box">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="lecture-info">
            <h3>${lec.title}</h3>
            <p style="margin: 0; color: #10b981; font-size: 0.9rem; font-weight: 600;">
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
        <div class="lecture-capsule lecture-locked">
          <div class="lecture-icon-box-locked">
            <i class="fas fa-gift"></i>
          </div>
          <div class="lecture-info">
            <h3>${lec.title}</h3>
            <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 600;">
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
        <div class="lecture-capsule lecture-locked">
          <div class="lecture-icon-box-locked">
            <i class="fas fa-lock"></i>
          </div>
          <div class="lecture-info">
            <h3>${lec.title}</h3>
            <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 600;">
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

// ==================== GET FREE LECTURE ====================
window.getLecture = async function(lectureId, subjectId) {
  try {
    const btn = event.target.closest('button');
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
      activatedAt[lectureId] = new Date().toISOString();
      
      await setDoc(libraryRef, {
        uid: currentUser.uid,
        lectures: lectures,
        activatedAt: activatedAt
      }, { merge: true });
      
      userLectures = lectures;
      updateLibraryCount();
      
      alert('✅ تم إضافة المحاضرة لمكتبتك بنجاح!');
      showLectures(subjectId);
    } else {
      alert('✨ المحاضرة موجودة بالفعل في مكتبتك!');
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  } catch (error) {
    console.error('Error getting lecture:', error);
    alert('❌ خطأ في الإضافة. حاول مرة أخرى.');
    const btn = event.target.closest('button');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> احصل عليها';
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
    const lecture = lectures.find(l => l.id === lectureId);
    
    if (!lecture) {
      alert('❌ محاضرة غير موجودة');
      return;
    }
    
    if (lecture.activationCode !== code) {
      alert('❌ كود التفعيل خاطئ');
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
      activatedAt[lectureId] = new Date().toISOString();
      
      await setDoc(libraryRef, {
        uid: currentUser.uid,
        lectures: userLecturesList,
        activatedAt: activatedAt
      }, { merge: true });
      
      userLectures = userLecturesList;
      updateLibraryCount();
      
      alert('🎉 تم تفعيل المحاضرة بنجاح!');
      showLectures(subjectId);
    } else {
      alert('✨ المحاضرة مفعلة بالفعل!');
    }
  } catch (error) {
    console.error('Error activating lecture:', error);
    alert('❌ خطأ في التفعيل. حاول مرة أخرى.');
  }
};

// ==================== USER MENU TOGGLE ====================
window.toggleUserMenu = function() {
  const menu = document.getElementById('userDropdownMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
};

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const userSection = document.querySelector('.user-section');
  const menu = document.getElementById('userDropdownMenu');
  
  if (menu && userSection && !userSection.contains(event.target)) {
    menu.classList.remove('active');
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

// ==================== LOAD MY LECTURES ====================
function loadMyLectures() {
  const container = document.getElementById('myLecturesList');
  
  if (!container) return;
  
  if (userLectures.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>لا توجد محاضرات بعد</h3>
        <p>ابدأ بإضافة محاضرات من قسم "جميع المواد"</p>
     
    <button onclick="showAllSubjects()" class="browse-btn">
       تصفح المواد
        </button>
      </div>
    `;
    return;
  }
  
  let myLecturesData = [];
  Object.keys(lecturesDB).forEach(subject => {
    lecturesDB[subject].forEach(lec => {
      if (userLectures.includes(lec.id)) {
        myLecturesData.push({
          ...lec,
          subject: subjects[subject].name
        });
      }
    });
  });
  
  if (myLecturesData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-sync-alt"></i>
        <h3>جاري التحميل...</h3>
        <p>الرجاء الانتظار</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = myLecturesData.map(lec => `
    <div class="lecture-capsule" onclick="openLecture('${lec.url}')" style="margin-bottom: 20px;">
      <div class="lecture-icon-box">
        <i class="fas fa-book-open"></i>
      </div>
      <div class="lecture-info">
        <h3>${lec.title}</h3>
        <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 600;">
          <i class="fas fa-tag"></i> ${lec.subject}
        </p>
      </div>
      <span class="lecture-status-active">
        <i class="fas fa-play-circle"></i> مفتوحة
      </span>
    </div>
  `).join('');
}

// ==================== SHOW ALL SUBJECTS ====================
window.showAllSubjects = function() {
  document.getElementById('myLibraryView').style.display = 'none';
  document.getElementById('lecturesView').style.display = 'none';
  document.getElementById('subjectsGrid').style.display = 'grid';
};

// ==================== NAVIGATION ====================
window.backToSubjects = function() {
  document.getElementById('subjectsGrid').style.display = 'grid';
  document.getElementById('lecturesView').style.display = 'none';
  document.getElementById('myLibraryView').style.display = 'none';
};

window.openLecture = (url) => window.location.href = url;

window.logout = async function() {
  if (confirm('هل تريد تسجيل الخروج؟')) {
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
      alert('❌ خطأ في تسجيل الخروج');
    }
  }
};

// ==================== PROFILE MODAL ====================
window.openProfile = function() {
  document.getElementById('profileModal').classList.add('active');
  const menu = document.getElementById('userDropdownMenu');
  if (menu) menu.classList.remove('active');
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
    if (avatarContainer) {
      avatarContainer.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        document.getElementById('avatarSelector').style.display = 'block';
        document.getElementById('profileFormSection').style.display = 'none';
        
        const grid = document.querySelector('.avatars-grid');
        if (grid) {
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
        }
      });
    }
  }, 500);
}

function selectAvatarNew(seed) {
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  const clickedElement = document.querySelector(`[data-seed="${seed}"]`);
  if (clickedElement) {
    clickedElement.classList.add('selected');
  }
  
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
    }).catch(error => {
      console.error('Error:', error);
      alert('❌ خطأ في حفظ الصورة');
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
    if (opt.dataset.value === value) {
      opt.classList.add('selected');
    }
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
      alert('❌ يرجى إدخال الاسم');
      return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: name,
        university: university
      });
      
      if (password && password.length >= 6) {
        await updatePassword(currentUser, password);
      }
      
      userData.name = name;
      userData.university = university;
      document.getElementById('headerUserName').textContent = name;
      document.getElementById('headerUserUniversity').textContent = university;
      
      alert('✅ تم حفظ التغييرات بنجاح!');
      closeProfile();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMsg = '❌ خطأ في الحفظ';
      if (error.code === 'auth/requires-recent-login') {
        errorMsg = '❌ يجب تسجيل الدخول مرة أخرى لتغيير كلمة المرور';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = '❌ كلمة المرور ضعيفة جداً';
      }
      
      alert(errorMsg);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> حفظ التغييرات';
      document.getElementById('profilePassword').value = '';
    }
  });
}
