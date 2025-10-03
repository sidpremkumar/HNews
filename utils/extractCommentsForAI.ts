import { AlgoliaCommentRaw } from './HackerNewsClient/HackerNewsClient.types';

/**
 * Extract top comments and their nested replies for AI summary
 * @param comments - Array of top-level comments
 * @param maxTopComments - Maximum number of top comments to include (default: 10)
 * @param maxNestedComments - Maximum number of nested comments per top comment (default: 10)
 * @returns Formatted string with comments for AI processing
 */
export const extractCommentsForAI = (
    comments: AlgoliaCommentRaw[],
    maxTopComments: number = 10,
    maxNestedComments: number = 10
): string => {
    if (!comments || comments.length === 0) {
        return 'No comments available.';
    }

    const topComments = comments.slice(0, maxTopComments);

    let commentsText = 'Top Comments:\n\n';

    topComments.forEach((comment, index) => {
        // Add the main comment with better formatting for quotes
        commentsText += `Comment ${index + 1} by ${comment.author} (${comment.points} points):\n`;
        commentsText += `"${comment.text}"\n\n`;

        // Add nested comments (up to maxNestedComments)
        if (comment.children && comment.children.length > 0) {
            const nestedComments = comment.children.slice(0, maxNestedComments);
            nestedComments.forEach((nestedComment, nestedIndex) => {
                commentsText += `  Reply by ${nestedComment.author} (${nestedComment.points} points):\n`;
                commentsText += `  "${nestedComment.text}"\n\n`;
            });

            if (comment.children.length > maxNestedComments) {
                commentsText += `  ... and ${comment.children.length - maxNestedComments} more replies\n\n`;
            }
        }
    });

    if (comments.length > maxTopComments) {
        commentsText += `... and ${comments.length - maxTopComments} more top-level comments\n`;
    }

    return commentsText;
};

/**
 * Get a simplified version of comments for AI processing
 * @param comments - Array of comments
 * @param maxComments - Maximum number of comments to include
 * @returns Simplified comments data
 */
export const getSimplifiedComments = (
    comments: AlgoliaCommentRaw[],
    maxComments: number = 20
): string => {
    if (!comments || comments.length === 0) {
        return 'No comments available.';
    }

    const allComments = flattenComments(comments).slice(0, maxComments);

    let commentsText = 'Key Comments:\n\n';

    allComments.forEach((comment, index) => {
        commentsText += `${index + 1}. ${comment.author}: ${comment.text}\n\n`;
    });

    return commentsText;
};

/**
 * Flatten nested comments into a single array
 * @param comments - Array of comments with nested children
 * @returns Flattened array of comments
 */
const flattenComments = (comments: AlgoliaCommentRaw[]): AlgoliaCommentRaw[] => {
    const result: AlgoliaCommentRaw[] = [];

    const flatten = (commentList: AlgoliaCommentRaw[]) => {
        commentList.forEach(comment => {
            result.push(comment);
            if (comment.children && comment.children.length > 0) {
                flatten(comment.children);
            }
        });
    };

    flatten(comments);
    return result;
};
