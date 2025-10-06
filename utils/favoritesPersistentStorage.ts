import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteArticle, FavoritesReducer } from '../Redux/favoritesReducer';

const FAVORITES_CACHE_KEY = 'favorites_cache';

/**
 * Load favorites cache from persistent storage
 */
export const loadFavoritesCache = async (): Promise<FavoritesReducer> => {
    try {
        const cachedData = await AsyncStorage.getItem(FAVORITES_CACHE_KEY);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            console.log('📦 Loaded favorites cache from storage:', {
                totalFavorites: Object.keys(parsed.favorites || {}).length,
                lastCleanup: parsed.lastCleanup
            });
            return parsed;
        }
    } catch (error) {
        console.error('❌ Error loading favorites cache from storage:', error);
    }

    // Return default state if loading fails
    return {
        favorites: {},
        lastCleanup: Date.now(),
    };
};

/**
 * Save favorites cache to persistent storage
 */
export const saveFavoritesCache = async (cache: FavoritesReducer): Promise<void> => {
    try {
        await AsyncStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(cache));
        console.log('💾 Saved favorites cache to storage:', {
            totalFavorites: Object.keys(cache.favorites).length,
            lastCleanup: cache.lastCleanup
        });
    } catch (error) {
        console.error('❌ Error saving favorites cache to storage:', error);
    }
};

/**
 * Save a single favorite to persistent storage
 */
export const saveFavorite = async (favorite: FavoriteArticle): Promise<void> => {
    try {
        // Load current cache
        const currentCache = await loadFavoritesCache();

        // Add the new favorite
        currentCache.favorites[favorite.postId] = favorite;

        // Save back to storage
        await saveFavoritesCache(currentCache);

        console.log('💾 Saved single favorite to storage:', {
            postId: favorite.postId,
            totalFavorites: Object.keys(currentCache.favorites).length
        });
    } catch (error) {
        console.error('❌ Error saving single favorite to storage:', error);
    }
};

/**
 * Remove a single favorite from persistent storage
 */
export const removeFavorite = async (postId: number): Promise<void> => {
    try {
        // Load current cache
        const currentCache = await loadFavoritesCache();

        // Remove the favorite
        delete currentCache.favorites[postId];

        // Save back to storage
        await saveFavoritesCache(currentCache);

        console.log('🗑️ Removed favorite from storage:', {
            postId,
            totalFavorites: Object.keys(currentCache.favorites).length
        });
    } catch (error) {
        console.error('❌ Error removing favorite from storage:', error);
    }
};

/**
 * Clear all favorites from persistent storage
 */
export const clearAllFavorites = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(FAVORITES_CACHE_KEY);
        console.log('🗑️ Cleared all favorites from storage');
    } catch (error) {
        console.error('❌ Error clearing favorites from storage:', error);
    }
};

/**
 * Get favorites statistics from persistent storage
 */
export const getFavoritesStats = async (): Promise<{
    totalFavorites: number;
    lastCleanup: number;
    oldestFavorite?: number;
    newestFavorite?: number;
}> => {
    try {
        const cache = await loadFavoritesCache();
        const favorites = Object.values(cache.favorites);

        return {
            totalFavorites: favorites.length,
            lastCleanup: cache.lastCleanup,
            oldestFavorite: favorites.length > 0 ? Math.min(...favorites.map(f => f.favoritedAt)) : undefined,
            newestFavorite: favorites.length > 0 ? Math.max(...favorites.map(f => f.favoritedAt)) : undefined,
        };
    } catch (error) {
        console.error('❌ Error getting favorites stats from storage:', error);
        return {
            totalFavorites: 0,
            lastCleanup: Date.now(),
        };
    }
};
