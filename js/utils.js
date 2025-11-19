// js/utils.js
export function getErrorMessage(errorCode) {
  const errors = {
    // Auth errors
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/weak-password': 'كلمة المرور ضعيفة (8 أحرف على الأقل)',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/wrong-password': 'كلمة المرور خاطئة',
    'auth/too-many-requests': 'محاولات كثيرة جداً، حاول بعد قليل',
    'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
    'auth/invalid-credential': 'بيانات الدخول غير صحيحة',
    'auth/user-disabled': 'تم تعطيل هذا الحساب',
    'auth/session-expired': 'انتهت صلاحية الجلسة',

    // Database errors
    'permission-denied': 'خطأ في الصلاحيات',
    'missing-fields': 'يرجى ملء جميع الحقول',
    'missing-email': 'يرجى إدخال البريد الإلكتروني',
    'user-not-found': 'المستخدم غير موجود',
    'weak-password': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'username_taken': 'اسم المستخدم محجوز',
    'email_taken': 'البريد الإلكتروني مستخدم',
    'invalid-username': 'اسم المستخدم غير صالح',
    'rate-limited': 'محاولات كثيرة، حاول بعد قليل',

    // Supabase specific
    'Invalid login credentials': 'بيانات الدخول غير صحيحة',
    'Email not confirmed': 'يرجى تأكيد البريد الإلكتروني',
    'User already registered': 'المستخدم مسجل بالفعل'
  }

  return errors[errorCode] || errorCode || 'حدث خطأ غير متوقع'
}

export function checkRateLimit(action, maxAttempts = 5) {
  if (typeof window.checkClientRateLimit === 'function') {
    return window.checkClientRateLimit(action, maxAttempts, 60000);
  }
  return { allowed: true, remaining: maxAttempts };
}

export const AVATAR_STYLE = 'adventurer';
export const AVATAR_API_VERSION = '9.x';

export const AVATAR_CONFIGS = [
  { seed: 'Ahmad',   params: 'eyebrows=variant02&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02' },
  { seed: 'Omar',    params: 'eyebrows=variant01&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574' },
  { seed: 'Ali',     params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1' },
  { seed: 'Youssef', params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant16&skinColor=d4a574' },
  { seed: 'Mohamed', params: 'eyebrows=variant02&eyes=variant22&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574' },
  { seed: 'Ibrahim', params: 'eyebrows=variant03&eyes=variant01&hair=short16&hairColor=6a4e35&mouth=variant23&skinColor=f2d3b1' },
  { seed: 'Sara',    params: 'eyebrows=variant01&eyes=variant22&hair=long03&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Nour',    params: 'eyebrows=variant02&eyes=variant01&hair=long06&hairColor=6a4e35&mouth=variant23&skinColor=d4a574' },
  { seed: 'Maryam',  params: 'eyebrows=variant01&eyes=variant22&hair=long08&hairColor=4a312c&mouth=variant26&skinColor=f2d3b1' },
  { seed: 'Huda',    params: 'eyebrows=variant03&eyes=variant01&hair=long04&hairColor=6a4e35&mouth=variant25&skinColor=d4a574' },
  { seed: 'Amira',   params: 'eyebrows=variant02&eyes=variant22&hair=long09&hairColor=4a312c&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Fatima',  params: 'eyebrows=variant01&eyes=variant01&hair=long20&hairColor=6a4e35&mouth=variant23&skinColor=d4a574&glasses=variant02' },
  { seed: 'Success', params: 'eyebrows=variant02&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1' },
  { seed: 'Victory', params: 'eyebrows=variant01&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574' },
  { seed: 'Hope',    params: 'eyebrows=variant03&eyes=variant22&hair=long06&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Dream',   params: 'eyebrows=variant02&eyes=variant01&hair=long03&hairColor=4a312c&mouth=variant23&skinColor=d4a574' },
  { seed: 'Scholar', params: 'eyebrows=variant01&eyes=variant22&hair=short16&hairColor=6a4e35&mouth=variant25&skinColor=f2d3b1&glasses=variant02' },
  { seed: 'Wisdom',  params: 'eyebrows=variant02&eyes=variant01&hair=short01&hairColor=4a312c&mouth=variant26&skinColor=d4a574&glasses=variant02' },
  { seed: 'Knowledge', params: 'eyebrows=variant03&eyes=variant22&hair=long08&hairColor=6a4e35&mouth=variant16&skinColor=f2d3b1' },
  { seed: 'Future',  params: 'eyebrows=variant01&eyes=variant01&hair=long04&hairColor=4a312c&mouth=variant23&skinColor=d4a574' }
];

export function getRandomAvatarConfig() {
  return AVATAR_CONFIGS[Math.floor(Math.random() * AVATAR_CONFIGS.length)];
}

export function generateAvatarUrl(seed, params = '') {
  if (!params) {
    const config = AVATAR_CONFIGS.find(c => c.seed === seed) || getRandomAvatarConfig();
    params = config.params;
  }
  return `https://api.dicebear.com/${AVATAR_API_VERSION}/${AVATAR_STYLE}/svg?seed=${encodeURIComponent(seed)}&${params}`;
}
