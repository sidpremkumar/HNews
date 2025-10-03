import { getContentExtractionSummary } from './simpleContentExtractor';

/**
 * Fetch webpage content and extract clean, readable text
 * Similar to Apple's Reader Mode functionality
 * 
 * @param url - URL to fetch content from
 * @returns Promise with extracted content and metadata
 */
export const fetchAndExtractContent = async (url: string): Promise<{
    success: boolean;
    content: string | null;
    title?: string;
    url: string;
    extractionMethod: 'readability' | 'fallback' | 'failed';
    processingTime: number;
    originalLength: number;
    extractedLength: number;
    compressionRatio: number;
    error?: string;
}> => {
    const startTime = Date.now();

    try {
        console.log(`Fetching content from: ${url}`);

        // Fetch the webpage
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; HNewsApp/1.0; +https://github.com/sidpremkumar/HNews)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            },
            timeout: 10000, // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        console.log(`Fetched ${html.length} characters of HTML`);

        // Extract clean content
        const extractionResult = getContentExtractionSummary(html, url);

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        return {
            success: extractionResult.success,
            content: extractionResult.finalContent,
            title: extractTitle(html),
            url,
            extractionMethod: extractionResult.method as 'readability' | 'fallback' | 'failed',
            processingTime: totalTime,
            originalLength: extractionResult.originalLength,
            extractedLength: extractionResult.extractedLength,
            compressionRatio: extractionResult.compressionRatio,
        };

    } catch (error) {
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        console.error('Content extraction failed:', error);

        return {
            success: false,
            content: null,
            url,
            extractionMethod: 'failed',
            processingTime: totalTime,
            originalLength: 0,
            extractedLength: 0,
            compressionRatio: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Extract title from HTML
 * 
 * @param html - HTML content
 * @returns Page title or null
 */
const extractTitle = (html: string): string | null => {
    try {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1].trim() : null;
    } catch {
        return null;
    }
};

/**
 * Check if a URL is likely to have readable content
 * 
 * @param url - URL to check
 * @returns True if URL looks like it has article content
 */
export const isLikelyArticle = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        // Skip common non-article domains
        const skipDomains = [
            'github.com',
            'youtube.com',
            'youtu.be',
            'twitter.com',
            'x.com',
            'reddit.com',
            'linkedin.com',
            'facebook.com',
            'instagram.com',
            'tiktok.com',
            'news.ycombinator.com'
        ];

        if (skipDomains.some(domain => hostname.includes(domain))) {
            return false;
        }

        // Check for article-like paths
        const pathname = urlObj.pathname.toLowerCase();
        const articlePaths = [
            '/article/',
            '/post/',
            '/blog/',
            '/news/',
            '/story/',
            '/read/',
            '/content/'
        ];

        return articlePaths.some(path => pathname.includes(path)) ||
            pathname.length > 10; // Long paths often indicate articles

    } catch {
        return false;
    }
};
