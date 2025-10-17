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
  
  // Configure Moment.js for Arabic
  if (typeof moment !== 'undefined') {
    moment.locale('ar');
    console.log('✅ Moment.js configured');
  }
  
  // Configure Chart.js defaults for mobile
  if (typeof Chart !== 'undefined') {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
    console.log('✅ Chart.js configured');
  }
  
  // Force MathJax to render
  function waitForMathJax() {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      console.log('🎯 Rendering math expressions...');
      MathJax.typesetPromise().then(() => {
        console.log('✅ All math rendered successfully!');
      }).catch((err) => {
        console.error('❌ MathJax rendering error:', err);
      });
    } else {
      setTimeout(waitForMathJax, 100);
    }
  }
  
  setTimeout(waitForMathJax, 500);
  
  // Update Device Badge
  const deviceBadge = document.getElementById('deviceBadge');
  const playerInfo = document.getElementById('playerInfo');
  
  if (deviceBadge && playerInfo) {
    if (isIOS) {
      deviceBadge.textContent = deviceType + ' - Native Player 🍎';
      playerInfo.textContent = 'مشغل iOS الأصلي';
      showToast('🍎 iOS Detected - Native Player');
    } else {
      deviceBadge.textContent = deviceType + ' - Custom Player 🎮';
      playerInfo.textContent = 'مشغل مخصص متقدم';
      showToast('🎮 Custom Player Loaded');
    }
  }
  
  // Initialize Hammer.js for gestures (Non-iOS only)
  if (typeof Hammer !== 'undefined' && !isIOS) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const hammer = new Hammer(mainContent);
      hammer.on('swipeleft swiperight', function(ev) {
        console.log('Gesture detected:', ev.type);
      });
      console.log('✅ Hammer.js gestures enabled');
    }
  }

  console.log('🚀 منصة أثر - جاهزة بالكامل!');
  console.log('📚 جميع المكتبات محملة بنجاح');
  console.log('📱 Device:', deviceType);
  console.log('🎬 Player Mode:', isIOS ? 'Native iOS' : 'Custom');
});

// ==================== ADVANCED AI MESSAGE PARSER (FIXED) ====================
function parseAIMessage(text) {
  if (!text) return '';
  
  // 1. Escape HTML first
  text = text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
  
  // 2. Parse markdown formatting
  text = text.replace(/##([^#\n]+)##/g, '<h4>$1</h4>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // 3. Split into lines
  const lines = text.split('\n');
  let inList = false;
  let listType = null;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (inList) {
        result.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      result.push('<br>');
      continue;
    }
    
    if (line.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      } else if (listType !== 'ul') {
        result.push('</ol>');
        result.push('<ul>');
        listType = 'ul';
      }
      result.push('<li>' + line.substring(2) + '</li>');
      continue;
    }
    
    if (/^\d+\.\s/.test(line)) {
      if (!inList) {
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      } else if (listType !== 'ol') {
        result.push('</ul>');
        result.push('<ol>');
        listType = 'ol';
      }
      result.push('<li>' + line.replace(/^\d+\.\s/, '') + '</li>');
      continue;
    }
    
    if (inList) {
      result.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = null;
    }
    
    if (line.startsWith('---')) {
      result.push('<hr>');
      continue;
    }
    
    if (line.startsWith('> ')) {
      result.push('<blockquote>' + line.substring(2) + '</blockquote>');
      continue;
    }
    
    result.push('<p>' + line + '</p>');
  }
  
  if (inList) {
    result.push(listType === 'ul' ? '</ul>' : '</ol>');
  }
  
  return result.join('\n');
}

// ==================== ADD MESSAGE WITH PARSER ====================
window.addMessage = function(text, sender = 'ai') {
  const messagesContainer = document.getElementById('aiChatMessages');
  if (!messagesContainer) return;
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message');
  messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
  
  if (sender === 'ai') {
    messageElement.innerHTML = parseAIMessage(text);
  } else {
    messageElement.textContent = text;
  }
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    MathJax.typesetPromise([messageElement]).catch((err) => {
      console.error('MathJax render error:', err);
    });
  }
};

// ==================== TYPING INDICATOR ====================
window.showTypingIndicator = function() {
  const messagesContainer = document.getElementById('aiChatMessages');
  if (!messagesContainer) return;
  
  const existing = messagesContainer.querySelector('.typing-indicator');
  if (existing) existing.remove();
  
  const indicator = document.createElement('div');
  indicator.classList.add('chat-message', 'ai-message', 'typing-indicator');
  indicator.innerHTML = `
    <span>أثر AI يكتب</span>
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;
  
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

window.hideTypingIndicator = function() {
  const indicator = document.querySelector('.typing-indicator');
  if (indicator) indicator.remove();
};

// ==================== TRANSLATION & AI CHAT ====================
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
    document.title = isArabic ? 'منصة أثر - التعليم التفاعلي' : 'Athr Platform - Interactive Learning';
    
    if (typeof moment !== 'undefined') {
      moment.locale(isArabic ? 'ar' : 'en');
    }
    
    setTimeout(function() {
      if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch((err) => console.error('MathJax error:', err));
      }
    }, 300);
  }

  // ==================== TRANSLATION BUTTON ====================
  if (translationButton) {
    translationButton.addEventListener('click', function() {
      applyLanguage(!isArabic);
      showToast(isArabic ? '🌍 تم التبديل للعربية' : '🌍 Switched to English');
      
      setTimeout(function() {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
          MathJax.typesetPromise().catch((err) => console.error('MathJax error:', err));
        }
      }, 300);
    });
  }

  // ==================== AI CHAT BUTTON ====================
  if (aiChatButton) {
    aiChatButton.addEventListener('click', function() {
      aiChatModal.classList.add('visible');
      
      if (isFirstMessage) {
        const welcomeMsg = isArabic 
          ? `مرحباً! أنا **أثر AI**، مساعدك الأكاديمي المتخصص.

##يمكنني مساعدتك في##

- **شرح المعادلات والمفاهيم**
- **حل المسائل خطوة بخطوة**
- **توضيح الفرق بين الطرق المختلفة**
- **الإجابة على أي سؤال عن المحتوى**

اسألني أي شيء! 🎓`
          : `Hello! I'm **Athr AI**, your specialized academic assistant.

##I can help you with##

- **Explaining equations and concepts**
- **Solving problems step-by-step**
- **Clarifying differences between methods**
- **Answering any content questions**

Ask me anything! 🎓`;
        
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

  // ==================== SEND MESSAGE ====================
  async function sendMessage() {
    const userMessage = aiChatInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user');
    conversationHistory.push({ role: 'user', content: userMessage });
    
    aiChatInput.value = '';
    aiChatInput.disabled = true;
    aiChatSendBtn.disabled = true;
    
    showTypingIndicator();

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      hideTypingIndicator();
      
      const aiResponse = isArabic
        ? `شكراً لسؤالك! 🎓

##الإجابة##

هذه إجابة تجريبية من **أثر AI**. في النسخة الكاملة، سيتم الربط بـ **API حقيقي**.

**المميزات:**
- تنسيق **احترافي** للنصوص
- دعم **القوائم** والجداول
- معالجة الرموز بشكل صحيح

**يمكنك الربط مع:**
1. OpenAI GPT-4
2. Google Gemini
3. Anthropic Claude

---

هل تحتاج مساعدة إضافية؟`
        : `Thanks for your question! 🎓

##Answer##

This is a demo response from **Athr AI**. In full version, it will connect to a **real AI API**.

**Features:**
- **Professional** text formatting
- Support for **lists** and tables
- Proper symbol handling

**You can connect with:**
1. OpenAI GPT-4
2. Google Gemini
3. Anthropic Claude

---

Do you need additional help?`;
      
      addMessage(aiResponse, 'ai');
      conversationHistory.push({ role: 'assistant', content: aiResponse });
      
      setTimeout(() => {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
          MathJax.typesetPromise().catch(err => console.error('MathJax error:', err));
        }
      }, 100);

    } catch (error) {
      console.error('Error:', error);
      hideTypingIndicator();
      
      const errorMsg = isArabic
        ? `عذراً، حدث **خطأ** في الاتصال. 😔\n\nيرجى المحاولة مرة أخرى.`
        : `Sorry, a **connection error** occurred. 😔\n\nPlease try again.`;
      
      addMessage(errorMsg, 'ai');
    } finally {
      aiChatInput.disabled = false;
      aiChatSendBtn.disabled = false;
      if (aiChatInput) aiChatInput.focus();
    }
  }

  if (aiChatSendBtn) {
    aiChatSendBtn.addEventListener('click', sendMessage);
  }
  
  if (aiChatInput) {
    aiChatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ==================== QUESTION TOGGLE ====================
  window.toggleQuestion = function(element) {
    const container = element.closest('.question-container');
    const content = element.nextElementSibling;
    
    container.classList.toggle('open');
    
    if (container.classList.contains('open')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      content.style.maxHeight = '0';
    }
  };

  // ==================== MCQ SELECTION WITH CONFETTI ====================
  const mcqOptions = document.querySelectorAll('.mcq-option');
  mcqOptions.forEach(option => {
    option.addEventListener('click', function() {
      const isCorrect = this.getAttribute('data-answer') === 'correct';
      const allOptions = this.closest('.mcq-options').querySelectorAll('.mcq-option');
      const solutionContent = this.closest('.question-content').querySelector('.solution-content');
      
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
              origin: { y: 0.6 },
              colors: ['#16a34a', '#22c55e', '#4ade80']
            });
          }
          showToast('✅ إجابة صحيحة!');
          
          if (solutionContent) {
            setTimeout(() => {
              solutionContent.style.display = 'block';
              
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise([solutionContent]).catch(err => {
                  console.error('MathJax error:', err);
                });
              }
            }, 1000);
          }
        } else {
          this.classList.add('incorrect');
          this.innerHTML += ' ✗';
          showToast('❌ إجابة خاطئة');
          
          allOptions.forEach(opt => {
            if (opt.getAttribute('data-answer') === 'correct') {
              setTimeout(() => {
                opt.classList.add('correct');
                opt.innerHTML += ' ✓ (الإجابة الصحيحة)';
              }, 800);
            }
          });
          
          if (solutionContent) {
            setTimeout(() => {
              solutionContent.style.display = 'block';
              
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise([solutionContent]).catch(err => {
                  console.error('MathJax error:', err);
                });
              }
            }, 1500);
          }
        }
      }, 300);
    });
  });

  console.log('✅ Main Application Ready');
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
  const loadingSpinner = document.getElementById('loadingSpinner');
  const tapLeft = document.getElementById('tapLeft');
  const tapRight = document.getElementById('tapRight');

  if (!videoPlayer || !video) {
    console.log('Video player elements not found');
    return;
  }

  let controlsTimeout;
  let isDragging = false;
  let tapTimeout, tapCount = 0, lastTapX = 0;
  let isFullscreen = false;
  let currentSourceIndex = 0;

  function init() {
    loadVideo();
    
    if (isIOS) {
      video.controls = true;
      console.log('✅ iOS: Native controls');
    } else {
      video.controls = false;
      setupCustomControls();
      setupHammerGestures();
      console.log('✅ Custom controls');
    }
    
    setupEventListeners();
  }

  function loadVideo() {
    video.src = VIDEO_SOURCES[currentSourceIndex];
    video.load();
  }

  function toggleFullscreen() {
    if (!isFullscreen) {
      videoPlayer.classList.add('fullscreen-mode');
      if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
      } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
      }
      isFullscreen = true;
      showControls();
      if (videoBars) {
        setTimeout(() => videoBars.classList.add('hidden'), 5000);
      }
    } else {
      exitFullscreen();
    }
  }

  function exitFullscreen() {
    videoPlayer.classList.remove('fullscreen-mode');
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    isFullscreen = false;
    if (videoBars) videoBars.classList.remove('hidden');
  }

  function showControls() {
    if (!isFullscreen) return;
    videoPlayer.classList.add('show-controls');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (!video.paused && !isDragging) videoPlayer.classList.remove('show-controls');
    }, 3000);
  }

  function togglePlay() {
    if (video.paused) {
      video.play().catch(err => {
        console.log('Play failed:', err);
        if (currentSourceIndex < VIDEO_SOURCES.length - 1) {
          currentSourceIndex++;
          loadVideo();
          video.play().catch(e => console.log('All sources failed'));
        }
      });
    } else {
      video.pause();
    }
  }

  function skipBackward() {
    video.currentTime = Math.max(0, video.currentTime - 10);
    if (tapLeft) showTapIndicator('left');
  }

  function skipForwardFunc() {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    if (tapRight) showTapIndicator('right');
  }

  function showTapIndicator(side) {
    const indicator = side === 'left' ? tapLeft : tapRight;
    if (indicator) {
      indicator.classList.add('active');
      setTimeout(() => indicator.classList.remove('active'), 500);
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

  function handleSeek(e, el) {
    const rect = el.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const time = percent * video.duration;
    if (!isNaN(time)) {
      video.currentTime = time;
      const progress = percent * 100;
      if (simpleProgressFilled) simpleProgressFilled.style.width = `${progress}%`;
      if (progressFilled) progressFilled.style.width = `${progress}%`;
    }
  }

  function setupCustomControls() {
    if (simplePlayBtn) simplePlayBtn.addEventListener('click', togglePlay);
    if (simpleFullscreenBtn) simpleFullscreenBtn.addEventListener('click', toggleFullscreen);
    if (simpleProgress) simpleProgress.addEventListener('click', (e) => handleSeek(e, simpleProgress));

    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (skipBack) skipBack.addEventListener('click', skipBackward);
    if (skipForward) skipForward.addEventListener('click', skipForwardFunc);
    if (closeBtn) closeBtn.addEventListener('click', exitFullscreen);
    
    if (volumeBtn) {
      volumeBtn.addEventListener('click', () => {
        video.muted = !video.muted;
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        video.volume = volumeSlider.value;
        video.muted = false;
      });
    }

    if (progressWrapper) {
      progressWrapper.addEventListener('click', (e) => handleSeek(e, progressWrapper));
    }

    video.addEventListener('click', (e) => {
      if (!isFullscreen) {
        togglePlay();
        return;
      }

      tapCount++;
      lastTapX = e.clientX || (e.touches && e.touches[0].clientX);
      clearTimeout(tapTimeout);

      if (tapCount === 1) {
        tapTimeout = setTimeout(() => {
          togglePlay();
          tapCount = 0;
        }, 300);
      } else if (tapCount === 2) {
        const rect = video.getBoundingClientRect();
        (lastTapX - rect.left > rect.width / 2 ? skipForwardFunc : skipBackward)();
        tapCount = 0;
      }
    });

    videoPlayer.addEventListener('mousemove', showControls);
    videoPlayer.addEventListener('touchstart', showControls);

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForwardFunc();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    });
  }

  function setupHammerGestures() {
    if (typeof Hammer === 'undefined') return;
    
    const hammer = new Hammer(video);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    
    hammer.on('swipeleft', () => skipForwardFunc());
    hammer.on('swiperight', () => skipBackward());
    
    console.log('✅ Hammer.js video gestures');
  }

  function setupEventListeners() {
    if (loadingSpinner) {
      video.addEventListener('loadstart', () => loadingSpinner.classList.add('active'));
      video.addEventListener('canplay', () => loadingSpinner.classList.remove('active'));
      video.addEventListener('waiting', () => loadingSpinner.classList.add('active'));
      video.addEventListener('playing', () => loadingSpinner.classList.remove('active'));
    }
    
    video.addEventListener('error', (e) => {
      console.log('Video error:', e);
      if (loadingSpinner) loadingSpinner.classList.remove('active');
      if (currentSourceIndex < VIDEO_SOURCES.length - 1) {
        currentSourceIndex++;
        console.log('Trying next source');
        loadVideo();
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
      showControls();
    });

    video.addEventListener('timeupdate', updateProgress);
    
    video.addEventListener('progress', () => {
      if (video.buffered.length > 0 && video.duration && progressBuffered) {
        progressBuffered.style.width = `${(video.buffered.end(0) / video.duration) * 100}%`;
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) exitFullscreen();
    });
  }

  init();
})();

// ==================== TIMER WIDGET (FIXED WITH POMODORO) ====================
(function() {
  'use strict';

  class TimerWidget {
    constructor() {
      this.startTime = Date.now();
      this.readingTimerInterval = null;
      this.pomodoroInterval = null;
      this.pomodoroTime = 25 * 60; // 25 minutes in seconds
      this.isPomodoroMode = false;
      this.isPomodoroRunning = false;
      this.isMenuSticky = false;
      this.init();
    }

    init() {
      this.setupElements();
      this.setupEventListeners();
      this.startReadingTimer();
      console.log('✅ Timer Widget with Pomodoro initialized');
    }

    setupElements() {
      this.widget = document.getElementById('timerWidget');
      this.readingMode = document.getElementById('readingMode');
      this.pomodoroMode = document.getElementById('pomodoroMode');
      this.timerValue = document.getElementById('timerValue');
      this.pomodoroTimeEl = document.getElementById('pomodoroTime');
      this.timerMenu = document.getElementById('timerMenu');
      this.switchToPomodoroBtn = document.getElementById('switchToPomodoroBtn');
      this.switchToReadingBtn = document.getElementById('switchToReadingBtn');
      this.startPomodoroBtn = document.getElementById('startPomodoroBtn');
      this.pausePomodoroBtn = document.getElementById('pausePomodoroBtn');
      this.resetPomodoroBtn = document.getElementById('resetPomodoroBtn');
    }

    setupEventListeners() {
      // Click on widget to toggle sticky menu
      if (this.widget) {
        this.widget.addEventListener('click', (e) => {
          if (!e.target.closest('.timer-menu')) {
            this.toggleStickyMenu();
          }
        });
      }

      // Switch to Pomodoro
      if (this.switchToPomodoroBtn) {
        this.switchToPomodoroBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.switchToPomodoro();
          this.hideStickyMenu();
        });
      }

      // Switch to Reading
      if (this.switchToReadingBtn) {
        this.switchToReadingBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.switchToReading();
          this.hideStickyMenu();
        });
      }

      // Pomodoro controls
      if (this.startPomodoroBtn) {
        this.startPomodoroBtn.addEventListener('click', () => this.startPomodoro());
      }

      if (this.pausePomodoroBtn) {
        this.pausePomodoroBtn.addEventListener('click', () => this.pausePomodoro());
      }

      if (this.resetPomodoroBtn) {
        this.resetPomodoroBtn.addEventListener('click', () => this.resetPomodoro());
      }

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isMenuSticky && !this.widget.contains(e.target)) {
          this.hideStickyMenu();
        }
      });
    }

    toggleStickyMenu() {
      this.isMenuSticky = !this.isMenuSticky;
      
      if (this.isMenuSticky) {
        this.widget.classList.add('menu-sticky');
        this.timerMenu.classList.add('sticky');
      } else {
        this.hideStickyMenu();
      }
    }

    hideStickyMenu() {
      this.isMenuSticky = false;
      this.widget.classList.remove('menu-sticky');
      this.timerMenu.classList.remove('sticky');
    }

    startReadingTimer() {
      if (this.timerValue) {
        this.timerValue.textContent = '0';
        
        this.readingTimerInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.startTime) / 60000);
          this.timerValue.textContent = elapsed;
        }, 60000);
      }
    }

    stopReadingTimer() {
      if (this.readingTimerInterval) {
        clearInterval(this.readingTimerInterval);
      }
    }

    switchToPomodoro() {
      this.isPomodoroMode = true;
      this.stopReadingTimer();
      
      this.readingMode.style.display = 'none';
      this.pomodoroMode.style.display = 'flex';
      this.switchToPomodoroBtn.style.display = 'none';
      this.switchToReadingBtn.style.display = 'flex';
      
      this.pomodoroTime = 25 * 60;
      this.updatePomodoroDisplay();
      
      showToast('⏲️ وضع بومودورو');
    }

    switchToReading() {
      this.isPomodoroMode = false;
      this.pausePomodoro();
      
      this.readingMode.style.display = 'flex';
      this.pomodoroMode.style.display = 'none';
      this.switchToPomodoroBtn.style.display = 'flex';
      this.switchToReadingBtn.style.display = 'none';
      
      this.startReadingTimer();
      
      showToast('📖 وضع القراءة');
    }

    updatePomodoroDisplay() {
      const minutes = Math.floor(this.pomodoroTime / 60);
      const seconds = this.pomodoroTime % 60;
      if (this.pomodoroTimeEl) {
        this.pomodoroTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }

    startPomodoro() {
      if (this.isPomodoroRunning) return;
      
      this.isPomodoroRunning = true;
      this.startPomodoroBtn.style.display = 'none';
      this.pausePomodoroBtn.style.display = 'flex';
      
      this.pomodoroInterval = setInterval(() => {
        this.pomodoroTime--;
        this.updatePomodoroDisplay();
        
        if (this.pomodoroTime <= 0) {
          this.completePomodoro();
        }
      }, 1000);
      
      showToast('▶️ بدأ المؤقت');
    }

    pausePomodoro() {
      if (!this.isPomodoroRunning) return;
      
      this.isPomodoroRunning = false;
      clearInterval(this.pomodoroInterval);
      this.startPomodoroBtn.style.display = 'flex';
      this.pausePomodoroBtn.style.display = 'none';
      
      showToast('⏸️ تم إيقاف المؤقت');
    }

    resetPomodoro() {
      this.pausePomodoro();
      this.pomodoroTime = 25 * 60;
      this.updatePomodoroDisplay();
      
      showToast('🔄 تم إعادة التعيين');
    }

    completePomodoro() {
      this.pausePomodoro();
      this.pomodoroTime = 25 * 60;
      this.updatePomodoroDisplay();
      
      showToast('🎉 انتهى المؤقت!');
      
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.timerWidget = new TimerWidget();
    });
  } else {
    window.timerWidget = new TimerWidget();
  }
})();

// ==================== MERMAID INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#16a34a',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#22c55e',
        lineColor: '#64748b',
        secondaryColor: '#3b82f6',
        tertiaryColor: '#f59e0b',
        background: '#ffffff',
        fontFamily: 'Cairo, sans-serif'
      }
    });

    setTimeout(() => {
      mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      console.log('✅ Mermaid diagrams initialized');
    }, 1000);
  }
});

// ==================== CONFETTI FUNCTION ====================
window.launchConfetti = function() {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7']
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
    
    showToast('🎉 احتفال رائع!');
  }
};

// ==================== SCROLL PROGRESS ====================
document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-medium));
    z-index: 10000;
    transition: width 0.1s ease;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
});

// ==================== FINAL CONSOLE ====================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 منصة أثر - تم التحميل بنجاح!');
console.log('✅ iOS Detection');
console.log('✅ AI Chat with Markdown');
console.log('✅ Video Player');
console.log('✅ Timer Widget');
console.log('✅ MCQ with Confetti');
console.log('✅ All Features Ready!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
