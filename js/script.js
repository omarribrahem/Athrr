// ==================== iOS DETECTION ====================
function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/iPad/.test(ua)) return 'iPad 📱';
  if (/iPhone/.test(ua)) return 'iPhone 📱';
  if (/iPod/.test(ua)) return 'iPod 📱';
  if (/Android/.test(ua)) return 'Android 🤖';
  if (/Windows/.test(ua)) return 'Windows 💻';
  if (/Mac/.test(ua)) return 'Mac 💻';
  return 'Unknown Device 🖥️';
}

const isIOS = isIOSDevice();
const deviceType = getDeviceType();

if (isIOS) {
  document.body.classList.add('ios-device');
  console.log('✅ iOS Device Detected - Using Native Controls');
} else {
  console.log('✅ Non-iOS Device - Using Custom Player');
}

// ==================== TOAST NOTIFICATION ====================
window.showToast = function(message, duration = 2000) {
  const toast = document.getElementById('toastNotification');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
};

// ==================== LIBRARIES INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 50
    });
    console.log('✅ AOS initialized');
  }
  
  // Initialize Mermaid
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    });
    console.log('✅ Mermaid initialized');
  }
  
  // Configure Marked.js
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false
    });
    console.log('✅ Marked.js configured');
  }
  
  // Configure Moment.js for Arabic
  if (typeof moment !== 'undefined') {
    moment.locale('ar');
    console.log('✅ Moment.js configured');
  }
  
  // Configure Chart.js defaults
  if (typeof Chart !== 'undefined') {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
    console.log('✅ Chart.js configured');
  }
  
  // Update Device Badge
  const deviceBadge = document.getElementById('deviceBadge');
  const playerInfo = document.getElementById('playerInfo');
  
  if (deviceBadge && playerInfo) {
    if (isIOS) {
      deviceBadge.textContent = deviceType + ' - Native Player 🍎';
      playerInfo.textContent = 'مشغل iOS الأصلي - اضغط على الفيديو للتشغيل';
      showToast('🍎 iOS Detected - Native Player');
    } else {
      deviceBadge.textContent = deviceType + ' - Custom Player 🎮';
      playerInfo.textContent = 'مشغل مخصص متقدم - تحكم كامل بالإيماءات';
      showToast('🎮 Custom Player Loaded');
    }
  }

  console.log('🚀 منصة أثر - جاهزة بالكامل!');
});

// ==================== MAIN APPLICATION SCRIPT ====================
document.addEventListener('DOMContentLoaded', function() {
  const translationButton = document.getElementById('translationButton');
  const translationText = document.querySelector('.translation-text');
  const html = document.documentElement;
  const body = document.body;
  
  const aiChatButton = document.getElementById('aiChatButton');
  const aiChatModal = document.getElementById('aiChatModal');
  const aiChatCloseBtn = document.getElementById('aiChatCloseBtn');
  const aiChatMessages = document.getElementById('aiChatMessages');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiChatSendBtn = document.getElementById('ai-chat-send-btn');
  const aiChatTitle = document.getElementById('ai-chat-title');
  const aiChatButtonText = document.getElementById('aiFabText');
  
  let isArabic = true;
  let isFirstMessage = true;
  let conversationHistory = [];

  // ==================== APPLY LANGUAGE ====================
  function applyLanguage(arabic) {
    isArabic = arabic;
    const lang = isArabic ? 'ar' : 'en';
    const dir = isArabic ? 'rtl' : 'ltr';
    
    html.setAttribute('lang', lang);
    html.setAttribute('dir', dir);
    body.setAttribute('dir', dir);
    
    document.querySelectorAll('.ar-content').forEach(el => {
      el.style.display = arabic ? 'block' : 'none';
    });
    document.querySelectorAll('.en-content').forEach(el => {
      el.style.display = arabic ? 'none' : 'block';
    });
    
    if (translationText) {
      translationText.textContent = isArabic ? 'English' : 'العربية';
    }
    
    if (aiChatTitle) aiChatTitle.textContent = isArabic ? 'اسأل أثر AI' : 'Ask Athr AI';
    if (aiChatInput) aiChatInput.placeholder = isArabic ? 'اكتب سؤالك هنا...' : 'Type your question here...';
    if (aiChatButtonText) aiChatButtonText.textContent = isArabic ? 'أثر AI' : 'Athr AI';
    
    if (typeof moment !== 'undefined') {
      moment.locale(isArabic ? 'ar' : 'en');
    }
    
    // Re-initialize Reveal.js with new direction
    if (typeof Reveal !== 'undefined') {
      Reveal.configure({ rtl: isArabic });
    }
  }

  // ==================== TRANSLATION BUTTON ====================
  if (translationButton) {
    translationButton.addEventListener('click', function() {
      applyLanguage(!isArabic);
      showToast(isArabic ? '🌍 تم التبديل للعربية' : '🌍 Switched to English');
    });
  }

  // ==================== AI CHAT BUTTON ====================
  if (aiChatButton) {
    aiChatButton.addEventListener('click', function() {
      aiChatModal.classList.add('visible');
      
      if (isFirstMessage) {
        const welcomeMsg = isArabic 
          ? "مرحباً! أنا **أثر AI**، مساعدك الأكاديمي. كيف يمكنني مساعدتك؟"
          : "Hello! I'm **Athr AI**, your academic assistant. How can I help you?";
        addMessage(welcomeMsg, 'ai');
        isFirstMessage = false;
      }
      
      if (aiChatInput) aiChatInput.focus();
    });
  }

  if (aiChatCloseBtn) {
    aiChatCloseBtn.addEventListener('click', function() {
      aiChatModal.classList.remove('visible');
    });
  }

  if (aiChatModal) {
    aiChatModal.addEventListener('click', function(e) {
      if (e.target === aiChatModal) {
        aiChatModal.classList.remove('visible');
      }
    });
  }

  // ==================== ADD MESSAGE ====================
  function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);
    if (typeof marked !== 'undefined') {
      messageElement.innerHTML = marked.parse(text);
    } else {
      messageElement.textContent = text;
    }
    aiChatMessages.appendChild(messageElement);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  // ==================== SEND MESSAGE ====================
  async function sendMessage() {
    const userMessage = aiChatInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user');
    aiChatInput.value = '';
    aiChatInput.disabled = true;
    aiChatSendBtn.disabled = true;
    
    setTimeout(() => {
      const aiResponse = isArabic
        ? "شكراً لسؤالك! هذه نسخة تجريبية. سيتم الربط بـ API حقيقي قريباً 🚀"
        : "Thanks for your question! This is a demo. Real API integration coming soon 🚀";
      
      addMessage(aiResponse, 'ai');
      aiChatInput.disabled = false;
      aiChatSendBtn.disabled = false;
      if (aiChatInput) aiChatInput.focus();
    }, 1000);
  }

  if (aiChatSendBtn) {
    aiChatSendBtn.addEventListener('click', sendMessage);
  }
  
  if (aiChatInput) {
    aiChatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ==================== MCQ SELECTION ====================
  const mcqOptions = document.querySelectorAll('.mcq-option');
  mcqOptions.forEach(option => {
    option.addEventListener('click', function() {
      const isCorrect = this.getAttribute('data-answer') === 'correct';
      const allOptions = this.parentNode.querySelectorAll('.mcq-option');
      
      allOptions.forEach(opt => {
        opt.style.pointerEvents = 'none';
      });
      
      this.classList.add('selected');
      
      setTimeout(() => {
        if (isCorrect) {
          this.classList.add('correct');
          this.innerHTML += ' ✓';
          
          if (typeof confetti !== 'undefined') {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          showToast('✅ إجابة صحيحة!');
        } else {
          this.classList.add('incorrect');
          this.innerHTML += ' ✗';
          showToast('❌ إجابة خاطئة');
          
          allOptions.forEach(opt => {
            if (opt.getAttribute('data-answer') === 'correct') {
              opt.classList.add('correct');
              opt.innerHTML += ' ✓ (الإجابة الصحيحة)';
            }
          });
        }
      }, 500);
    });
  });
});

// ==================== VIDEO PLAYER SCRIPT ====================
(function() {
  'use strict';

  const VIDEO_SOURCES = [
    'https://archive.org/download/20251005_20251005_1020/%D9%84%D8%BA%D8%A9_%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84__%D9%85%D9%82%D8%AF%D9%85%D8%A9_%D9%84%D9%84%D9%85%D8%AD%D8%A7%D8%B3%D8%A8%D8%A9.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ];

  const videoPlayer = document.getElementById('videoPlayer');
  const video = document.getElementById('video');
  const videoBars = document.getElementById('videoBars');
  
  const simplePlayBtn = document.getElementById('simplePlayBtn');
  const simpleFullscreenBtn = document.getElementById('simpleFullscreenBtn');
  const simpleProgress = document.getElementById('simpleProgress');
  const simpleProgressFilled = document.getElementById('simpleProgressFilled');
  const simpleCurrentTime = document.getElementById('simpleCurrentTime');
  const simpleDuration = document.getElementById('simpleDuration');
  
  const playBtn = document.getElementById('playBtn');
  const skipBack = document.getElementById('skipBack');
  const skipForward = document.getElementById('skipForward');
  const progressWrapper = document.getElementById('progressWrapper');
  const progressFilled = document.getElementById('progressFilled');
  const progressBuffered = document.getElementById('progressBuffered');
  const currentTimeEl = document.getElementById('currentTime');
  const remainingTimeEl = document.getElementById('remainingTime');
  const volumeBtn = document.getElementById('volumeBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const closeBtn = document.getElementById('closeBtn');
  const pipBtn = document.getElementById('pipBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (!videoPlayer || !video) {
    console.log('Video player elements not found - skipping initialization');
    return;
  }

  let currentSourceIndex = 0;
  let isFullscreen = false;
  let isDragging = false;

  function init() {
    loadVideo();
    
    if (isIOS) {
      video.controls = true;
      console.log('✅ iOS: Native controls enabled');
    } else {
      video.controls = false;
      setupCustomControls();
      console.log('✅ Non-iOS: Custom controls enabled');
    }
    
    setupEventListeners();
  }

  function loadVideo() {
    video.src = VIDEO_SOURCES[currentSourceIndex];
    video.load();
  }

  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2,'0')}`;
  }

  function updateProgress() {
    if (!isDragging && video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      if (simpleProgressFilled) simpleProgressFilled.style.width = `${progress}%`;
      if (progressFilled) progressFilled.style.width = `${progress}%`;
      const timeStr = formatTime(video.currentTime);
      if (simpleCurrentTime) simpleCurrentTime.textContent = timeStr;
      if (currentTimeEl) currentTimeEl.textContent = timeStr;
      if (remainingTimeEl) remainingTimeEl.textContent = '-' + formatTime(video.duration - video.currentTime);
    }
  }

  function setupCustomControls() {
    if (simplePlayBtn) simplePlayBtn.addEventListener('click', togglePlay);
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    
    video.addEventListener('click', togglePlay);
  }

  function setupEventListeners() {
    if (loadingSpinner) {
      video.addEventListener('loadstart', () => loadingSpinner.classList.add('active'));
      video.addEventListener('canplay', () => loadingSpinner.classList.remove('active'));
    }
    
    video.addEventListener('error', () => {
      if (currentSourceIndex < VIDEO_SOURCES.length - 1) {
        currentSourceIndex++;
        loadVideo();
        showToast('⚠️ جاري تحميل مصدر بديل...');
      }
    });

    video.addEventListener('loadedmetadata', () => {
      if (simpleDuration) simpleDuration.textContent = formatTime(video.duration);
      if (remainingTimeEl) remainingTimeEl.textContent = '-' + formatTime(video.duration);
    });

    video.addEventListener('play', () => {
      videoPlayer.classList.remove('paused');
      if (simplePlayBtn) simplePlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
      if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });

    video.addEventListener('pause', () => {
      videoPlayer.classList.add('paused');
      if (simplePlayBtn) simplePlayBtn.innerHTML = '<i class="fas fa-play"></i>';
      if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    video.addEventListener('timeupdate', updateProgress);
  }

  init();
})();

// ==================== REVEAL.JS INTEGRATION ====================
document.addEventListener('DOMContentLoaded', function() {
  
  if (typeof Reveal !== 'undefined') {
    
    Reveal.initialize({
      hash: true,
      rtl: document.dir === 'rtl',
      center: true,
      slideNumber: 'c/t',
      transition: 'slide',
      backgroundTransition: 'fade',
      
      plugins: [ 
        RevealMarkdown, 
        RevealHighlight, 
        RevealNotes, 
        RevealMath.KaTeX 
      ],
      
      touch: true,
      loop: false,
      mouseWheel: false
    });
    
    console.log('✅ Reveal.js initialized');
    
    Reveal.on('slidechanged', event => {
      const currentSlide = event.currentSlide;
      
      if (typeof anime !== 'undefined') {
        animateSlideContent(currentSlide);
      }
      
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
      
      if (typeof mermaid !== 'undefined') {
        const mermaidElements = currentSlide.querySelectorAll('.mermaid');
        if (mermaidElements.length > 0) {
          mermaid.init(undefined, mermaidElements);
        }
      }
    });
    
    Reveal.on('ready', () => {
      console.log('✅ Reveal.js ready');
      const firstSlide = Reveal.getCurrentSlide();
      if (firstSlide && typeof anime !== 'undefined') {
        animateSlideContent(firstSlide);
      }
    });
  }
  
  // ==================== SLIDE ANIMATIONS ====================
  window.animateSlideContent = function(slide) {
    if (!slide || typeof anime === 'undefined') return;
    
    const titles = slide.querySelectorAll('h1, h2, h3');
    if (titles.length > 0) {
      anime({
        targets: titles,
        opacity: [0, 1],
        translateY: [-30, 0],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'easeOutQuad'
      });
    }
    
    const paragraphs = slide.querySelectorAll('.narrative-content p');
    if (paragraphs.length > 0) {
      anime({
        targets: paragraphs,
        opacity: [0, 1],
        translateX: [document.dir === 'rtl' ? 20 : -20, 0],
        duration: 600,
        delay: anime.stagger(80, {start: 300}),
        easing: 'easeOutQuad'
      });
    }
  };
  
  // ==================== FLASHCARDS ====================
  document.querySelectorAll('.flashcard').forEach(card => {
    card.addEventListener('click', function() {
      this.classList.toggle('flipped');
    });
  });
  
  // ==================== STAT COUNTER ====================
  document.querySelectorAll('.stat-value').forEach(el => {
    const target = parseInt(el.getAttribute('data-value'));
    if (!target) return;
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 30);
  });
});

// ==================== SCROLL PROGRESS ====================
(function() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; width: 0%; height: 4px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-medium));
    z-index: 10000; transition: width 0.1s;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = Math.min(scrolled, 100) + '%';
  });
})();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 منصة أثر جاهزة!');
console.log('📱 الجهاز:', deviceType);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
