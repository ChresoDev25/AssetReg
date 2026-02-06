/**
 * QR Code Generator Module
 * Uses qrcode-generator library
 */
const QRGenerator = (function () {
    'use strict';

    let currentQR = null;
    let logoImage = null;

    function formatData(data) {
        // Construct minified JSON payload (Schema v1)
        const payload = {
            v: 1,
            ct: data.computerType,          // computerType
            in: data.institutionName,       // institutionName
            cn: data.computerNumber,        // computerNumber
            cs: data.serialNumber,          // cpuSid (serialNumber)
            ksid: data.keyboardSid,         // keyboardSid
            os: data.osModel === 'Other' ? data.customOs : data.osModel, // osModel
            as: data.assetStatus,           // assetStatus
            ls: data.licenseStatus          // licenseStatus
        };

        // Add optional fields only if they exist
        if (data.monitorSid) payload.ms = data.monitorSid;        // monitorSid
        if (data.mouseSid) payload.mus = data.mouseSid;           // mouseSid
        if (data.officePackageType) payload.op = data.officePackageType; // officePackage
        if (data.location) payload.loc = data.location;           // location
        if (data.licenseStatus === 'Activated' && data.licenseActivationDate) {
            payload.lad = data.licenseActivationDate; // licenseActivationDate
        }

        // Return minified JSON string
        return JSON.stringify(payload);
    }

    function generateRefId() {
        return 'AST-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    function generate(data, options = {}) {
        const content = formatData(data);
        const size = options.size || 512; // Increased default size for better resolution

        // Create QR using qrcode-generator library
        // Type 0 = auto, 'M' = Medium error correction (15%) - optimizes density
        const qr = qrcode(0, 'M');
        qr.addData(content);
        qr.make();

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const moduleCount = qr.getModuleCount();

        // Quiet Zone: 4 modules white border
        const quietZone = 4;
        const totalModules = moduleCount + (2 * quietZone);

        const cellSize = Math.floor(size / totalModules);
        const actualSize = cellSize * totalModules;

        canvas.width = actualSize;
        canvas.height = actualSize;

        // Draw white background (clean quiet zone)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, actualSize, actualSize);

        // Calculate offset for inner QR
        const offset = quietZone * cellSize;

        // Draw QR modules
        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(offset + (col * cellSize), offset + (row * cellSize), cellSize, cellSize);
                }
            }
        }

        // Add logo if provided
        if (logoImage && options.includeLogo !== false) {
            // Logo size should be about 20% of the actual QR code area (excluding quiet zone)
            const qrAreaSize = cellSize * moduleCount;
            const logoSize = qrAreaSize * 0.2;

            // Center logo in the QR area (taking offset into account)
            const logoX = offset + ((qrAreaSize - logoSize) / 2);
            const logoY = offset + ((qrAreaSize - logoSize) / 2);

            // White background for logo
            ctx.fillStyle = '#FFFFFF';
            // Add slight padding to logo background
            ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }

        currentQR = { canvas, content, data };
        return { canvas, content };
    }

    function setLogo(imageData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { logoImage = img; resolve(img); };
            img.onerror = reject;
            img.src = imageData;
        });
    }

    function clearLogo() { logoImage = null; }
    function getCurrentQR() { return currentQR; }
    function getDataUrl(format = 'image/png') { return currentQR ? currentQR.canvas.toDataURL(format) : null; }

    // Load the default Chreso logo automatically
    function loadDefaultLogo() {
        const img = new Image();
        img.onload = () => { logoImage = img; };
        img.onerror = () => { console.warn('Default logo not found'); };
        img.src = 'img/chreso-logo.png';
    }

    // Initialize default logo on load
    loadDefaultLogo();

    return { generate, formatData, setLogo, clearLogo, getCurrentQR, getDataUrl, loadDefaultLogo };
})();
