/**
 * PDF Text Extraction Utility
 * Downloads PDF and converts to base64 for direct Gemini API processing
 */

/**
 * Extract text from a PDF URL by downloading and base64 encoding for Gemini
 * 
 * @param pdfUrl - URL of the PDF file
 * @returns Promise with base64 encoded PDF data for Gemini API
 */
export const extractTextFromPDF = async (pdfUrl: string): Promise<{
    success: boolean;
    text?: string;
    error?: string;
    pageCount?: number;
    base64Data?: string;
    mimeType?: string;
}> => {
    try {
        console.log('Downloading PDF for Gemini processing:', pdfUrl);

        // Download the PDF
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.status}`);
        }

        // For React Native, we need to handle binary data differently
        // Use response.arrayBuffer() which is available in React Native
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert to base64 using a React Native compatible method
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binaryString);

        const filename = pdfUrl.split('/').pop() || 'document.pdf';

        return {
            success: true,
            text: `PDF Document: ${filename} (ready for Gemini processing)`,
            base64Data: base64,
            mimeType: 'application/pdf',
            pageCount: 1,
        };

    } catch (error) {
        console.error('PDF download error:', error);

        // Fallback: Try to extract basic info from PDF URL
        return await extractPDFMetadata(pdfUrl);
    }
};

/**
 * Extract basic metadata from PDF URL as fallback
 * 
 * @param pdfUrl - URL of the PDF file
 * @returns Promise with basic PDF info
 */
const extractPDFMetadata = async (pdfUrl: string): Promise<{
    success: boolean;
    text?: string;
    error?: string;
    pageCount?: number;
}> => {
    try {
        // Try to get PDF info from the URL
        const response = await fetch(pdfUrl, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; HNewsApp/1.0)',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to access PDF: ${response.status}`);
        }

        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');

        // Create a basic description based on the URL and headers
        const urlParts = pdfUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const size = contentLength ? `(${Math.round(parseInt(contentLength) / 1024)}KB)` : '';

        const basicInfo = `PDF Document: ${filename} ${size}
    
This appears to be a PDF document that cannot be automatically processed for text extraction. The document may contain important information, but the full content cannot be summarized at this time.

To read the full content, please open the PDF in a compatible viewer or browser.`;

        return {
            success: true,
            text: basicInfo,
            pageCount: 1,
        };

    } catch (error) {
        console.error('PDF metadata extraction error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process PDF',
        };
    }
};

/**
 * Check if a URL points to a PDF file
 * 
 * @param url - URL to check
 * @returns True if URL appears to be a PDF
 */
export const isPDFUrl = (url: string): boolean => {
    try {
        const urlLower = url.toLowerCase();
        return urlLower.includes('.pdf') || urlLower.includes('pdf');
    } catch {
        return false;
    }
};

/**
 * Get a user-friendly description of PDF content
 * 
 * @param pdfUrl - URL of the PDF file
 * @returns Promise with PDF description
 */
export const getPDFDescription = async (pdfUrl: string): Promise<string> => {
    const extraction = await extractTextFromPDF(pdfUrl);

    if (extraction.success && extraction.text) {
        // Limit text length for AI processing
        const maxLength = 2000;
        const text = extraction.text.length > maxLength
            ? extraction.text.substring(0, maxLength) + '...'
            : extraction.text;

        return `PDF Content:\n${text}`;
    } else {
        return `PDF Document: Unable to extract text content. The document may be password-protected, corrupted, or in a format that cannot be processed automatically.`;
    }
};
