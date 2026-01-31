/**
 * QR Code Generator Module
 * Uses qrcode-generator library
 */
const QRGenerator = (function () {
    'use strict';

    let currentQR = null;
    let logoImage = null;

    function formatData(data) {
        let content = `Computer Type: ${data.computerType}\n`;
        content += `Institution Name: ${data.institutionName}\n`;
        content += `Computer Number: ${data.computerNumber}\n`;
        content += `Computer Serial Number: ${data.serialNumber}\n`;
        content += `OS Model: ${data.osModel === 'Other' ? data.customOs : data.osModel}\n`;
        content += `Asset Status: ${data.assetStatus}`;

        if (data.includeTimestamp) {
            content += `\nGenerated: ${new Date().toISOString()}`;
        }
        if (data.includeRefId) {
            content += `\nRef ID: ${generateRefId()}`;
        }
        return content;
    }

    function generateRefId() {
        return 'AST-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    function generate(data, options = {}) {
        const content = formatData(data);
        const size = options.size || 256;

        // Create QR using qrcode-generator library
        const qr = qrcode(0, 'H'); // Type 0 = auto, 'H' = high error correction
        qr.addData(content);
        qr.make();

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const moduleCount = qr.getModuleCount();
        const cellSize = Math.floor(size / moduleCount);
        const actualSize = cellSize * moduleCount;

        canvas.width = actualSize;
        canvas.height = actualSize;

        // Draw white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, actualSize, actualSize);

        // Draw QR modules
        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }

        // Add logo if provided
        if (logoImage && options.includeLogo !== false) {
            const logoSize = actualSize * 0.2;
            const logoX = (actualSize - logoSize) / 2;
            const logoY = (actualSize - logoSize) / 2;

            // White background for logo
            ctx.fillStyle = '#FFFFFF';
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
