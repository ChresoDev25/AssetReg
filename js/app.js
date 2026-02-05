/**
 * Main Application Controller
 */
(function () {
    'use strict';

    // DOM Elements
    const form = document.getElementById('assetForm');
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const osModelSelect = document.getElementById('osModel');
    const customOsGroup = document.getElementById('customOsGroup');
    const toggleOptionalBtn = document.getElementById('toggleOptional');
    const optionalFields = document.getElementById('optionalFields');
    const licenseStatusSelect = document.getElementById('licenseStatus');
    const licenseActivationGroup = document.getElementById('licenseActivationGroup');
    const logoUpload = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const removeLogo = document.getElementById('removeLogo');
    const emptyState = document.getElementById('emptyState');
    const qrDisplay = document.getElementById('qrDisplay');
    const qrWrapper = document.getElementById('qrWrapper');
    const qrCodeContainer = document.getElementById('qrCode');
    const encodedData = document.getElementById('encodedData');
    const exportActions = document.getElementById('exportActions');
    const exportPngBtn = document.getElementById('exportPng');
    const exportPdfBtn = document.getElementById('exportPdf');
    const toastContainer = document.getElementById('toastContainer');
    const csvUpload = document.getElementById('csvUpload');
    const csvUploadBtn = document.getElementById('csvUploadBtn');
    const downloadTemplateBtn = document.getElementById('downloadTemplate');
    const fileInfo = document.getElementById('fileInfo');
    const bulkResults = document.getElementById('bulkResults');

    // Initialize
    function init() {
        Validator.setupRealTimeValidation(form);
        bindEvents();
    }

    function bindEvents() {
        form.addEventListener('submit', handleSubmit);
        form.addEventListener('reset', handleReset);
        osModelSelect.addEventListener('change', handleOsChange);
        licenseStatusSelect.addEventListener('change', handleLicenseStatusChange);
        toggleOptionalBtn.addEventListener('click', toggleOptionalFields);
        logoUpload.addEventListener('change', handleLogoUpload);
        removeLogo.addEventListener('click', handleRemoveLogo);
        exportPngBtn.addEventListener('click', handleExportPng);
        exportPdfBtn.addEventListener('click', handleExportPdf);
        csvUploadBtn.addEventListener('click', () => csvUpload.click());
        csvUpload.addEventListener('change', handleCsvUpload);
        downloadTemplateBtn.addEventListener('click', () => Exporter.downloadTemplate());
    }

    function handleSubmit(e) {
        e.preventDefault();
        const formData = Validator.collectFormData(form);
        const validation = Validator.validateAll(formData);

        if (!validation.valid) {
            Validator.displayErrors(validation.errors);
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const { canvas, content } = QRGenerator.generate(formData, { size: 300 });
            displayQR(canvas, content);
            showToast('QR Code generated successfully!', 'success');
        } catch (error) {
            console.error('QR generation error:', error);
            showToast('Error generating QR code', 'error');
        }
    }

    function handleReset() {
        Validator.clearAllErrors();
        QRGenerator.clearLogo();
        logoPreview.classList.add('hidden');
        customOsGroup.classList.add('hidden');
        licenseActivationGroup.classList.add('hidden');
        hideQR();
    }

    function handleOsChange() {
        customOsGroup.classList.toggle('hidden', osModelSelect.value !== 'Other');
    }

    function handleLicenseStatusChange() {
        licenseActivationGroup.classList.toggle('hidden', licenseStatusSelect.value !== 'Activated');
    }

    function toggleOptionalFields() {
        optionalFields.classList.toggle('hidden');
        toggleOptionalBtn.classList.toggle('active');
    }

    function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            logoPreviewImg.src = event.target.result;
            logoPreview.classList.remove('hidden');
            QRGenerator.setLogo(event.target.result);
        };
        reader.readAsDataURL(file);
    }

    function handleRemoveLogo() {
        logoUpload.value = '';
        logoPreview.classList.add('hidden');
        QRGenerator.clearLogo();
    }

    function displayQR(canvas, content) {
        qrCodeContainer.innerHTML = '';
        qrCodeContainer.appendChild(canvas);

        // Pretty print JSON for display if possible, otherwise show raw
        let displayText = content;
        try {
            if (content.startsWith('{')) {
                const jsonObj = JSON.parse(content);
                displayText = JSON.stringify(jsonObj, null, 2);
            }
        } catch (e) { /* ignore */ }

        encodedData.textContent = displayText;
        emptyState.classList.add('hidden');
        qrDisplay.classList.remove('hidden');
        exportActions.classList.remove('hidden');
    }

    function hideQR() {
        qrCodeContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        qrDisplay.classList.add('hidden');
        exportActions.classList.add('hidden');
    }

    function handleExportPng() {
        const qr = QRGenerator.getCurrentQR();
        if (qr) {
            const filename = `${qr.data.computerNumber}-qr-code.png`;
            Exporter.exportPng(qr.canvas, filename);
            showToast('PNG exported successfully!', 'success');
        }
    }

    function handleExportPdf() {
        const qr = QRGenerator.getCurrentQR();
        if (qr) {
            const filename = `${qr.data.computerNumber}-qr-code.pdf`;
            Exporter.exportPdf(qr.canvas, qr.data, filename);
            showToast('PDF exported successfully!', 'success');
        }
    }

    function handleCsvUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        fileInfo.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target.result;
            const rows = csv.split('\n').filter(row => row.trim());
            const headers = rows[0].split(',').map(h => h.trim());

            const qrCodes = [];
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',').map(v => v.trim());
                if (values.length >= 5) {
                    const data = {
                        computerType: values[0],
                        institutionName: values[1],
                        computerNumber: values[2],
                        serialNumber: values[3],
                        keyboardSid: values[4] || '',
                        monitorSid: values[5] || '',
                        mouseSid: values[6] || '',
                        officePackageType: values[7] || '',
                        location: values[8] || '',
                        osModel: values[9] || '',
                        assetStatus: values[10] || 'Functional',
                        licenseStatus: values[11] || '',
                        licenseActivationDate: values[12] || ''
                    };
                    const { canvas, content } = QRGenerator.generate(data, { size: 256 });
                    qrCodes.push({ canvas, content, data });
                }
            }

            if (qrCodes.length > 0) {
                bulkResults.classList.remove('hidden');
                document.getElementById('progressText').textContent = `${qrCodes.length} QR codes generated`;
                document.getElementById('progressFill').style.width = '100%';

                document.getElementById('exportAllPdf').onclick = () => {
                    Exporter.exportBulkPdf(qrCodes, 'bulk-asset-qr-codes.pdf');
                    showToast(`Exported ${qrCodes.length} QR codes to PDF`, 'success');
                };

                document.getElementById('exportAllPng').onclick = async () => {
                    try {
                        await Exporter.exportBulkPng(qrCodes, 'bulk-asset-qr-codes.zip');
                        showToast(`Exported ${qrCodes.length} QR codes to ZIP`, 'success');
                    } catch (error) {
                        console.error('ZIP export error:', error);
                        showToast('Error exporting ZIP file', 'error');
                    }
                };

                showToast(`${qrCodes.length} QR codes generated from CSV`, 'success');
            }
        };
        reader.readAsText(file);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success'
                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
            </svg>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
