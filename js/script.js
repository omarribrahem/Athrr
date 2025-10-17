// ==================== iOS DETECTION ====================
function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/iPad/.test(ua)) return 'iPad ðŸ“±';
  if (/iPhone/.test(ua)) return 'iPhone ðŸ“±';
  if (/iPod/.test(ua)) return 'iPod ðŸ“±';
  if (/Android/.test(ua)) return 'Android ðŸ¤–';
  if (/Windows/.test(ua)) return 'Windows ðŸ’»';
  if (/Mac/.test(ua)) return 'Mac ðŸ’»';
  return 'Unknown Device ðŸ–¥ï¸';
}

const isIOS = isIOSDevice();
const deviceType = getDeviceType();

// Ø¥Ø¶Ø§ÙØ© class Ù„Ù„Ù€ body Ø¥Ø°Ø§ ÙƒØ§Ù† iOS
if (isIOS) {
  document.body.classList.add('ios-device');
  console.log('âœ… iOS Device Detected - Using Native Controls');
} else {
  console.log('âœ… Non-iOS Device - Using Custom Player');
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
  
  // FastClick
  if (typeof FastClick !== 'undefined') {
    FastClick.attach(document.body);
    console.log('âœ… FastClick enabled');
  }
  
  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 50
    });
    console.log('âœ… AOS initialized');
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
    console.log('âœ… Mermaid initialized');
  }
  
  // Configure Marked.js
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false
    });
    console.log('âœ… Marked.js configured');
  }
  
  // Configure Moment.js for Arabic
  if (typeof moment !== 'undefined') {
    moment.locale('ar');
    console.log('âœ… Moment.js configured');
  }
  
  // Configure Chart.js defaults for mobile
  if (typeof Chart !== 'undefined') {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
    console.log('âœ… Chart.js configured for mobile');
  }
  
  // Force MathJax to render
  function waitForMathJax() {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      console.log('ðŸŽ¯ Rendering math expressions...');
      MathJax.typesetPromise().then(() => {
        console.log('âœ… All math rendered successfully!');
      }).catch((err) => {
        console.error('âŒ MathJax rendering error:', err);
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
      deviceBadge.textContent = deviceType + ' - Native Player ðŸŽ';
      playerInfo.textContent = 'Ù…Ø´ØºÙ„ iOS Ø§Ù„Ø£ØµÙ„ÙŠ - Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ù„Ù„ØªØ´ØºÙŠÙ„';
      showToast('ðŸŽ iOS Detected - Native Player');
    } else {
      deviceBadge.textContent = deviceType + ' - Custom Player ðŸŽ®';
      playerInfo.textContent = 'Ù…Ø´ØºÙ„ Ù…Ø®ØµØµ Ù…ØªÙ‚Ø¯Ù… - ØªØ­ÙƒÙ… ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„Ø¥ÙŠÙ…Ø§Ø¡Ø§Øª';
      showToast('ðŸŽ® Custom Player Loaded');
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
      console.log('âœ… Hammer.js gestures enabled');
    }
  }

  console.log('ðŸš€ Ù…Ù†ØµØ© Ø£Ø«Ø± - Ø¬Ø§Ù‡Ø²Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„!');
  console.log('ðŸ“š Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…ÙƒØªØ¨Ø§Øª Ù…Ø­Ù…Ù„Ø© Ø¨Ù†Ø¬Ø§Ø­');
  console.log('ðŸ“± Device:', deviceType);
  console.log('ðŸŽ¬ Player Mode:', isIOS ? 'Native iOS' : 'Custom');
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

  // ==================== TYPING INDICATOR ====================
  function showTypingIndicator(show) {
    const existingIndicator = aiChatMessages.querySelector('.typing-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    if (show) {
      const indicatorElement = document.createElement('div');
      indicatorElement.classList.add('chat-message', 'ai-message', 'typing-indicator');
      indicatorElement.innerHTML = '<span>Ø£Ø«Ø± AI ÙŠÙƒØªØ¨ Ø§Ù„Ø¢Ù†</span><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
      aiChatMessages.appendChild(indicatorElement);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
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
  
  // ==================== APPLY LANGUAGE ====================
  function applyLanguage(arabic) {
    isArabic = arabic;
    const lang = isArabic ? 'ar' : 'en';
    const dir = isArabic ? 'rtl' : 'ltr';
    
    html.setAttribute('lang', lang);
    html.setAttribute('dir', dir);
    body.setAttribute('dir', dir);
    
    // Ø¥Ø®ÙØ§Ø¡/Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø­Ø³Ø¨ Ø§Ù„Ù„ØºØ©
    document.querySelectorAll('.ar-content').forEach(el => {
      el.style.display = arabic ? 'block' : 'none';
    });
    document.querySelectorAll('.en-content').forEach(el => {
      el.style.display = arabic ? 'none' : 'block';
    });
    
    if (translationText) {
      translationText.textContent = isArabic ? 'English' : 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©';
    }
    document.title = isArabic ? 'Ù…Ù†ØµØ© Ø£Ø«Ø± - Ø§Ù„ØªØ¹Ù„ÙŠÙ… Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠ' : 'Athr Platform - Interactive Learning';
    
    if (aiChatTitle) aiChatTitle.textContent = isArabic ? 'Ø§Ø³Ø£Ù„ Ø£Ø«Ø± AI' : 'Ask Athr AI';
    if (aiChatInput) aiChatInput.placeholder = isArabic ? 'Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ùƒ Ù‡Ù†Ø§...' : 'Type your question here...';
    if (aiChatButtonText) aiChatButtonText.textContent = isArabic ? 'Ø£Ø«Ø± AI' : 'Athr AI';
    
    // Update moment.js locale
    if (typeof moment !== 'undefined') {
      moment.locale(isArabic ? 'ar' : 'en');
    }
    
    // Re-render MathJax after language switch
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
      showToast(isArabic ? 'ðŸŒ ØªÙ… Ø§Ù„ØªØ¨Ø¯ÙŠÙ„ Ù„Ù„Ø¹Ø±Ø¨ÙŠØ©' : 'ðŸŒ Switched to English');
      
      // Re-render MathJax after language switch
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
          ? "Ù…Ø±Ø­Ø¨Ø§Ù‹! Ø£Ù†Ø§ **Ø£Ø«Ø± AI**ØŒ Ù…Ø³Ø§Ø¹Ø¯Ùƒ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ Ø§Ù„Ù…ØªØ®ØµØµ. ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ ÙÙŠ:\n\n- **Ø´Ø±Ø­ Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª ÙˆØ§Ù„Ù…ÙØ§Ù‡ÙŠÙ…**\n- **Ø­Ù„ Ø§Ù„Ù…Ø³Ø§Ø¦Ù„ Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ©**\n- **ØªÙˆØ¶ÙŠØ­ Ø§Ù„ÙØ±Ù‚ Ø¨ÙŠÙ† Ø§Ù„Ø·Ø±Ù‚ Ø§Ù„Ù…Ø®ØªÙ„ÙØ©**\n- **Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø¹Ù„Ù‰ Ø£ÙŠ Ø³Ø¤Ø§Ù„ Ø¹Ù† Ø§Ù„Ù…Ø­ØªÙˆÙ‰**\n\nØ§Ø³Ø£Ù„Ù†ÙŠ Ø£ÙŠ Ø´ÙŠØ¡!"
          : "Hello! I'm **Athr AI**, your academic assistant. I can help you with:\n\n- **Explaining equations and concepts**\n- **Solving problems step-by-step**\n- **Clarifying differences between methods**\n- **Answering any content questions**\n\nAsk me anything!";
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
    
    showTypingIndicator(true);

    try {
      const lectureContext = document.querySelector('.main-content') ? document.querySelector('.main-content').innerText : '';
      
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showTypingIndicator(false);
      
      const aiResponse = isArabic
        ? "Ø´ÙƒØ±Ø§Ù‹ Ù„Ø³Ø¤Ø§Ù„Ùƒ! Ù‡Ø°Ù‡ Ø¥Ø¬Ø§Ø¨Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ù…Ù† **Ø£Ø«Ø± AI**. ÙÙŠ Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„ÙƒØ§Ù…Ù„Ø©ØŒ Ø³ÙŠØªÙ… Ø§Ù„Ø±Ø¨Ø· Ø¨Ù€ API Ø­Ù‚ÙŠÙ‚ÙŠ Ù„Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ù„Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø¹Ù„Ù‰ Ø£Ø³Ø¦Ù„ØªÙƒ Ø¨Ø¯Ù‚Ø©.\n\nÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø§Ù„Ø¨ Ù…Ø¹ Ø£ÙŠ AI API Ù…Ø«Ù„ OpenAI Ø£Ùˆ Google Gemini."
        : "Thanks for your question! This is a demo response from **Athr AI**. In the full version, it will be connected to a real AI API to answer your questions accurately.\n\nYou can use this template with any AI API like OpenAI or Google Gemini.";
      
      addMessage(aiResponse, 'ai');
      conversationHistory.push({ role: 'assistant', content: aiResponse });
      
      // Re-render math in chat
      setTimeout(() => {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
          MathJax.typesetPromise();
        }
      }, 100);

    } catch (error) {
      console.error('Error:', error);
      showTypingIndicator(false);
      
      const errorMsg = isArabic
        ? "Ø¹Ø°Ø±Ø§Ù‹ØŒ Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰."
        : "Sorry, a connection error occurred. Please try again.";
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
    const content = element.querySelector('.question-content');
    element.classList.toggle('open');
    content.classList.toggle('show');
    
    if (content.classList.contains('show')) {
      setTimeout(() => {
        content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  };

  // ==================== MCQ SELECTION WITH CONFETTI ====================
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
          this.innerHTML += ' âœ“';
          
          if (typeof confetti !== 'undefined') {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          showToast('âœ… Ø¥Ø¬Ø§Ø¨Ø© ØµØ­ÙŠØ­Ø©!');
          
          const solutionContent = this.closest('.question-content').querySelector('.solution-content');
          if (solutionContent) {
            setTimeout(() => {
              solutionContent.style.display = 'block';
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise();
              }
            }, 1000);
          }
        } else {
          this.classList.add('incorrect');
          this.innerHTML += ' âœ—';
          showToast('âŒ Ø¥Ø¬Ø§Ø¨Ø© Ø®Ø§Ø·Ø¦Ø©');
          
          allOptions.forEach(opt => {
            if (opt.getAttribute('data-answer') === 'correct') {
              opt.classList.add('correct');
              opt.innerHTML += ' âœ“ (Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©)';
            }
          });
          
          const solutionContent = this.closest('.question-content').querySelector('.solution-content');
          if (solutionContent) {
            setTimeout(() => {
              solutionContent.style.display = 'block';
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise();
              }
            }, 1500);
          }
        }
      }, 500);
    });
  });

  console.log('âœ… Ù…Ù†ØµØ© Ø£Ø«Ø± - Ø¬Ø§Ù‡Ø²Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„!');
});

// ==================== VIDEO PLAYER SCRIPT ====================
(function() {
  'use strict';

  // Multiple video sources as fallback
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
  const tapLeft = document.getElementById('tapLeft');
  const tapRight = document.getElementById('tapRight');

  // Check if elements exist
  if (!videoPlayer || !video) {
    console.log('Video player elements not found - skipping initialization');
    return;
  }

  let controlsTimeout;
  let isDragging = false;
  let tapTimeout, tapCount = 0, lastTapX = 0;
  let isFullscreen = false;
  let currentSourceIndex = 0;

  function init() {
    loadVideo();
    
    // Setup video controls based on device
    if (isIOS) {
      video.controls = true;
      console.log('âœ… iOS: Native controls enabled');
    } else {
      video.controls = false;
      setupCustomControls();
      setupHammerGestures();
      console.log('âœ… Non-iOS: Custom controls enabled');
    }
    
    setupEventListeners();
    if (document.pictureInPictureEnabled && pipBtn) pipBtn.style.display = 'flex';
  }

  function loadVideo() {
    video.src = VIDEO_SOURCES[currentSourceIndex];
    video.load();
  }

  function updateVolumeSliderBg() {
    if (!volumeSlider) return;
    const percent = video.volume * 100;
    volumeSlider.style.background = `linear-gradient(to right, #fff ${percent}%, rgba(255, 255, 255, 0.3) ${percent}%)`;
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
    showToast('âª -10 Ø«ÙˆØ§Ù†ÙŠ');
  }

  function skipForwardFunc() {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    if (tapRight) showTapIndicator('right');
    showToast('â© +10 Ø«ÙˆØ§Ù†ÙŠ');
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
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}` : `${mins}:${secs.toString().padStart(2,'0')}`;
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

  function updateVolumeIcon() {
    if (!volumeBtn) return;
    const vol = video.volume;
    const icon = video.muted || vol === 0 ? 'fa-volume-xmark' : vol < 0.5 ? 'fa-volume-low' : 'fa-volume-up';
    volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
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
        updateVolumeIcon();
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        video.volume = volumeSlider.value;
        video.muted = false;
        updateVolumeIcon();
        updateVolumeSliderBg();
      });
    }

    if (progressWrapper) {
      progressWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        videoPlayer.classList.add('dragging');
        handleSeek(e, progressWrapper);
      });

      progressWrapper.addEventListener('touchstart', (e) => {
        isDragging = true;
        videoPlayer.classList.add('dragging');
        handleSeek(e, progressWrapper);
      }, { passive: true });

      progressWrapper.addEventListener('click', (e) => handleSeek(e, progressWrapper));
    }

    document.addEventListener('mousemove', (e) => {
      if (isDragging && progressWrapper) handleSeek(e, progressWrapper);
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && progressWrapper) handleSeek(e, progressWrapper);
    }, { passive: true });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        videoPlayer.classList.remove('dragging');
      }
    });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        videoPlayer.classList.remove('dragging');
      }
    });

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

    if (pipBtn) {
      pipBtn.addEventListener('click', async () => {
        try {
          document.pictureInPictureElement ? await document.exitPictureInPicture() : await video.requestPictureInPicture();
        } catch {}
      });
    }

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
        case 'm':
          e.preventDefault();
          video.muted = !video.muted;
          updateVolumeIcon();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    });

    updateVolumeSliderBg();
  }

  function setupHammerGestures() {
    if (typeof Hammer === 'undefined') return;
    
    const hammer = new Hammer(video);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    
    hammer.on('swipeleft', () => {
      skipForwardFunc();
    });
    
    hammer.on('swiperight', () => {
      skipBackward();
    });
    
    console.log('âœ… Hammer.js video gestures enabled');
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
        console.log('Trying next source:', VIDEO_SOURCES[currentSourceIndex]);
        loadVideo();
        showToast('âš ï¸ Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ù…ØµØ¯Ø± Ø¨Ø¯ÙŠÙ„...');
      } else {
        showToast('âŒ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ');
      }
    });

    video.addEventListener('loadedmetadata', () => {
      if (simpleDuration) simpleDuration.textContent = formatTime(video.duration);
      if (remainingTimeEl) remainingTimeEl.textContent = '-' + formatTime(video.duration);
      if (isFullscreen) showControls();
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

// ==================== ADDITIONAL UTILITIES & SCROLL PROGRESS ====================
document.addEventListener('DOMContentLoaded', function() {
  
  // ==================== SCROLL PROGRESS TRACKER ====================
  const createScrollProgress = () => {
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
  };
  
  createScrollProgress();

  // ==================== UTILITY FUNCTIONS ====================
  
  window.formatCurrency = function(amount, currency = 'EGP') {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  window.formatNumber = function(number, decimals = 2) {
    return new Intl.NumberFormat('ar-EG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  };
  
  window.formatPercentage = function(value) {
    return new Intl.NumberFormat('ar-EG', {
      style: 'percent',
      minimumFractionDigits: 2
    }).format(value);
  };

  // ==================== FINAL CONSOLE MESSAGES ====================
  console.log('â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”');
  console.log('ðŸŽ‰ Ù…Ù†ØµØ© Ø£Ø«Ø± - ØªÙ… Ø§Ù„ØªØ­Ù…ÙŠÙ„ Ø¨Ù†Ø¬Ø§Ø­!');
  console.log('â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”');
  console.log('ðŸ“š Ø¹Ø¯Ø¯ Ø§Ù„Ù…ÙƒØªØ¨Ø§Øª Ø§Ù„Ù…Ø­Ù…Ù„Ø©: 50+');
  console.log('ðŸ“± Ø§Ù„Ø¬Ù‡Ø§Ø²:', deviceType);
  console.log('ðŸŽ¬ Ø§Ù„Ù…Ø´ØºÙ„:', isIOS ? 'Native iOS Player' : 'Custom Player');
  console.log('âœ¨ Ø§Ù„Ø¥Ø¶Ø§ÙØ§Øª:');
  console.log('   âœ… iOS Detection');
  console.log('   âœ… Shimmer Effect');
  console.log('   âœ… Toast Notifications');
  console.log('   âœ… Hammer.js Gestures');
  console.log('   âœ… Scroll Progress');
  console.log('â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”');
  console.log('ðŸš€ Ø¬Ø§Ù‡Ø² Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…!');
  console.log('â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”');
  
  // Show welcome toast after 1 second
  setTimeout(() => {
    showToast('ðŸŽ‰ Ù…Ø±Ø­Ø¨Ø§Ù‹ ÙÙŠ Ù…Ù†ØµØ© Ø£Ø«Ø±!', 3000);
  }, 1000);
});
