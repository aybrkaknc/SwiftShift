import { jsPDF } from 'jspdf';
import { LogService } from './logService';

export class PdfService {
    /**
     * Verilen Canvas Data URL'ini PDF'e dönüştürür
     * @param dataUrl Resim verisi (Base64)
     * @param width Resim genişliği
     * @param height Resim yüksekliği
     * @param url Sayfa URL'i (Footer için)
     */
    static async createPdfFromImage(dataUrl: string, width: number, height: number, url: string): Promise<Blob> {
        try {
            // A4 Boyutu (mm)
            const A4_WIDTH = 210;
            const A4_HEIGHT = 297;
            const MARGIN = 10;

            // Resmi A4 genişliğine sığdır
            const contentWidth = A4_WIDTH - (2 * MARGIN);
            const contentHeight = (height * contentWidth) / width;

            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            // Sayfalara böl
            let heightLeft = contentHeight;
            let position = 0;
            let page = 1;

            while (heightLeft > 0) {
                // Her yeni sayfa (ilk sayfa hariç) için addPage
                if (position > 0) {
                    pdf.addPage();
                }

                // Resmi ekle
                // position negatif değer alır, resmi yukarı kaydırır (maskeleme benzeri)
                pdf.addImage(dataUrl, 'PNG', MARGIN, MARGIN - position, contentWidth, contentHeight);

                // Footer ekle
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                pdf.text(`SwiftShift - ${url} - Page ${page}`, MARGIN, A4_HEIGHT - 5);

                heightLeft -= (A4_HEIGHT - (2 * MARGIN));
                position += (A4_HEIGHT - (2 * MARGIN));
                page++;
            }

            return pdf.output('blob');
        } catch (error) {
            LogService.add({ type: 'error', message: 'PDF creation failed', details: String(error) });
            throw error;
        }
    }
}
