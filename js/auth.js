// js/auth.js
import { supabase, login, signup, validateUsername, onAuthChange, sendPasswordReset } from './app.js';

// ==========================================
// SHARED UI HELPERS
// ==========================================

function showToast(message, type = 'info') {
  // This is a simplified version. The main app.js or script.js should provide a global showToast.
  // For now, we'll ensure it doesn't crash if not present.
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(`${type}: ${message}`);
  }
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.toggle('active', show);
  }
}

function setInputState(wrapper, state) {
    wrapper.classList.remove('error', 'success', 'checking');
    if (state) {
        wrapper.classList.add(state);
    }
}

function setupPasswordToggle(toggleId, inputId, iconId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (toggle && input && icon) {
        toggle.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
}


// ==========================================
// LOGIN PAGE LOGIC
// ==========================================

export function initializeLoginPage() {
    document.addEventListener('DOMContentLoaded', () => {
        gsap.to(".auth-form-container", { duration: 0.8, opacity: 1, y: 0, ease: "power2.out" });
    });

    onAuthChange((user) => {
        if (user) {
            window.location.href = 'library.html';
        } else {
            const saved = localStorage.getItem('athr_remember_email');
            if (saved) {
                document.getElementById('email').value = saved;
                document.getElementById('rememberMe').checked = true;
            }
        }
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    setupPasswordToggle('passwordToggle', 'password', 'passwordIcon');
    setupForgotPasswordModal();
}

async function handleLoginSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const remember = document.getElementById('rememberMe').checked;
    const btn = document.getElementById('loginBtn');
    const emailWrapper = document.getElementById('emailWrapper');
    const passwordWrapper = document.getElementById('passwordWrapper');

    setInputState(emailWrapper);
    setInputState(passwordWrapper);

    if (!email || !password) {
        if (!email) setInputState(emailWrapper, 'error');
        if (!password) setInputState(passwordWrapper, 'error');
        showToast('يرجى إدخال البريد وكلمة المرور', 'error');
        return;
    }

    if (window.validateEmail && !window.validateEmail(email).valid) {
        setInputState(emailWrapper, 'error');
        showToast('البريد الإلكتروني غير صحيح', 'error');
        return;
    }

    if (password.length < 8) {
        setInputState(passwordWrapper, 'error');
        showToast('كلمة المرور 8 أحرف على الأقل', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    showLoading(true);

    try {
        const result = await login(email, password);
        if (result.success) {
            setInputState(emailWrapper, 'success');
            setInputState(passwordWrapper, 'success');
            localStorage.setItem('athr_remember_email', remember ? email : '');
            showToast('تم تسجيل الدخول بنجاح! ✓', 'success');
            setTimeout(() => { window.location.href = 'library.html'; }, 1000);
        } else {
            setInputState(emailWrapper, 'error');
            setInputState(passwordWrapper, 'error');
            passwordInput.value = '';
            showToast(result.message || 'خطأ في تسجيل الدخول', 'error');
            gsap.fromTo(".auth-glass-card", { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true, clearProps: "x" });
        }
    } catch (err) {
        setInputState(emailWrapper, 'error');
        setInputState(passwordWrapper, 'error');
        passwordInput.value = '';
        showToast('خطأ في الاتصال', 'error');
        gsap.fromTo(".auth-glass-card", { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true, clearProps: "x" });
    } finally {
        showLoading(false);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
    }
}

function setupForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    const forgotLink = document.getElementById('forgotLink');
    const closeBtn = document.getElementById('modalCloseBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const sendBtn = document.getElementById('sendResetBtn');

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    if (forgotLink) forgotLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (sendBtn) sendBtn.addEventListener('click', handleSendResetEmail);
}

async function handleSendResetEmail() {
    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput.value.trim();
    const btn = document.getElementById('sendResetBtn');
    const wrapper = document.getElementById('forgotEmailWrapper');

    setInputState(wrapper);

    if (!window.validateEmail(email).valid) {
        setInputState(wrapper, 'error');
        showToast('البريد الإلكتروني غير صحيح', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

    try {
        const result = await sendPasswordReset(email);
        if (result.success) {
            setInputState(wrapper, 'success');
            showToast('تم إرسال رابط إعادة التعيين ✓', 'success');
            setTimeout(() => document.getElementById('forgotPasswordModal').classList.remove('active'), 1500);
        } else {
            setInputState(wrapper, 'error');
            showToast(result.message || 'خطأ في الإرسال', 'error');
        }
    } catch (e) {
        setInputState(wrapper, 'error');
        showToast('خطأ في الإرسال', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال';
    }
}


// ==========================================
// SIGNUP PAGE LOGIC
// ==========================================

export function initializeSignupPage() {
    document.addEventListener('DOMContentLoaded', () => {
        gsap.to(".auth-form-container", { duration: 0.8, opacity: 1, y: 0, ease: "power2.out" });
    });

    onAuthChange((user) => {
        if (user) {
            window.location.href = 'library.html';
        }
    });

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }

    setupPasswordToggle('passwordToggle', 'password', 'passwordIcon');
    setupPasswordStrengthListener();
    setupUsernameValidationListener();
    setupEmailConfirmationListener();
}

async function handleSignupSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('signupBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإنشاء...';
    showLoading(true);

    try {
        const { name, username, phone, email, password, acceptTerms } = getSignupFormData();

        if (!validateSignupForm({ name, username, email, password, acceptTerms })) {
            return; // Validation failed, toast shown in validator
        }

        const usernameValidation = await validateUsername(username);
        if (!usernameValidation.valid) {
            showToast(usernameValidation.error, 'error');
            setInputState(document.getElementById('usernameWrapper'), 'error');
            return;
        }

        const result = await signup(email, password, name, username, phone || null);

        if (result.success) {
            showToast('تم إنشاء الحساب بنجاح! جارٍ التوجيه...', 'success');
            setTimeout(() => { window.location.href = 'library.html'; }, 1500);
        } else {
            showToast(result.message || 'حدث خطأ في إنشاء الحساب', 'error');
            gsap.fromTo(".auth-glass-card", { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true, clearProps: "x" });
        }
    } catch (err) {
        showToast('خطأ في الاتصال، حاول مجدداً', 'error');
        gsap.fromTo(".auth-glass-card", { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true, clearProps: "x" });
    } finally {
        showLoading(false);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء الحساب';
    }
}

function getSignupFormData() {
    const getValue = id => document.getElementById(id).value.trim();
    return {
        name: getValue('name'),
        username: getValue('username').toLowerCase(),
        phone: getValue('phone'),
        email: getValue('email'),
        password: document.getElementById('password').value,
        acceptTerms: document.getElementById('acceptTerms').checked
    };
}

function validateSignupForm(formData) {
    const { name, username, email, password, acceptTerms } = formData;
    const emailConfirm = document.getElementById('emailConfirm').value.trim();

    if (!name || name.length < 3) {
        showToast('يرجى إدخال اسمك الكامل (3 أحرف على الأقل)', 'error');
        return false;
    }
    if (!window.validateUsername(username).valid) {
        showToast(window.validateUsername(username).error, 'error');
        return false;
    }
    if (!window.validateEmail(email).valid) {
        showToast(window.validateEmail(email).error, 'error');
        return false;
    }
    if (email !== emailConfirm) {
        showToast('البريدان الإلكترونيان غير متطابقين', 'error');
        return false;
    }
    if (!window.validatePassword(password).valid) {
        showToast(window.validatePassword(password).error, 'error');
        return false;
    }
    if (!acceptTerms) {
        showToast('يرجى الموافقة على الشروط والأحكام', 'warning');
        return false;
    }
    return true;
}

function setupPasswordStrengthListener() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const pass = e.target.value;
            const strengthResult = window.validatePassword(pass);
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('passwordStrengthText');

            if (pass.length === 0) {
                 strengthBar.style.width = '0%';
                 strengthText.textContent = '';
                 return;
            }

            const strengthValue = strengthResult.strength || 0;
            const strengthPercent = (strengthValue / 6) * 100;

            strengthBar.style.width = `${strengthPercent}%`;
            strengthText.textContent = strengthResult.feedback;

            strengthBar.className = 'password-strength-bar'; // Reset
            if (strengthPercent < 40) strengthBar.classList.add('weak');
            else if (strengthPercent < 80) strengthBar.classList.add('medium');
            else strengthBar.classList.add('strong');
        });
    }
}

function setupUsernameValidationListener() {
    const usernameInput = document.getElementById('username');
    let debounceTimeout;

    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            const wrapper = document.getElementById('usernameWrapper');
            const username = usernameInput.value.trim().toLowerCase();

            if (username.length < 3) {
                setInputState(wrapper);
                return;
            }
            if (!window.validateUsername(username).valid) {
                setInputState(wrapper, 'error');
                return;
            }

            setInputState(wrapper, 'checking');
            debounceTimeout = setTimeout(async () => {
                const result = await validateUsername(username);
                setInputState(wrapper, result.valid ? 'success' : 'error');
            }, 500);
        });
    }
}

function setupEmailConfirmationListener() {
    const emailInput = document.getElementById('email');
    const emailConfirmInput = document.getElementById('emailConfirm');

    if(emailInput && emailConfirmInput) {
        const validate = () => {
            const wrapper = document.getElementById('emailConfirmWrapper');
            if(emailConfirmInput.value.length > 0) {
                setInputState(wrapper, emailInput.value === emailConfirmInput.value ? 'success' : 'error');
            } else {
                setInputState(wrapper);
            }
        };
        emailInput.addEventListener('input', validate);
        emailConfirmInput.addEventListener('input', validate);
    }
}
