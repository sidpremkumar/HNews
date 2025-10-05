/**
 * Simple content extraction for React Native
 * Uses regex patterns to extract readable content from HTML
 * Similar to Apple's Reader Mode but without DOM parsing
 */

/**
 * Extract clean, readable content from HTML using regex patterns
 * 
 * @param html - Raw HTML content from a webpage
 * @returns Clean, readable content or null if extraction fails
 */
export const extractReadableContent = (html: string): string | null => {
    try {
        // Check if html is valid
        if (!html || typeof html !== 'string') {
            console.log('Invalid HTML content provided');
            return null;
        }

        // Remove script and style tags completely
        let cleanHtml = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

        // Remove common non-content elements
        cleanHtml = cleanHtml
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
            .replace(/<ad[^>]*>[\s\S]*?<\/ad>/gi, '')
            .replace(/<div[^>]*class="[^"]*ad[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<div[^>]*class="[^"]*navigation[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

        // Try to find main content areas first
        const contentSelectors = [
            /<article[^>]*>([\s\S]*?)<\/article>/gi,
            /<main[^>]*>([\s\S]*?)<\/main>/gi,
            /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/gi,
            /<div[^>]*class="[^"]*main-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        ];

        for (const selector of contentSelectors) {
            const match = cleanHtml.match(selector);
            if (match && match[1]) {
                const content = extractTextFromHtml(match[1]);
                if (content && content.length > 200) {
                    console.log('Found content using selector:', selector.toString());
                    return content;
                }
            }
        }

        // Fallback: extract all paragraph text
        const paragraphMatches = cleanHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (paragraphMatches && paragraphMatches.length > 0) {
            const paragraphs = paragraphMatches
                .map(match => {
                    const pMatch = match.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
                    return pMatch ? extractTextFromHtml(pMatch[1]) : '';
                })
                .filter(text => text && text.length > 20)
                .join('\n\n');

            if (paragraphs.length > 200) {
                console.log('Using paragraph extraction fallback');
                return paragraphs;
            }
        }

        // Last resort: extract all text content
        const allText = extractTextFromHtml(cleanHtml);
        if (allText && allText.length > 200) {
            console.log('Using full text extraction');
            return allText;
        }

        return null;

    } catch (error) {
        console.error('Content extraction error:', error);
        return null;
    }
};

/**
 * Extract text content from HTML using regex
 * 
 * @param html - HTML content
 * @returns Clean text content
 */
const extractTextFromHtml = (html: string): string => {
    return html
        // Remove HTML tags
        .replace(/<[^>]*>/g, ' ')
        // Decode common HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&hellip;/g, '...')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
};

/**
 * Extract title from HTML
 * 
 * @param html - HTML content
 * @returns Page title or null
 */
export const extractTitle = (html: string): string | null => {
    try {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1].trim() : null;
    } catch {
        return null;
    }
};

/**
 * Get a summary of the content extraction process
 * 
 * @param html - Raw HTML content
 * @returns Object with extraction results and metadata
 */
export const getContentExtractionSummary = (html: string, url?: string) => {
    const startTime = Date.now();

    const readableContent = extractReadableContent(html);

    const endTime = Date.now();

    return {
        success: !!readableContent,
        readableContent,
        fallbackContent: readableContent,
        finalContent: readableContent,
        method: readableContent ? 'readability' : 'fallback',
        processingTime: endTime - startTime,
        originalLength: html.length,
        extractedLength: readableContent?.length || 0,
        compressionRatio: html.length > 0 ? (readableContent?.length || 0) / html.length : 0
    };
};
