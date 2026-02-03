/**
 * Form Validator Module
 */
const Validator = (function () {
    'use strict';

    const rules = {
        computerType: { required: true, message: 'Please select a computer type' },
        institutionName: { required: true, minLength: 2, maxLength: 100, message: 'Institution name is required (2-100 characters)' },
        computerNumber: { required: true, minLength: 1, maxLength: 50, pattern: /^[a-zA-Z0-9\-_]+$/, message: 'Computer number is required (alphanumeric, hyphens, underscores only)' },
        serialNumber: { required: true, minLength: 1, maxLength: 50, message: 'CPU SID is required' },
        monitorSid: { required: true, minLength: 1, maxLength: 50, message: 'Monitor SID is required' },
        mouseSid: { required: true, minLength: 1, maxLength: 50, message: 'Mouse SID is required' },
        officePackageType: { required: true, message: 'Please select an office package type' },
        osModel: { required: true, message: 'Please select an operating system' },
        assetStatus: { required: true, message: 'Please select an asset status' },
        customOs: { required: false, minLength: 2, maxLength: 50, message: 'Please specify the operating system' }
    };

    function validateField(fieldName, value, context = {}) {
        const rule = rules[fieldName];
        if (!rule) return { valid: true, message: '' };
        const trimmedValue = value ? value.trim() : '';

        if (fieldName === 'customOs') {
            if (context.osModel === 'Other' && !trimmedValue) {
                return { valid: false, message: rule.message };
            }
            return { valid: true, message: '' };
        }

        if (rule.required && !trimmedValue) return { valid: false, message: rule.message };
        if (trimmedValue && rule.minLength && trimmedValue.length < rule.minLength) return { valid: false, message: rule.message };
        if (trimmedValue && rule.pattern && !rule.pattern.test(trimmedValue)) return { valid: false, message: rule.message };
        return { valid: true, message: '' };
    }

    function validateAll(formData) {
        const errors = {};
        let isValid = true;
        ['computerType', 'institutionName', 'computerNumber', 'serialNumber', 'monitorSid', 'mouseSid', 'officePackageType', 'osModel', 'assetStatus'].forEach(fieldName => {
            const result = validateField(fieldName, formData[fieldName], formData);
            if (!result.valid) { errors[fieldName] = result.message; isValid = false; }
        });
        if (formData.osModel === 'Other') {
            const customResult = validateField('customOs', formData.customOs, formData);
            if (!customResult.valid) { errors.customOs = customResult.message; isValid = false; }
        }
        return { valid: isValid, errors };
    }

    function showError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (field) field.classList.add('invalid');
        if (errorElement) errorElement.textContent = message;
    }

    function clearError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (field) field.classList.remove('invalid');
        if (errorElement) errorElement.textContent = '';
    }

    function clearAllErrors() {
        document.querySelectorAll('.invalid').forEach(f => f.classList.remove('invalid'));
        document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    }

    function displayErrors(errors) {
        clearAllErrors();
        Object.keys(errors).forEach(fieldName => showError(fieldName, errors[fieldName]));
    }

    function collectFormData(form) {
        const data = {};
        new FormData(form).forEach((value, key) => { data[key] = value; });
        return data;
    }

    function setupRealTimeValidation(form) {
        form.querySelectorAll('input[type="text"], select').forEach(field => {
            field.addEventListener('blur', () => {
                const formData = collectFormData(form);
                const result = validateField(field.name, field.value, formData);
                if (!result.valid) showError(field.name, result.message);
                else clearError(field.name);
            });
            field.addEventListener('input', () => clearError(field.name));
        });
    }

    return { validateField, validateAll, showError, clearError, clearAllErrors, displayErrors, collectFormData, setupRealTimeValidation };
})();
