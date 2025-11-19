// test_validation.mjs
import assert from 'assert';
import { validateEmail } from '../js/validation.js';

console.log('Running tests for validateEmail...');

// Test suite for email validation
const testCases = [
    // --- Valid Cases ---
    { email: 'test@example.com', expected: true, description: 'should pass for a standard email' },
    { email: 'test.name@example.co.uk', expected: true, description: 'should pass for an email with a subdomain' },
    { email: 'user123@gmail.com', expected: true, description: 'should pass for a common provider' },

    // --- Invalid Cases (Syntax) ---
    { email: 'test@.com', expected: false, description: 'should fail for a domain starting with a dot' },
    { email: 'test@domain..com', expected: false, description: 'should fail for double dots in the domain' },
    { email: 'test', expected: false, description: 'should fail for an email without an @' },
    { email: 'test@', expected: false, description: 'should fail for an email without a domain' },
    { email: '', expected: false, description: 'should fail for an empty string' },
    { email: null, expected: false, description: 'should fail for a null value' },

    // --- Invalid Cases (Disposable Domains) ---
    { email: 'user@tempmail.com', expected: false, description: 'should fail for a known disposable domain' },
    { email: 'user@sub.tempmail.com', expected: false, description: 'should fail for a subdomain of a disposable domain' },
    { email: 'user@mailinator.com', expected: false, description: 'should fail for another disposable domain' },
];

let passed = 0;
let failed = 0;

testCases.forEach(({ email, expected, description }) => {
    const result = validateEmail(email);
    try {
        assert.strictEqual(result.valid, expected, `Test failed: ${description} (Email: ${email})`);
        console.log(`✅ PASS: ${description}`);
        passed++;
    } catch (e) {
        console.error(`❌ FAIL: ${e.message}`);
        failed++;
    }
});

console.log('--- Test Summary ---');
console.log(`Total: ${testCases.length}, Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) {
    process.exit(1); // Exit with error code if any test fails
}
