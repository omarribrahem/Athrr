/* ==================== ATHR PLATFORM - FEATURES SCRIPT ==================== */
/* Version: 2.0 | Updated: 2025-10-20 | Optimized & Clean */


// ==================== GLOBAL VARIABLES ====================
let isArabic = true;
let isFirstMessage = true;
let conversationHistory = [];
let timerInterval = null;
let timerSeconds = 0;
let timerMode = 'reading';
let pomodoroMinutes = 25;
let pomodoroSeconds = 0;
let pomodoroInterval = null;
let pomodoroRunning = false;


// ==================== UTILITY FUNCTIONS ====================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
window.showToast = function(message, duration = 2000) {
  const toast = document.querySelector('.toast-notification');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
};


/**
 * Parse AI message with markdown-like syntax
 * @param {string} text - Raw text to parse
 * @returns {string} - Formatted HTML
 */
function parseAIMessage(text) {
  if (!text) return '';
  
  // Escape HTML
  text = text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
  
  // Format markdown
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Process lists and paragraphs
  const lines = text.split('\n');
  let inList = false;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push('<br>');
      continue;
    }
    
    if (line.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push('<li>' + line.substring(2) + '</li>');
      continue;
    }
    
    if (inList) {
      result.push('</ul>');
      inList = false;
    }
    
    result.push('<p>' + line + '</p>');
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('\n');
}


// ==================== AI CHAT FUNCTIONS ====================

/**
 * Add message to chat
 * @param {string} text - Message text
 * @param {string} sender - 'user' or 'ai'
 */
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
  
  // Render math if available
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    MathJax.typesetPromise([messageElement]).catch((err) => {
      console.error('MathJax render error:', err);
    });
  }
};


/**
 * Show typing indicator
 */
window.showTypingIndicator = function() {
  const messagesContainer = document.getElementById('aiChatMessages');
  if (!messagesContainer) return;
  
  const existing = messagesContainer.querySelector('.typing-indicator');
  if (existing) existing.remove();
  
  const indicator = document.createElement('div');
  indicator.classList.add('chat-message', 'ai-message', 'typing-indicator');
  indicator.innerHTML = `
    <span>${isArabic ? 'أثر AI يكتب' : 'Athr AI is typing'}</span>
    <span class="dot">.</span>
    <span class="dot">.</span>
    <span class="dot">.</span>
  `;
  
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};


/**
 * Hide typing indicator
 */
window.hideTypingIndicator = function() {
  const indicator = document.querySelector('.typing-indicator');
  if (indicator) indicator.remove();
};


// ==================== CALCULATORS ====================

/**
 * Calculate Exponential Smoothing
 */
window.calculateExponentialSmoothing = function() {
  const prevForecast = parseFloat(document.getElementById('prevForecast')?.value);
  const actualDemand = parseFloat(document.getElementById('actualDemand')?.value);
  const alpha = parseFloat(document.getElementById('alphaValue')?.value);
  
  if (isNaN(prevForecast) || isNaN(actualDemand) || isNaN(alpha)) {
    alert(isArabic ? 'الرجاء إدخال قيم صحيحة!' : 'Please enter valid values!');
    return;
  }
  
  if (alpha < 0 || alpha > 1) {
    alert(isArabic ? 'قيمة α يجب أن تكون بين 0 و 1!' : 'α value must be between 0 and 1!');
    return;
  }
  
  const error = actualDemand - prevForecast;
  const adjustment = alpha * error;
  const newForecast = prevForecast + adjustment;
  
  const resultDiv = document.getElementById('calculatorResult');
  const resultValue = document.getElementById('resultValue');
  const resultSteps = document.getElementById('resultSteps');
  
  if (!resultDiv || !resultValue || !resultSteps) return;
  
  resultValue.innerHTML = `${newForecast.toFixed(2)} ${isArabic ? 'وحدة' : 'units'}`;
  
  resultSteps.innerHTML = `
    <strong>${isArabic ? 'خطوات الحل:' : 'Solution Steps:'}</strong><br>
    1️⃣ ${isArabic ? 'خطأ التنبؤ' : 'Forecast Error'} = ${actualDemand} - ${prevForecast} = <strong>${error.toFixed(2)}</strong><br>
    2️⃣ ${isArabic ? 'التعديل' : 'Adjustment'} = ${alpha} × ${error.toFixed(2)} = <strong>${adjustment.toFixed(2)}</strong><br>
    3️⃣ ${isArabic ? 'التنبؤ الجديد' : 'New Forecast'} = ${prevForecast} + ${adjustment.toFixed(2)} = <strong>${newForecast.toFixed(2)}</strong>
  `;
  
  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Celebration effect
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 }
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 }
    });
  }
};


// ==================== SCROLL PROGRESS TRACKER ====================

/**
 * Create and initialize scroll progress bar
 */
function createScrollProgress() {
  // Check if already created
  if (document.querySelector('.scroll-progress-bar')) return;
  
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-medium));
    z-index: 10000;
    transition: width 0.1s ease;
    pointer-events: none;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
  
  console.log('✅ Scroll progress bar initialized');
}


// ==================== MAIN INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎨 Initializing Athr Platform Features...');
  
  const translationButton = document.getElementById('translationButton');
  const translationText = document.querySelector('.translation-text');
  const html = document.documentElement;
  const body = document.body;
  
  const aiChatButton = document.getElementById('aiChatButton');
  const aiChatModal = document.getElementById('aiChatModal');
  const aiChatCloseBtn = document.getElementById('aiChatCloseBtn');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiChatSendBtn = document.getElementById('ai-chat-send-btn');


  // ==================== LANGUAGE TOGGLE ====================
  
  /**
   * Apply language settings
   * @param {boolean} arabic - True for Arabic, false for English
   */
  function applyLanguage(arabic) {
    isArabic = arabic;
    const lang = isArabic ? 'ar' : 'en';
    const dir = isArabic ? 'rtl' : 'ltr';
    
    html.setAttribute('lang', lang);
    html.setAttribute('dir', dir);
    body.setAttribute('dir', dir);
    
    // Show/hide language-specific content
    document.querySelectorAll('.ar-content').forEach(el => {
      el.style.display = arabic ? 'block' : 'none';
    });
    document.querySelectorAll('.en-content').forEach(el => {
      el.style.display = arabic ? 'none' : 'block';
    });
    
    // Update UI text
    if (translationText) {
      translationText.textContent = isArabic ? 'English' : 'العربية';
    }
    
    document.title = isArabic ? 'منصة أثر - التعليم التفاعلي' : 'Athr Platform - Interactive Learning';
    
    // Update moment.js locale
    if (typeof moment !== 'undefined') {
      moment.locale(isArabic ? 'ar' : 'en');
    }
    
    // Re-render math
    setTimeout(function() {
      if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch((err) => console.error('MathJax error:', err));
      }
    }, 300);
    
    console.log(`🌍 Language: ${lang.toUpperCase()}`);
  }


  // Load saved language
  const savedLang = localStorage.getItem('athr_language') || 'ar';
  if (savedLang === 'en') {
    applyLanguage(false);
  }


  // Translation button click
  if (translationButton) {
    translationButton.addEventListener('click', function() {
      applyLanguage(!isArabic);
      localStorage.setItem('athr_language', isArabic ? 'ar' : 'en');
      showToast(isArabic ? '🌍 تم التبديل للعربية' : '🌍 Switched to English');
    });
    console.log('✅ Translation button initialized');
  }


  // ==================== AI CHAT SYSTEM ====================
  
  if (aiChatButton) {
    aiChatButton.addEventListener('click', function() {
      if (aiChatModal) {
        aiChatModal.classList.add('visible');
        
        if (isFirstMessage) {
          const welcomeMsg = isArabic 
            ? `مرحباً! أنا **أثر AI**، مساعدك الأكاديمي المتخصص.

يمكنني مساعدتك في:

- **شرح المعادلات والمفاهيم**
- **حل المسائل خطوة بخطوة**
- **توضيح الفرق بين الطرق المختلفة**
- **الإجابة على أي سؤال عن المحتوى**

اسألني أي شيء! 🎓`
            : `Hello! I'm **Athr AI**, your specialized academic assistant.

I can help you with:

- **Explaining equations and concepts**
- **Solving problems step-by-step**
- **Clarifying differences between methods**
- **Answering any content questions**

Ask me anything! 🎓`;
          
          addMessage(welcomeMsg, 'ai');
          isFirstMessage = false;
        }
        
        if (aiChatInput) aiChatInput.focus();
      }
    });
    console.log('✅ AI Chat initialized');
  }


  if (aiChatCloseBtn) {
    aiChatCloseBtn.addEventListener('click', function() {
      if (aiChatModal) aiChatModal.classList.remove('visible');
    });
  }


  if (aiChatModal) {
    aiChatModal.addEventListener('click', function(e) {
      if (e.target === aiChatModal) {
        aiChatModal.classList.remove('visible');
      }
    });
  }


  /**
   * Send message to AI
   */
  async function sendMessage() {
    if (!aiChatInput) return;
    
    const userMessage = aiChatInput.value.trim();
    if (!userMessage) return;


    addMessage(userMessage, 'user');
    conversationHistory.push({ role: 'user', content: userMessage });
    
    aiChatInput.value = '';
    aiChatInput.disabled = true;
    if (aiChatSendBtn) aiChatSendBtn.disabled = true;
    
    showTypingIndicator();


    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      hideTypingIndicator();
      
      const aiResponse = isArabic
        ? `شكراً لسؤالك! 🎓

هذه إجابة تجريبية من **أثر AI**. في النسخة الكاملة، سيتم الربط بـ API حقيقي.

**المميزات:**
- تنسيق **احترافي** للنصوص
- دعم **القوائم** والجداول
- معالجة الرموز الرياضية

هل تحتاج مساعدة إضافية؟`
        : `Thanks for your question! 🎓

This is a demo response from **Athr AI**. In full version, it will connect to a real API.

**Features:**
- **Professional** text formatting
- Support for **lists** and tables
- Math symbol handling

Do you need additional help?`;
      
      addMessage(aiResponse, 'ai');
      conversationHistory.push({ role: 'assistant', content: aiResponse });
      
      setTimeout(() => {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
          MathJax.typesetPromise().catch(err => console.error('MathJax error:', err));
        }
      }, 100);


    } catch (error) {
      console.error('AI Chat error:', error);
      hideTypingIndicator();
      
      const errorMsg = isArabic
        ? `عذراً، حدث **خطأ** في الاتصال. 😔

يرجى المحاولة مرة أخرى.`
        : `Sorry, a **connection error** occurred. 😔

Please try again.`;
      
      addMessage(errorMsg, 'ai');
    } finally {
      aiChatInput.disabled = false;
      if (aiChatSendBtn) aiChatSendBtn.disabled = false;
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


  // ==================== TIMER WIDGET ====================
  const timerWidget = document.querySelector('.timer-widget');
  const timerValue = document.querySelector('.timer-value');
  const readingMode = document.getElementById('readingMode');
  const pomodoroMode = document.getElementById('pomodoroMode');
  const pomodoroTime = document.getElementById('pomodoroTime');
  const startPomodoroBtn = document.getElementById('startPomodoroBtn');
  const pausePomodoroBtn = document.getElementById('pausePomodoroBtn');
  const resetPomodoroBtn = document.getElementById('resetPomodoroBtn');
  const switchToPomodoroBtn = document.getElementById('switchToPomodoroBtn');
  const switchToReadingBtn = document.getElementById('switchToReadingBtn');
  
  if (timerWidget && timerValue) {
    function updateReadingTimer() {
      timerSeconds++;
      const minutes = Math.floor(timerSeconds / 60);
      timerValue.textContent = minutes;
    }
    
    timerInterval = setInterval(updateReadingTimer, 1000);
    
    function updatePomodoroDisplay() {
      const mins = pomodoroMinutes.toString().padStart(2, '0');
      const secs = pomodoroSeconds.toString().padStart(2, '0');
      if (pomodoroTime) pomodoroTime.textContent = `${mins}:${secs}`;
    }
    
    function startPomodoro() {
      if (pomodoroRunning) return;
      pomodoroRunning = true;
      
      if (startPomodoroBtn) startPomodoroBtn.style.display = 'none';
      if (pausePomodoroBtn) pausePomodoroBtn.style.display = 'flex';
      
      pomodoroInterval = setInterval(() => {
        if (pomodoroSeconds === 0) {
          if (pomodoroMinutes === 0) {
            clearInterval(pomodoroInterval);
            pomodoroRunning = false;
            if (typeof confetti !== 'undefined') {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            }
            showToast(isArabic ? '🎉 انتهى وقت البومودورو!' : '🎉 Pomodoro completed!');
            resetPomodoro();
            return;
          }
          pomodoroMinutes--;
          pomodoroSeconds = 59;
        } else {
          pomodoroSeconds--;
        }
        updatePomodoroDisplay();
      }, 1000);
    }
    
    function pausePomodoro() {
      if (!pomodoroRunning) return;
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      if (startPomodoroBtn) startPomodoroBtn.style.display = 'flex';
      if (pausePomodoroBtn) pausePomodoroBtn.style.display = 'none';
    }
    
    function resetPomodoro() {
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      pomodoroMinutes = 25;
      pomodoroSeconds = 0;
      updatePomodoroDisplay();
      if (startPomodoroBtn) startPomodoroBtn.style.display = 'flex';
      if (pausePomodoroBtn) pausePomodoroBtn.style.display = 'none';
    }
    
    if (switchToPomodoroBtn) {
      switchToPomodoroBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        timerMode = 'pomodoro';
        if (readingMode) readingMode.style.display = 'none';
        if (pomodoroMode) {
          pomodoroMode.style.display = 'flex';
          pomodoroMode.classList.add('active');
        }
        if (switchToPomodoroBtn) switchToPomodoroBtn.style.display = 'none';
        if (switchToReadingBtn) switchToReadingBtn.style.display = 'flex';
        showToast(isArabic ? '⏱️ وضع البومودورو' : '⏱️ Pomodoro Mode');
      });
    }
    
    if (switchToReadingBtn) {
      switchToReadingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        timerMode = 'reading';
        pausePomodoro();
        if (pomodoroMode) {
          pomodoroMode.style.display = 'none';
          pomodoroMode.classList.remove('active');
        }
        if (readingMode) readingMode.style.display = 'flex';
        if (switchToPomodoroBtn) switchToPomodoroBtn.style.display = 'flex';
        if (switchToReadingBtn) switchToReadingBtn.style.display = 'none';
        showToast(isArabic ? '📖 وضع القراءة' : '📖 Reading Mode');
      });
    }
    
    if (startPomodoroBtn) startPomodoroBtn.addEventListener('click', (e) => { e.stopPropagation(); startPomodoro(); });
    if (pausePomodoroBtn) pausePomodoroBtn.addEventListener('click', (e) => { e.stopPropagation(); pausePomodoro(); });
    if (resetPomodoroBtn) {
      resetPomodoroBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetPomodoro();
        showToast(isArabic ? '🔄 إعادة تعيين المؤقت' : '🔄 Timer reset');
      });
    }
    
    updatePomodoroDisplay();
    console.log('✅ Timer widget initialized');
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


  // ==================== MCQ SELECTION ====================
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
          
          showToast(isArabic ? '✅ إجابة صحيحة!' : '✅ Correct answer!');
          
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
          showToast(isArabic ? '❌ إجابة خاطئة' : '❌ Incorrect answer');
          
          allOptions.forEach(opt => {
            if (opt.getAttribute('data-answer') === 'correct') {
              setTimeout(() => {
                opt.classList.add('correct');
                opt.innerHTML += isArabic ? ' ✓ (الإجابة الصحيحة)' : ' ✓ (Correct answer)';
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
  
  if (mcqOptions.length > 0) {
    console.log(`✅ ${mcqOptions.length} MCQ options initialized`);
  }


  // ==================== INITIALIZE SCROLL PROGRESS ====================
  createScrollProgress();


  console.log('✅ All features initialized successfully');
});

// ==================== ADVANCED CHART FUNCTIONS ====================

/**
 * Create responsive chart optimized for mobile
 * @param {string} canvasId - Canvas element ID
 * @param {object} config - Chart.js configuration
 * @returns {Chart|null} - Chart instance or null
 */
window.createResponsiveChart = function(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') {
    console.warn(`Canvas "${canvasId}" or Chart.js not found`);
    return null;
  }
  
  const isMobile = window.innerWidth <= 768;
  const isSmallMobile = window.innerWidth <= 480;
  
  const mobileConfig = {
    ...config,
    options: {
      ...config.options,
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 2,
      plugins: {
        ...config.options?.plugins,
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: isMobile ? 8 : 12,
            font: {
              size: isMobile ? (isSmallMobile ? 9 : 10) : 12
            },
            padding: isMobile ? 6 : 10
          }
        }
      },
      scales: config.options?.scales ? {
        x: {
          ...config.options.scales.x,
          ticks: {
            ...config.options.scales.x?.ticks,
            font: {
              size: isMobile ? (isSmallMobile ? 8 : 9) : 11
            },
            maxRotation: isMobile ? 45 : 0,
            minRotation: isMobile ? 45 : 0
          }
        },
        y: {
          ...config.options.scales.y,
          ticks: {
            ...config.options.scales.y?.ticks,
            font: {
              size: isMobile ? (isSmallMobile ? 8 : 9) : 11
            }
          }
        }
      } : undefined
    }
  };
  
  try {
    const chart = new Chart(canvas, mobileConfig);
    console.log(`✅ Responsive chart "${canvasId}" created`);
    return chart;
  } catch (error) {
    console.error(`❌ Error creating chart "${canvasId}":`, error);
    return null;
  }
};


/**
 * Handle chart resize on window resize
 */
(function initChartResizeHandler() {
  let resizeTimeout;
  
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      if (typeof Chart !== 'undefined' && Chart.instances) {
        Chart.instances.forEach(chart => {
          if (chart && chart.resize) {
            chart.resize();
          }
        });
      }
    }, 250);
  });
  
  console.log('✅ Chart resize handler initialized');
})();


/**
 * Enhanced MCQ selection with onclick support
 * @param {HTMLElement} element - Clicked option element
 * @param {boolean} isCorrect - Whether the answer is correct
 */
window.selectMCQ = function(element, isCorrect) {
  const options = element.parentNode.querySelectorAll('.mcq-option');
  
  // Disable all options
  options.forEach(option => {
    option.style.pointerEvents = 'none';
    option.classList.remove('selected', 'correct', 'incorrect');
  });
  
  element.classList.add('selected');
  
  setTimeout(() => {
    if (isCorrect) {
      element.classList.add('correct');
      element.innerHTML += ' ✓';
      
      // Celebration
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#16a34a', '#22c55e', '#4ade80']
        });
      }
      
      showToast(isArabic ? '✅ إجابة صحيحة!' : '✅ Correct!');
    } else {
      element.classList.add('incorrect');
      element.innerHTML += ' ✗';
      
      showToast(isArabic ? '❌ إجابة خاطئة' : '❌ Incorrect');
      
      // Show correct answer
      options.forEach(option => {
        const onclick = option.getAttribute('onclick');
        if (onclick && onclick.includes('true')) {
          setTimeout(() => {
            option.classList.add('correct');
            option.innerHTML += isArabic ? ' ✓ (الإجابة الصحيحة)' : ' ✓ (Correct)';
          }, 800);
        }
      });
    }
  }, 300);
};

// ==================== VIDEO PLAYER (iOS 26 STYLE) ====================
(function() {
  'use strict';


  const videoPlayer = document.getElementById('videoPlayer');
  const video = document.getElementById('video');
  
  if (!videoPlayer || !video) {
    console.log('⚠️ Video player not found on this page');
    return;
  }


  console.log('🎬 Initializing video player...');


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


  let controlsTimeout;
  let isDragging = false;
  let isFullscreen = false;


  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}` 
      : `${mins}:${secs.toString().padStart(2,'0')}`;
  }


  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
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
    if (videoBars) videoBars.classList.remove('hidden');
    
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (!video.paused && !isDragging) {
        videoPlayer.classList.remove('show-controls');
        if (videoBars) videoBars.classList.add('hidden');
      }
    }, 3000);
  }


  function skipBackward() {
    video.currentTime = Math.max(0, video.currentTime - 10);
    showTapIndicator('left');
  }


  function skipForwardFunc() {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    showTapIndicator('right');
  }


  function showTapIndicator(side) {
    const indicator = side === 'left' ? tapLeft : tapRight;
    if (indicator) {
      indicator.classList.add('active');
      setTimeout(() => indicator.classList.remove('active'), 500);
    }
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


  function updateVolumeSliderBg() {
    if (!volumeSlider) return;
    const percent = video.volume * 100;
    volumeSlider.style.background = `linear-gradient(to right, #fff ${percent}%, rgba(255, 255, 255, 0.3) ${percent}%)`;
  }


  // Event Listeners
  video.addEventListener('loadstart', () => { if (loadingSpinner) loadingSpinner.classList.add('active'); });
  video.addEventListener('canplay', () => { if (loadingSpinner) loadingSpinner.classList.remove('active'); });
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
    if (video.buffered.length > 0 && progressBuffered) {
      progressBuffered.style.width = `${(video.buffered.end(0) / video.duration) * 100}%`;
    }
  });


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


  document.addEventListener('mousemove', (e) => { if (isDragging && progressWrapper) handleSeek(e, progressWrapper); });
  document.addEventListener('touchmove', (e) => { if (isDragging && progressWrapper) handleSeek(e, progressWrapper); }, { passive: true });
  document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; videoPlayer.classList.remove('dragging'); } });
  document.addEventListener('touchend', () => { if (isDragging) { isDragging = false; videoPlayer.classList.remove('dragging'); } });


  let tapCount = 0;
  let tapTimeout;
  let lastTapX = 0;


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
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) exitFullscreen(); });


  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
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


  updateVolumeIcon();
  updateVolumeSliderBg();


  console.log('✅ Video player initialized');
  console.log('⌨️ Shortcuts: Space/K=Play, ←/→=Skip, M=Mute, F=Fullscreen');
})();


// ==================== CLEANUP ON PAGE UNLOAD ====================
window.addEventListener('beforeunload', function() {
  if (timerInterval) clearInterval(timerInterval);
  if (pomodoroInterval) clearInterval(pomodoroInterval);
});


console.log('✅ Athr Platform Features - Fully Loaded');
console.log('📌 Version: 2.0 | Optimized & Clean');
// ==================== FLASHCARD FLIP FUNCTION ====================
function flipCard(card) {
  card.classList.toggle('flipped');
  
  // Optional: Add sound effect or haptic feedback
  if (typeof confetti !== 'undefined' && card.classList.contains('flipped')) {
    // Small celebration when flipping
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { 
        x: card.getBoundingClientRect().left / window.innerWidth,
        y: card.getBoundingClientRect().top / window.innerHeight
      }
    });
  }
}

// Optional: Reset all flashcards
function resetAllFlashcards() {
  const flashcards = document.querySelectorAll('.flashcard');
  flashcards.forEach(card => {
    card.classList.remove('flipped');
  });
}

console.log('✅ Flashcards & Mind Map loaded');
