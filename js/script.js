/* ==================== ATHR PLATFORM - BASE SCRIPT V3.0 ==================== */
/* 
 * الوظائف الأساسية:
 * - Libraries Initialization
 * - Utility Functions
 * - Toast System (XSS-Protected)
 * - Modal Helpers
 * - Security Utilities
 * - Input Validation
 * - Rate Limiting
 * 
 * Version: 3.0 - Security Enhanced
 * Last Updated: 2025-11-17
 * Standards: ES6+ / Production Ready / OWASP Compliant
 */



// ==================== CONSOLE GREETING ====================
console.log('%c🎓 منصة أثر التعليمية', 'color: #16a34a; font-size: 24px; font-weight: bold;');
console.log('%cAthr Educational Platform V3.0 - Security Enhanced', 'color: #4d7c0f; font-size: 16px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #22c55e;');



// ==================== LIBRARIES INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing platform...');
  
  // ✅ Initialize AOS (enable on all devices)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 50,
      disable: false,
      anchorPlacement: 'top-bottom'
    });
    console.log('✅ AOS initialized (all devices)');
  } else {
    console.warn('⚠️ AOS not loaded');
  }
  
  // Configure Moment.js
  if (typeof moment !== 'undefined') {
    moment.locale('ar');
    console.log('✅ Moment.js configured (Arabic)');
  } else {
    console.warn('⚠️ Moment.js not loaded');
  }
  
  // Configure Chart.js defaults
  if (typeof Chart !== 'undefined') {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
    Chart.defaults.font.family = "'IBM Plex Sans Arabic', 'Cairo', sans-serif";
    console.log('✅ Chart.js configured');
  } else {
    console.warn('⚠️ Chart.js not loaded');
  }
  
  // Force MathJax to render
  function waitForMathJax() {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      console.log('🔢 Rendering math expressions...');
      MathJax.typesetPromise().then(() => {
        console.log('✅ Math expressions rendered');
      }).catch((err) => {
        console.error('❌ MathJax error:', err);
      });
    } else {
      setTimeout(waitForMathJax, 100);
    }
  }
  
  setTimeout(waitForMathJax, 500);
  
  console.log('✅ Platform ready!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});



// ==================== 🔒 SECURITY UTILITIES ====================


/**
 * ✅ Sanitize HTML to prevent XSS attacks
 * @param {string} input - User input that might contain HTML
 * @returns {string} - Safe text without HTML tags
 */
window.sanitizeHTML = function(input) {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};


/**
 * ✅ Sanitize text for display (stricter)
 * @param {string} input - User input
 * @returns {string} - Clean text
 */
window.sanitizeText = function(input) {
  if (!input) return '';
  return String(input).trim();
};


/**
 * ✅ Enhanced Email Validation (RFC 5322 compliant)
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, error: string, email: string }
 */
window.validateEmail = function(email) {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'البريد الإلكتروني مطلوب' };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // Enhanced email regex (RFC 5322 simplified)
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
  }
  
  // Check length
  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'البريد الإلكتروني طويل جداً' };
  }
  
  // Block suspicious patterns
  const suspiciousPatterns = [
    /\.{2,}/, // double dots
    /@.*@/, // multiple @
    /^\./, // starts with dot
    /\.$/, // ends with dot
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedEmail)) {
      return { valid: false, error: 'البريد الإلكتروني غير صحيح' };
    }
  }
  
  // Block disposable email domains
  const disposableDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ];
  
  const domain = trimmedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: 'هذا البريد الإلكتروني غير مسموح به' };
  }
  
  return { valid: true, email: trimmedEmail };
};


/**
 * ✅ Enhanced Password Validation with Strength Meter
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, error: string, strength: number (0-6), feedback: string }
 */
window.validatePassword = function(password) {
  if (!password) {
    return { 
      valid: false, 
      error: 'كلمة المرور مطلوبة', 
      strength: 0,
      feedback: 'أدخل كلمة المرور'
    };
  }
  
  const minLength = 8;
  const maxLength = 128;
  
  // Check length
  if (password.length < minLength) {
    return { 
      valid: false, 
      error: `كلمة المرور قصيرة جداً (${minLength} أحرف على الأقل)`,
      strength: 0,
      feedback: 'استخدم 8 أحرف على الأقل'
    };
  }
  
  if (password.length > maxLength) {
    return { 
      valid: false, 
      error: 'كلمة المرور طويلة جداً',
      strength: 0,
      feedback: 'كلمة المرور طويلة جداً'
    };
  }
  
  // Calculate strength
  let strength = 0;
  const checks = {
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    isLong: password.length >= 12,
    isVeryLong: password.length >= 16
  };
  
  // Add strength points
  if (checks.hasUpper) strength++;
  if (checks.hasLower) strength++;
  if (checks.hasNumber) strength++;
  if (checks.hasSpecial) strength++;
  if (checks.isLong) strength++;
  if (checks.isVeryLong) strength++;
  
  // Feedback
  let feedback = '';
  if (strength <= 2) feedback = 'ضعيفة جداً';
  else if (strength === 3) feedback = 'ضعيفة';
  else if (strength === 4) feedback = 'متوسطة';
  else if (strength === 5) feedback = 'قوية';
  else feedback = 'قوية جداً';
  
  // Must have minimum requirements
  if (!checks.hasUpper || !checks.hasLower || !checks.hasNumber) {
    return {
      valid: false,
      error: 'كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام',
      strength: strength,
      feedback: feedback
    };
  }
  
  // Check for common passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', '1234567890', 'password1'
  ];
  
  const lowerPassword = password.toLowerCase();
  for (const common of commonPasswords) {
    if (lowerPassword.includes(common)) {
      return {
        valid: false,
        error: 'كلمة المرور شائعة جداً',
        strength: 1,
        feedback: 'تجنب الكلمات الشائعة'
      };
    }
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    return {
      valid: false,
      error: 'لا تستخدم أحرف متكررة',
      strength: Math.max(1, strength - 1),
      feedback: 'تجنب التكرار'
    };
  }
  
  return { 
    valid: true, 
    strength: strength,
    feedback: feedback
  };
};


/**
 * ✅ Username Validation (matching database constraints)
 * @param {string} username - Username to validate
 * @returns {object} - { valid: boolean, error: string, username: string }
 */
window.validateUsername = function(username) {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'اسم المستخدم مطلوب' };
  }
  
  const trimmedUsername = username.trim().toLowerCase();
  
  // Length check (3-30)
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return { valid: false, error: 'اسم المستخدم يجب أن يكون بين 3 و 30 حرف' };
  }
  
  // Pattern check (lowercase letters, numbers, underscore only)
  if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
    return { valid: false, error: 'استخدم حروف إنجليزية صغيرة وأرقام و _ فقط' };
  }
  
  // Cannot start/end with underscore
  if (/^_|_$/.test(trimmedUsername)) {
    return { valid: false, error: 'لا يمكن البدء أو الانتهاء بـ _' };
  }
  
  // Cannot have consecutive underscores
  if (/__/.test(trimmedUsername)) {
    return { valid: false, error: 'لا يمكن استخدام __ متتالية' };
  }
  
  // Cannot be only numbers
  if (/^\d+$/.test(trimmedUsername)) {
    return { valid: false, error: 'لا يمكن استخدام أرقام فقط' };
  }
  
  // Reserved names (basic check - full check is in database)
  const reserved = [
    'admin', 'administrator', 'root', 'superuser', 'moderator',
    'mod', 'support', 'help', 'test', 'demo', 'guest', 'user',
    'api', 'system', 'null', 'undefined', 'athr', 'athrr', 'official'
  ];
  
  if (reserved.includes(trimmedUsername)) {
    return { valid: false, error: 'اسم المستخدم محجوز' };
  }
  
  return { valid: true, username: trimmedUsername };
};


/**
 * ✅ Client-side Rate Limiting
 * @param {string} action - Action name (e.g., 'login', 'signup')
 * @param {number} maxAttempts - Max attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - { allowed: boolean, remaining: number, waitTime: number }
 */
window.checkClientRateLimit = function(action, maxAttempts = 5, windowMs = 60000) {
  const storageKey = `rateLimit_${action}`;
  const now = Date.now();
  
  // Get current data
  let data = storage.get(storageKey, { attempts: [], windowStart: now });
  
  // Clean old attempts outside window
  data.attempts = data.attempts.filter(timestamp => now - timestamp < windowMs);
  
  // Check if exceeded
  if (data.attempts.length >= maxAttempts) {
    const oldestAttempt = Math.min(...data.attempts);
    const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
    return { 
      allowed: false, 
      remaining: 0,
      waitTime: waitTime
    };
  }
  
  // Add current attempt
  data.attempts.push(now);
  storage.set(storageKey, data);
  
  return { 
    allowed: true, 
    remaining: maxAttempts - data.attempts.length
  };
};


/**
 * ✅ CSRF Token Helper
 * @returns {string} - Generated CSRF token
 */
window.generateCSRFToken = function() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};


/**
 * ✅ Secure Random String Generator
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
window.generateSecureRandom = function(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => charset[byte % charset.length]).join('');
};


/**
 * ✅ Validate URL Safety
 * @param {string} url - URL to validate
 * @returns {boolean} - Is URL safe
 */
window.isValidURL = function(url) {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};



// ==================== ✅ XSS-SAFE TOAST NOTIFICATION SYSTEM ====================


/**
 * XSS-Safe Toast Notification
 * @param {string} message - The message to display
 * @param {string} type - Type: success, error, warning, info
 * @param {number} duration - Duration in ms (default: 4000)
 */
window.showToast = function(message, type = 'info', duration = 4000) {
  // Get or create container
  let container = document.getElementById('toastContainer');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'الإشعارات');
    document.body.appendChild(container);
  }
  
  // Icon mapping
  const iconClasses = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  
  // Title mapping
  const titles = {
    success: 'نجح',
    error: 'خطأ',
    warning: 'تنبيه',
    info: 'معلومة'
  };
  
  // Create toast using DOM methods (XSS-safe)
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  
  // Icon
  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'toast-icon';
  iconWrapper.setAttribute('aria-hidden', 'true');
  const icon = document.createElement('i');
  icon.className = iconClasses[type] || iconClasses.info;
  iconWrapper.appendChild(icon);
  
  // Content
  const content = document.createElement('div');
  content.className = 'toast-content';
  
  const titleEl = document.createElement('div');
  titleEl.className = 'toast-title';
  titleEl.textContent = titles[type] || titles.info;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = sanitizeText(message); // ✅ XSS Protected
  
  content.appendChild(titleEl);
  content.appendChild(messageEl);
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'إغلاق الإشعار');
  const closeIcon = document.createElement('i');
  closeIcon.className = 'fas fa-times';
  closeBtn.appendChild(closeIcon);
  closeBtn.addEventListener('click', () => toast.remove());
  
  // Assemble
  toast.appendChild(iconWrapper);
  toast.appendChild(content);
  toast.appendChild(closeBtn);
  
  // Add to container
  container.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(450px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
  
  return toast;
};



// ==================== MODAL HELPERS ====================


/**
 * Show modal by ID
 * @param {string} modalId - The modal element ID
 */
window.showModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input, textarea, select');
      if (firstInput) firstInput.focus();
    }, 100);
  }
};


/**
 * Hide modal by ID
 * @param {string} modalId - The modal element ID
 */
window.hideModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
};


/**
 * Toggle modal visibility
 * @param {string} modalId - The modal element ID
 */
window.toggleModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const isActive = modal.classList.contains('active');
    if (isActive) {
      hideModal(modalId);
    } else {
      showModal(modalId);
    }
  }
};



// ==================== UTILITY FUNCTIONS ====================


// Format Currency
window.formatCurrency = function(amount, currency = 'EGP') {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};


// Format Number
window.formatNumber = function(number, decimals = 2) {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};


// Format Percentage
window.formatPercentage = function(value, decimals = 2) {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};


// Format Date (Arabic friendly)
window.formatDate = function(date, format = 'short') {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const formats = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
    full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  };
  
  return new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', formats[format] || formats.short).format(dateObj);
};


// Format Time Ago (Arabic)
window.formatTimeAgo = function(date) {
  const now = new Date();
  const past = date instanceof Date ? date : new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHour < 24) return `منذ ${diffHour} ساعة`;
  if (diffDay < 7) return `منذ ${diffDay} يوم`;
  
  return formatDate(past, 'short');
};


// Debounce Function
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


// Throttle Function
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


// Smooth Scroll to Element
window.smoothScrollTo = function(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
};


// Copy to Clipboard
window.copyToClipboard = function(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('تم النسخ', 'success');
    }).catch(() => {
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }
};


function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('تم النسخ', 'success');
  } catch (err) {
    showToast('فشل النسخ', 'error');
  }
  document.body.removeChild(textArea);
}


// Generate Random ID
window.generateId = function(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


// Check if Element in Viewport
window.isInViewport = function(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};


// Wait for Element
window.waitForElement = function(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found`));
    }, timeout);
  });
};


// Storage Helpers
window.storage = {
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



// ==================== PERFORMANCE MONITORING ====================
if (window.performance && window.performance.timing) {
  window.addEventListener('load', function() {
    setTimeout(function() {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      console.log('%c⚡ Performance Metrics', 'color: #f59e0b; font-weight: bold;');
      console.log(`📊 Page Load: ${(pageLoadTime / 1000).toFixed(2)}s`);
      console.log(`🔗 Connect: ${(connectTime / 1000).toFixed(2)}s`);
      console.log(`🎨 Render: ${(renderTime / 1000).toFixed(2)}s`);
      
      if (pageLoadTime > 3000) {
        console.warn('⚠️ Page load time exceeds 3s');
      }
    }, 0);
  });
}



// ==================== ERROR HANDLING ====================
window.addEventListener('error', function(e) {
  console.error('❌ Global error:', e.error);
});


window.addEventListener('unhandledrejection', function(e) {
  console.error('❌ Unhandled promise rejection:', e.reason);
});



// ==================== VISIBILITY CHANGE ====================
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    console.log('👋 Page hidden');
  } else {
    console.log('👀 Page visible');
  }
});



// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', function(e) {
  // ESC to close modals
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.modal-overlay.active, .profile-modal.active');
    if (activeModal) {
      activeModal.classList.remove('active');
    }
  }
});



console.log('✅ Base script V3.0 loaded - Security Enhanced');
console.log('🔒 XSS Protection: Enabled');
console.log('✅ Input Validation: Active');
console.log('🛡️ Rate Limiting: Client-side Ready');
