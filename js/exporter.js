/**
 * Export Module - PNG and PDF exports
 */
const Exporter = (function () {
    'use strict';

    function exportPng(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename || 'asset-qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function exportPdf(canvas, assetData, filename) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const qrSize = 60;
        const startX = (pageWidth - qrSize) / 2;

        // Title
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.text('Computer Asset QR Code', pageWidth / 2, 20, { align: 'center' });

        // QR Code
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', startX, 30, qrSize, qrSize);

        // Asset details
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Asset Details', 20, 105);

        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        let y = 115;
        const lineHeight = 7;

        const details = [
            ['Computer Type:', assetData.computerType],
            ['Institution:', assetData.institutionName],
            ['Computer Number:', assetData.computerNumber],
            ['CPU SID:', assetData.serialNumber],
            ['Monitor SID:', assetData.monitorSid || 'N/A'],
            ['Mouse SID:', assetData.mouseSid || 'N/A'],
            ['Office Package:', assetData.officePackageType || 'N/A'],
            ['Location:', assetData.location || 'N/A'],
            ['OS Model:', assetData.osModel === 'Other' ? assetData.customOs : assetData.osModel],
            ['Asset Status:', assetData.assetStatus]
        ];

        details.forEach(([label, value]) => {
            pdf.setFont(undefined, 'bold');
            pdf.text(label, 20, y);
            pdf.setFont(undefined, 'normal');
            pdf.text(value || '', 65, y);
            y += lineHeight;
        });

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 280);

        pdf.save(filename || 'asset-qr-code.pdf');
    }

    function exportBulkPdf(qrCodes, filename) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const qrSize = 40;
        const cols = 3;
        const rows = 5;
        const cellWidth = (pageWidth - (margin * 2)) / cols;
        const cellHeight = (pageHeight - (margin * 2)) / rows;

        let currentPage = 0;

        qrCodes.forEach((qr, index) => {
            const pageIndex = Math.floor(index / (cols * rows));
            if (pageIndex > currentPage) {
                pdf.addPage();
                currentPage = pageIndex;
            }

            const positionOnPage = index % (cols * rows);
            const col = positionOnPage % cols;
            const row = Math.floor(positionOnPage / cols);

            const x = margin + (col * cellWidth) + (cellWidth - qrSize) / 2;
            const y = margin + (row * cellHeight) + 5;

            const imgData = qr.canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);

            pdf.setFontSize(6);
            pdf.text(qr.data.computerNumber, x + qrSize / 2, y + qrSize + 4, { align: 'center' });
        });

        pdf.save(filename || 'bulk-asset-qr-codes.pdf');
    }

    function downloadTemplate() {
        const headers = ['Computer Type', 'Institution Name', 'Computer Number', 'CPU SID', 'Monitor SID', 'Mouse SID', 'Office Package Type', 'Location', 'OS Model', 'Asset Status'];
        const example = ['Desktop', 'Chreso University', 'Chreso01', 'CPU-2234521356992', 'MON-1234567890', 'MOU-0987654321', 'Microsoft 365', 'Room 101 Building A', 'Windows 10 Pro', 'Functional'];
        const csv = headers.join(',') + '\n' + example.join(',') + '\n';

        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.download = 'asset-qr-template.csv';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    async function exportBulkPng(qrCodes, filename) {
        const zip = new JSZip();

        qrCodes.forEach((qr, index) => {
            // Get PNG data from canvas (remove data URL prefix)
            const pngData = qr.canvas.toDataURL('image/png').split(',')[1];
            const fileName = `${qr.data.computerNumber || 'asset-' + (index + 1)}-qr-code.png`;
            zip.file(fileName, pngData, { base64: true });
        });

        // Generate ZIP and download
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = filename || 'bulk-asset-qr-codes.zip';
        link.href = URL.createObjectURL(content);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return { exportPng, exportPdf, exportBulkPdf, exportBulkPng, downloadTemplate };
})();
