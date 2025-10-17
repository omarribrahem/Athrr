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
  
  console.log('🚀 Starting initialization...');
  
  // 1. AOS - Animate On Scroll
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true,
      offset: 100,
      delay: 0,
      anchorPlacement: 'top-bottom'
    });
    console.log('✅ AOS initialized');
  }
  
  // 2. Mermaid Diagrams
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
  
  // 3. Marked.js - Markdown
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false
    });
    console.log('✅ Marked.js configured');
  }
  
  // 4. Moment.js - Arabic
  if (typeof moment !== 'undefined') {
    moment.locale('ar');
    console.log('✅ Moment.js configured');
  }
  
  // 5. Chart.js Defaults
  if (typeof Chart !== 'undefined') {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
    console.log('✅ Chart.js configured');
  }
  
  // 6. KaTeX - Auto-render Math
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false}
      ]
    });
    console.log('✅ KaTeX auto-render initialized');
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
    
    // Re-initialize AOS
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
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

  // ==================== MCQ/QUIZ SELECTION ====================
  const quizOptions = document.querySelectorAll('.quiz-option');
  quizOptions.forEach(option => {
    option.addEventListener('click', function() {
      const isCorrect = this.getAttribute('data-answer') === 'correct';
      const allOptions = this.parentNode.querySelectorAll('.quiz-option');
      
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
  
  const simplePlayBtn = document.getElementById('simplePlayBtn');
  const simpleFullscreenBtn = document.getElementById('simpleFullscreenBtn');
  const simpleProgress = document.getElementById('simpleProgress');
  const simpleProgressFilled = document.getElementById('simpleProgressFilled');
  const simpleCurrentTime = document.getElementById('simpleCurrentTime');
  const simpleDuration = document.getElementById('simpleDuration');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (!videoPlayer || !video) {
    console.log('Video player elements not found - skipping initialization');
    return;
  }

  let currentSourceIndex = 0;

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
    if (video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      if (simpleProgressFilled) simpleProgressFilled.style.width = `${progress}%`;
      const timeStr = formatTime(video.currentTime);
      if (simpleCurrentTime) simpleCurrentTime.textContent = timeStr;
    }
  }

  function setupCustomControls() {
    if (simplePlayBtn) simplePlayBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    
    if (simpleFullscreenBtn) {
      simpleFullscreenBtn.addEventListener('click', () => {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen();
        }
      });
    }
    
    if (simpleProgress) {
      simpleProgress.addEventListener('click', (e) => {
        const rect = simpleProgress.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
      });
    }
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
    });

    video.addEventListener('play', () => {
      videoPlayer.classList.remove('paused');
      if (simplePlayBtn) simplePlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });

    video.addEventListener('pause', () => {
      videoPlayer.classList.add('paused');
      if (simplePlayBtn) simplePlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    video.addEventListener('timeupdate', updateProgress);
  }

  init();
})();
// ==================== ADVANCED ANIMATIONS SETUP ====================
document.addEventListener('DOMContentLoaded', function() {
  
  // 1. GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
    
    // Parallax Effect
    gsap.utils.toArray('.parallax').forEach(element => {
      gsap.to(element, {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
    
    console.log('✅ GSAP ScrollTrigger initialized');
  }
  
  // 2. Splitting.js for Text Animation
  if (typeof Splitting !== 'undefined') {
    Splitting();
    console.log('✅ Splitting.js initialized');
  }
  
  // 3. ScrollReveal
  if (typeof ScrollReveal !== 'undefined') {
    ScrollReveal().reveal('.reveal-left', {
      origin: 'left',
      distance: '50px',
      duration: 1000,
      delay: 200,
      easing: 'cubic-bezier(0.5, 0, 0, 1)'
    });
    
    ScrollReveal().reveal('.reveal-right', {
      origin: 'right',
      distance: '50px',
      duration: 1000,
      delay: 200
    });
    
    ScrollReveal().reveal('.reveal-up', {
      origin: 'bottom',
      distance: '50px',
      duration: 1000,
      delay: 200
    });
    
    console.log('✅ ScrollReveal initialized');
  }
  
  // 4. Vanilla Tilt for Cards
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.tilt-card'), {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.3
    });
    console.log('✅ VanillaTilt initialized');
  }
  
  // 5. Rellax Parallax
  if (typeof Rellax !== 'undefined' && document.querySelector('.rellax')) {
    const rellax = new Rellax('.rellax', {
      speed: -2,
      center: false,
      wrapper: null,
      round: true,
      vertical: true,
      horizontal: false
    });
    console.log('✅ Rellax initialized');
  }
  
  // 6. Tippy.js Tooltips
  if (typeof tippy !== 'undefined') {
    tippy('[data-tippy-content]', {
      animation: 'scale',
      theme: 'athr',
      placement: 'top',
      arrow: true
    });
    console.log('✅ Tippy.js initialized');
  }
  
  // 7. Medium Zoom - Image Zooming
  if (typeof mediumZoom !== 'undefined') {
    mediumZoom('.zoomable', {
      margin: 24,
      background: 'rgba(0, 0, 0, 0.9)',
      scrollOffset: 0
    });
    console.log('✅ Medium Zoom initialized');
  }
  
  // 8. LazyLoad - Optimize Image Loading
  if (typeof LazyLoad !== 'undefined') {
    const lazyLoadInstance = new LazyLoad({
      elements_selector: ".lazy",
      threshold: 0
    });
    console.log('✅ LazyLoad initialized');
  }
  
  console.log('🎨 All animation libraries loaded!');
});

// ==================== 3D BACKGROUND SETUP ====================
document.addEventListener('DOMContentLoaded', function() {
  
  // Vanta.js 3D Background
  if (typeof VANTA !== 'undefined' && typeof THREE !== 'undefined' && document.getElementById('vanta-bg')) {
    
    // Option A: Animated Waves (الافتراضي)
    try {
      VANTA.WAVES({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x16a34a,
        shininess: 40.00,
        waveHeight: 15.00,
        waveSpeed: 0.75,
        zoom: 0.80
      });
      console.log('✅ Vanta.js 3D Waves background initialized');
    } catch (e) {
      console.log('⚠️ Vanta.js not available');
    }
    
    // لو عايز تغير للـ Network بدل Waves، استبدل الكود فوق بده:
    /*
    VANTA.NET({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x16a34a,
      backgroundColor: 0xf0fdf4,
      points: 8.00,
      maxDistance: 20.00,
      spacing: 15.00
    });
    */
  }
});

// ==================== LOCOMOTIVE SCROLL ====================
document.addEventListener('DOMContentLoaded', function() {
  
  if (typeof LocomotiveScroll !== 'undefined' && document.querySelector('[data-scroll-container]')) {
    const scroll = new LocomotiveScroll({
      el: document.querySelector('[data-scroll-container]'),
      smooth: true,
      smartphone: {
        smooth: true
      },
      tablet: {
        smooth: true
      },
      multiplier: 1.0,
      lerp: 0.05,
      class: 'is-inview'
    });
    
    // Update on window resize
    window.addEventListener('resize', () => {
      scroll.update();
    });
    
    console.log('✅ Locomotive Scroll initialized');
  }
});

// ==================== SCROLLMAGIC ====================
document.addEventListener('DOMContentLoaded', function() {
  
  if (typeof ScrollMagic !== 'undefined') {
    const controller = new ScrollMagic.Controller();
    
    // Pin sections while scrolling
    document.querySelectorAll('.pin-section').forEach(section => {
      new ScrollMagic.Scene({
        triggerElement: section,
        triggerHook: 0,
        duration: '100%'
      })
      .setPin(section)
      .addTo(controller);
    });
    
    // Fade in elements
    document.querySelectorAll('.fade-in-scroll').forEach(element => {
      new ScrollMagic.Scene({
        triggerElement: element,
        triggerHook: 0.8,
        reverse: false
      })
      .setClassToggle(element, 'visible')
      .addTo(controller);
    });
    
    console.log('✅ ScrollMagic initialized');
  }
});

// ==================== INTERSECTION OBSERVER ====================
document.addEventListener('DOMContentLoaded', function() {
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        
        // Trigger custom animations
        if (entry.target.hasAttribute('data-animate')) {
          const animationType = entry.target.getAttribute('data-animate');
          triggerAnimation(entry.target, animationType);
        }
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.observe').forEach(element => {
    observer.observe(element);
  });
  
  console.log('✅ Intersection Observer initialized');
});

// ==================== CUSTOM ANIMATION FUNCTIONS ====================

// Stagger Animation
function staggerAnimation(selector, delay = 100) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: selector,
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(delay),
      duration: 800,
      easing: 'easeOutExpo'
    });
  }
}

// Fade In Up
function fadeInUp(element) {
  if (typeof gsap !== 'undefined') {
    gsap.from(element, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
    });
  }
}

// Scale In
function scaleIn(element) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: element,
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutBack'
    });
  }
}

// Rotate In
function rotateIn(element) {
  if (typeof gsap !== 'undefined') {
    gsap.from(element, {
      rotation: -180,
      opacity: 0,
      duration: 1,
      ease: 'back.out(1.7)'
    });
  }
}

// Bounce In
function bounceIn(element) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: element,
      translateY: [-50, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutBounce'
    });
  }
}

// Shake Animation
function shake(element) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: element,
      translateX: [
        { value: -10, duration: 50 },
        { value: 10, duration: 50 },
        { value: -10, duration: 50 },
        { value: 10, duration: 50 },
        { value: 0, duration: 50 }
      ],
      easing: 'easeInOutSine'
    });
  }
}

// Pulse Animation
function pulse(element) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: element,
      scale: [1, 1.1, 1],
      duration: 500,
      easing: 'easeInOutQuad'
    });
  }
}

// Trigger Animation
function triggerAnimation(element, type) {
  switch(type) {
    case 'fadeIn':
      fadeInUp(element);
      break;
    case 'scale':
      scaleIn(element);
      break;
    case 'rotate':
      rotateIn(element);
      break;
    case 'bounce':
      bounceIn(element);
      break;
    default:
      fadeInUp(element);
  }
}

// Export for global use
window.staggerAnimation = staggerAnimation;
window.fadeInUp = fadeInUp;
window.scaleIn = scaleIn;
window.rotateIn = rotateIn;
window.bounceIn = bounceIn;
window.shake = shake;
window.pulse = pulse;
window.triggerAnimation = triggerAnimation;

// ==================== SCROLL PROGRESS INDICATOR ====================
(function() {
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-medium));
    z-index: 10000;
    transition: width 0.1s ease;
    box-shadow: var(--shadow-glow);
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = Math.min(scrolled, 100) + '%';
  });
})();

// ==================== SECTION PROGRESS INDICATORS ====================
function createSectionProgress() {
  const sections = document.querySelectorAll('section.glassy-card');
  if (sections.length === 0) return;
  
  const nav = document.createElement('nav');
  nav.className = 'section-progress';
  nav.style.cssText = `
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 15px;
  `;
  
  sections.forEach((section, index) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(22, 163, 74, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    `;
    
    dot.addEventListener('click', () => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    dot.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(1.5)';
      dot.style.background = 'var(--color-primary)';
    });
    
    dot.addEventListener('mouseleave', () => {
      dot.style.transform = 'scale(1)';
      if (!section.classList.contains('in-view')) {
        dot.style.background = 'rgba(22, 163, 74, 0.3)';
      }
    });
    
    // Observe section visibility
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          dot.style.background = 'var(--color-primary)';
          dot.style.transform = 'scale(1.3)';
        } else {
          dot.style.background = 'rgba(22, 163, 74, 0.3)';
          dot.style.transform = 'scale(1)';
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(section);
    nav.appendChild(dot);
  });
  
  document.body.appendChild(nav);
}

// Initialize section progress on load
document.addEventListener('DOMContentLoaded', createSectionProgress);

// ==================== FLASHCARDS ====================
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.flashcard').forEach(card => {
    card.addEventListener('click', function() {
      this.classList.toggle('flipped');
    });
  });
  console.log('✅ Flashcards initialized');
});

// ==================== STAT COUNTER ====================
document.addEventListener('DOMContentLoaded', function() {
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
  console.log('✅ Stat counters initialized');
});
// ==================== CHARTS INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize Chart.js Charts
  const chartElements = document.querySelectorAll('canvas[id*="Chart"]');
  
  chartElements.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    
    // Example: Production Chart
    if (canvas.id === 'productionChart') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'],
          datasets: [{
            label: 'الإنتاج الفعلي',
            data: [850, 920, 880, 950, 890],
            backgroundColor: 'rgba(22, 163, 74, 0.8)',
            borderColor: 'rgba(22, 163, 74, 1)',
            borderWidth: 2
          }, {
            label: 'الطاقة المخططة',
            data: [1000, 1000, 1000, 1000, 1000],
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
            borderDash: [5, 5]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              rtl: true,
              labels: {
                font: { family: 'Cairo, sans-serif', size: 14 },
                padding: 15
              }
            },
            title: {
              display: true,
              text: 'الإنتاج الشهري مقارنة بالطاقة المخططة',
              font: { family: 'Cairo, sans-serif', size: 16, weight: 'bold' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { family: 'Cairo, sans-serif' } }
            },
            x: {
              ticks: { font: { family: 'Cairo, sans-serif' } }
            }
          }
        }
      });
      console.log('✅ Production Chart initialized');
    }
  });
});

// ==================== READING TIME ESTIMATOR ====================
document.addEventListener('DOMContentLoaded', function() {
  const content = document.querySelector('.main-content');
  if (!content) return;
  
  // Calculate reading time (200 words per minute average)
  const text = content.innerText || content.textContent;
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);
  
  // Create reading time badge
  const badge = document.createElement('div');
  badge.className = 'reading-time-badge';
  badge.innerHTML = `
    <i class="fas fa-clock"></i>
    <span>${readingTime} دقائق قراءة</span>
  `;
  badge.style.cssText = `
    position: fixed;
    top: 80px;
    left: 20px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(25px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 10px 20px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-primary);
    z-index: 1000;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  
  document.body.appendChild(badge);
  console.log(`✅ Reading time badge added: ${readingTime} minutes`);
});

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('keydown', function(e) {
    
    // Ctrl/Cmd + K: Open AI Chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const aiChatModal = document.getElementById('aiChatModal');
      if (aiChatModal) {
        aiChatModal.classList.add('visible');
        document.getElementById('ai-chat-input')?.focus();
      }
    }
    
    // Escape: Close AI Chat
    if (e.key === 'Escape') {
      const aiChatModal = document.getElementById('aiChatModal');
      if (aiChatModal && aiChatModal.classList.contains('visible')) {
        aiChatModal.classList.remove('visible');
      }
    }
    
    // Ctrl/Cmd + L: Toggle Language
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      document.getElementById('translationButton')?.click();
    }
  });
  
  console.log('✅ Keyboard shortcuts initialized (Ctrl+K, Ctrl+L, Esc)');
});

// ==================== COPY CODE BLOCKS ====================
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('pre code').forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    `;
    
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i>';
        showToast('✅ تم النسخ!');
        setTimeout(() => {
          button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      });
    });
    
    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(button);
  });
  
  console.log('✅ Copy code buttons initialized');
});

// ==================== SMOOTH SCROLL TO ANCHOR ====================
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  console.log('✅ Smooth scroll to anchors initialized');
});

// ==================== TABLE OF CONTENTS GENERATOR ====================
function generateTableOfContents() {
  const headings = document.querySelectorAll('h2, h3');
  if (headings.length === 0) return;
  
  const toc = document.createElement('div');
  toc.className = 'table-of-contents';
  toc.style.cssText = `
    position: sticky;
    top: 100px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(25px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 30px;
    max-width: 300px;
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'المحتويات';
  title.style.cssText = 'margin-bottom: 15px; color: var(--color-primary);';
  toc.appendChild(title);
  
  const list = document.createElement('ul');
  list.style.cssText = 'list-style: none; padding: 0;';
  
  headings.forEach((heading, index) => {
    heading.id = heading.id || `section-${index}`;
    
    const li = document.createElement('li');
    li.style.cssText = `
      margin-bottom: 10px;
      padding-right: ${heading.tagName === 'H3' ? '20px' : '0'};
    `;
    
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.style.cssText = `
      color: #475569;
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: ${heading.tagName === 'H2' ? '1rem' : '0.9rem'};
    `;
    
    link.addEventListener('mouseenter', () => {
      link.style.color = 'var(--color-primary)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.color = '#475569';
    });
    
    li.appendChild(link);
    list.appendChild(li);
  });
  
  toc.appendChild(list);
  
  const firstCard = document.querySelector('.glassy-card');
  if (firstCard) {
    firstCard.insertAdjacentElement('beforebegin', toc);
    console.log('✅ Table of contents generated');
  }
}

// Uncomment to enable TOC
// document.addEventListener('DOMContentLoaded', generateTableOfContents);

// ==================== BACK TO TOP BUTTON ====================
(function() {
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 20px;
    background: rgba(22, 163, 74, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
  `;
  
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.style.display = 'flex';
    } else {
      backToTop.style.display = 'none';
    }
  });
  
  document.body.appendChild(backToTop);
  console.log('✅ Back to top button initialized');
})();

// ==================== PERFORMANCE MONITORING ====================
window.addEventListener('load', function() {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
    
    console.log('⚡ Performance Metrics:');
    console.log(`   - Page Load Time: ${(loadTime / 1000).toFixed(2)}s`);
    console.log(`   - DOM Ready Time: ${(domReady / 1000).toFixed(2)}s`);
  }
});

// ==================== ERROR HANDLER ====================
window.addEventListener('error', function(e) {
  console.error('❌ Error detected:', e.message);
  
  // Optional: Send to analytics or logging service
  // sendErrorToAnalytics(e);
});

// ==================== SERVICE WORKER (Optional) ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker
    /*
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
    */
  });
}

// ==================== NETWORK STATUS ====================
window.addEventListener('online', () => {
  showToast('✅ اتصال الإنترنت عاد');
  console.log('✅ Online');
});

window.addEventListener('offline', () => {
  showToast('⚠️ لا يوجد اتصال بالإنترنت');
  console.log('⚠️ Offline');
});

// ==================== PRINT STYLES ====================
window.addEventListener('beforeprint', () => {
  console.log('🖨️ Preparing to print...');
  // Hide interactive elements before printing
  document.querySelectorAll('.translation-button, .ai-fab-button, .video-section').forEach(el => {
    el.style.display = 'none';
  });
});

window.addEventListener('afterprint', () => {
  console.log('✅ Print completed');
  // Restore interactive elements after printing
  document.querySelectorAll('.translation-button, .ai-fab-button, .video-section').forEach(el => {
    el.style.display = '';
  });
});

// ==================== DARK MODE TOGGLE (Optional) ====================
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
  console.log(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
}

// Load dark mode preference
document.addEventListener('DOMContentLoaded', () => {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
  }
});

// Export for global use
window.toggleDarkMode = toggleDarkMode;

// ==================== CONSOLE BRANDING ====================
console.log('%c🎓 منصة أثر التعليمية', 'color: #16a34a; font-size: 24px; font-weight: bold;');
console.log('%cAthr Educational Platform', 'color: #475569; font-size: 14px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
console.log('%cVersion: 2.0.0', 'color: #64748b;');
console.log('%cAll systems ready! 🚀', 'color: #22c55e; font-weight: bold;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
// ==================== SWEETALERT2 UTILITIES ====================
window.showAlert = function(options) {
  if (typeof Swal === 'undefined') {
    alert(options.text);
    return;
  }
  
  const defaults = {
    icon: 'info',
    showConfirmButton: true,
    confirmButtonColor: '#16a34a',
    background: 'rgba(255, 255, 255, 0.95)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      confirmButton: 'custom-swal-button'
    }
  };
  
  Swal.fire({...defaults, ...options});
};

window.showSuccessAlert = function(title, text) {
  showAlert({
    icon: 'success',
    title: title,
    text: text,
    timer: 3000,
    showConfirmButton: false
  });
};

window.showErrorAlert = function(title, text) {
  showAlert({
    icon: 'error',
    title: title,
    text: text
  });
};

// ==================== TOASTIFY UTILITIES ====================
window.showToastify = function(message, type = 'info') {
  if (typeof Toastify === 'undefined') {
    showToast(message);
    return;
  }
  
  const colors = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  Toastify({
    text: message,
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
    stopOnFocus: true,
    style: {
      background: colors[type] || colors.info,
      borderRadius: '50px',
      padding: '12px 24px',
      fontWeight: '600'
    }
  }).showToast();
};

// ==================== LOCAL STORAGE UTILITIES ====================
window.storageManager = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
  
  get: function(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage error:', e);
      return defaultValue;
    }
  },
  
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
  
  clear: function() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }
};

// ==================== DEBOUNCE & THROTTLE UTILITIES ====================
window.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

window.throttle = function(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==================== RESPONSIVE UTILITIES ====================
window.isMobile = function() {
  return window.innerWidth <= 768;
};

window.isTablet = function() {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

window.isDesktop = function() {
  return window.innerWidth > 1024;
};

// Responsive event listener
window.addEventListener('resize', debounce(() => {
  console.log('Window resized:', {
    width: window.innerWidth,
    height: window.innerHeight,
    device: isMobile() ? 'Mobile' : isTablet() ? 'Tablet' : 'Desktop'
  });
  
  // Refresh AOS on resize
  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
}, 250));

// ==================== CLIPBOARD UTILITIES ====================
window.copyToClipboard = function(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✅ تم النسخ!');
    }).catch(err => {
      console.error('Copy failed:', err);
      showToast('❌ فشل النسخ');
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('✅ تم النسخ!');
    } catch (err) {
      console.error('Copy failed:', err);
      showToast('❌ فشل النسخ');
    }
    document.body.removeChild(textarea);
  }
};

// ==================== URL UTILITIES ====================
window.urlUtils = {
  getParams: function() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },
  
  getParam: function(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },
  
  setParam: function(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  },
  
  removeParam: function(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
  }
};

// ==================== DATE UTILITIES ====================
window.dateUtils = {
  formatArabic: function(date) {
    if (typeof moment !== 'undefined') {
      return moment(date).locale('ar').format('LLLL');
    }
    return new Date(date).toLocaleDateString('ar-EG');
  },
  
  formatEnglish: function(date) {
    if (typeof moment !== 'undefined') {
      return moment(date).locale('en').format('LLLL');
    }
    return new Date(date).toLocaleDateString('en-US');
  },
  
  timeAgo: function(date) {
    if (typeof moment !== 'undefined') {
      return moment(date).fromNow();
    }
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [name, seconds_in_interval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / seconds_in_interval);
      if (interval >= 1) {
        return `منذ ${interval} ${name}`;
      }
    }
    return 'الآن';
  }
};

// ==================== VALIDATION UTILITIES ====================
window.validate = {
  email: function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  phone: function(phone) {
    return /^[\d\s\-\+\(\)]+$/.test(phone);
  },
  
  url: function(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  required: function(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  minLength: function(value, min) {
    return value && value.length >= min;
  },
  
  maxLength: function(value, max) {
    return value && value.length <= max;
  }
};

// ==================== ANALYTICS (Optional) ====================
window.trackEvent = function(category, action, label) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
  
  // Console log for development
  console.log('📊 Event:', { category, action, label });
};

window.trackPageView = function(path) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      'page_path': path
    });
  }
  
  console.log('📄 Page View:', path);
};

// ==================== EXPORT ALL UTILITIES ====================
window.Athr = {
  // Animation functions
  fadeInUp,
  scaleIn,
  rotateIn,
  bounceIn,
  shake,
  pulse,
  staggerAnimation,
  triggerAnimation,
  
  // UI functions
  showToast,
  showAlert,
  showSuccessAlert,
  showErrorAlert,
  showToastify,
  copyToClipboard,
  
  // Storage
  storage: storageManager,
  
  // Utilities
  debounce,
  throttle,
  isMobile,
  isTablet,
  isDesktop,
  
  // URL & Date
  url: urlUtils,
  date: dateUtils,
  
  // Validation
  validate,
  
  // Analytics
  trackEvent,
  trackPageView,
  
  // Device info
  isIOS,
  deviceType
};

// ==================== INITIALIZATION COMPLETE ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All libraries initialized');
  console.log('✅ All utilities loaded');
  console.log('✅ All event listeners attached');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 منصة أثر جاهزة للاستخدام!');
  console.log('🎉 Athr Platform Ready!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Log available features
  console.log('Available features:');
  console.log('  - AOS Animations ✅');
  console.log('  - GSAP Animations ✅');
  console.log('  - 3D Background ✅');
  console.log('  - Video Player ✅');
  console.log('  - AI Chat ✅');
  console.log('  - Translation ✅');
  console.log('  - Charts ✅');
  console.log('  - Quiz System ✅');
  console.log('  - Flashcards ✅');
  console.log('  - Toast Notifications ✅');
  console.log('  - Keyboard Shortcuts ✅');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ==================== FINAL LOG ====================
console.log('%c▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓', 'color: #16a34a;');
console.log('%c█  Athr Platform v2.0.0   █', 'color: #16a34a; font-weight: bold;');
console.log('%c█  Built with ❤️ in Egypt  █', 'color: #16a34a;');
console.log('%c▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓', 'color: #16a34a;');

// Export to window for console access
window.AthrPlatform = {
  version: '2.0.0',
  initialized: true,
  features: [
    'AOS Animations',
    'GSAP Animations',
    '3D Background',
    'Video Player',
    'AI Chat',
    'Translation System',
    'Charts & Diagrams',
    'Quiz System',
    'Flashcards',
    'Responsive Design',
    'Accessibility',
    'Performance Optimized'
  ]
};
