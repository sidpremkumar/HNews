import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { clearAllFavorites as clearAllFavoritesStorage, removeFavorite, saveFavorite, saveFavoritesCache } from "../utils/favoritesPersistentStorage";

export interface FavoriteArticle {
    postId: number;
    title: string;
    author: string;
    points: number;
    url: string;
    domain: string;
    createdAt: number; // original post timestamp
    favoritedAt: number; // when user saved it
    customNote?: string;
}

export interface FavoritesReducer {
    favorites: { [postId: number]: FavoriteArticle };
    lastCleanup: number;
}

export const favoritesSlice = createSlice({
    name: "favorites",
    initialState: {
        favorites: {},
        lastCleanup: Date.now(),
    } as FavoritesReducer,
    reducers: {
        loadFavoritesCache: (state, action: PayloadAction<FavoritesReducer>) => {
            return action.payload;
        },

        addToFavorites: (state, action: PayloadAction<{
            postId: number;
            title: string;
            author: string;
            points: number;
            url: string;
            domain: string;
            createdAt: number;
            customNote?: string;
        }>) => {
            const { postId, title, author, points, url, domain, createdAt, customNote } = action.payload;

            const favoriteArticle: FavoriteArticle = {
                postId,
                title,
                author,
                points,
                url,
                domain,
                createdAt,
                favoritedAt: Date.now(),
                customNote,
            };

            state.favorites[postId] = favoriteArticle;

            // Persist to storage asynchronously
            saveFavorite(favoriteArticle).catch(error => {
                console.error('Failed to persist favorite to storage:', error);
            });
        },

        removeFromFavorites: (state, action: PayloadAction<{ postId: number }>) => {
            delete state.favorites[action.payload.postId];

            // Persist removal to storage asynchronously
            removeFavorite(action.payload.postId).catch(error => {
                console.error('Failed to remove favorite from storage:', error);
            });
        },

        toggleFavorite: (state, action: PayloadAction<{
            postId: number;
            title: string;
            author: string;
            points: number;
            url: string;
            domain: string;
            createdAt: number;
            customNote?: string;
        }>) => {
            const { postId, title, author, points, url, domain, createdAt, customNote } = action.payload;

            if (state.favorites[postId]) {
                // Remove if already favorited
                delete state.favorites[postId];

                // Persist removal to storage asynchronously
                removeFavorite(postId).catch(error => {
                    console.error('Failed to remove favorite from storage:', error);
                });
            } else {
                // Add if not favorited
                const favoriteArticle: FavoriteArticle = {
                    postId,
                    title,
                    author,
                    points,
                    url,
                    domain,
                    createdAt,
                    favoritedAt: Date.now(),
                    customNote,
                };
                state.favorites[postId] = favoriteArticle;

                // Persist to storage asynchronously
                saveFavorite(favoriteArticle).catch(error => {
                    console.error('Failed to persist favorite to storage:', error);
                });
            }
        },

        updateFavoriteNote: (state, action: PayloadAction<{ postId: number; note: string }>) => {
            const { postId, note } = action.payload;
            if (state.favorites[postId]) {
                state.favorites[postId].customNote = note;
            }
        },

        clearAllFavorites: (state) => {
            state.favorites = {};

            // Persist clearing to storage asynchronously
            clearAllFavoritesStorage().catch(error => {
                console.error('Failed to clear favorites from storage:', error);
            });
        },

        cleanupOldFavorites: (state, action: PayloadAction<{ maxAgeDays?: number }>) => {
            const maxAgeDays = action.payload.maxAgeDays || 90; // Default 90 days
            const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);

            const removedPostIds: number[] = [];
            Object.keys(state.favorites).forEach(postIdStr => {
                const postId = parseInt(postIdStr);
                const favorite = state.favorites[postId];
                if (favorite && favorite.favoritedAt < cutoffTime) {
                    delete state.favorites[postId];
                    removedPostIds.push(postId);
                }
            });

            state.lastCleanup = Date.now();

            // Persist the cleaned cache to storage asynchronously
            if (removedPostIds.length > 0) {
                saveFavoritesCache(state).catch(error => {
                    console.error('Failed to persist cleaned favorites cache to storage:', error);
                });
            }
        },
    },
    selectors: {
        getFavorite: (state, postId: number) => state.favorites[postId],
        isFavorited: (state, postId: number) => !!state.favorites[postId],
        getAllFavorites: (state) => Object.values(state.favorites),
        getFavoritesCount: (state) => Object.keys(state.favorites).length,
        getFavoritesStats: (state) => ({
            totalFavorites: Object.keys(state.favorites).length,
            lastCleanup: state.lastCleanup,
            oldestFavorite: Math.min(...Object.values(state.favorites).map(f => f.favoritedAt)),
            newestFavorite: Math.max(...Object.values(state.favorites).map(f => f.favoritedAt)),
        }),
    },
});

export const {
    loadFavoritesCache,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    updateFavoriteNote,
    clearAllFavorites,
    cleanupOldFavorites,
} = favoritesSlice.actions;

export const {
    getFavorite,
    isFavorited,
    getAllFavorites,
    getFavoritesCount,
    getFavoritesStats,
} = favoritesSlice.selectors;

export default favoritesSlice.reducer;
