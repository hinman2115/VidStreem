// SimpleCacheManager.kt
package com.example.vidstreem.Data.LocalDb

import android.content.Context
import android.util.Log
import com.example.vidstreem.Data.Model.Movie

class MovieCacheManager(context: Context) {

    private val dbHelper = MovieCacheDatabaseHelper(context)

    companion object {
        private const val TAG = "SimpleCacheManager"
    }

    // Save movies to cache - DON'T clear old cache before inserting
    fun cacheMovies(movies: List<Movie>) {
        try {
            if (movies.isEmpty()) {
                Log.w(TAG, "No movies to cache")
                return
            }

            Log.d(TAG, "Starting to cache ${movies.size} movies")

            // Clear old cache AFTER successful insertion
            val count = dbHelper.insertMovies(movies)

            if (count > 0) {
                // Only clear old cache if we successfully inserted new ones
                dbHelper.clearOldCache()
                Log.d(TAG, "Successfully cached $count movies")
            } else {
                Log.w(TAG, "Failed to cache any movies")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error caching movies", e)
        }
    }

    // Get cached movies
    fun getCachedMovies(): List<Movie>? {
        return try {
            val count = dbHelper.getMovieCount()
            Log.d(TAG, "Cache has $count movies")

            if (count == 0) {
                Log.d(TAG, "No cached movies found")
                return null
            }

            if (!dbHelper.isCacheValid()) {
                Log.d(TAG, "Cache expired, clearing")
                dbHelper.clearAllCache()
                return null
            }

            val movies = dbHelper.getAllMovies()
            Log.d(TAG, "Retrieved ${movies.size} cached movies")
            movies
        } catch (e: Exception) {
            Log.e(TAG, "Error retrieving cached movies", e)
            null
        }
    }

    // Get movies by category
    fun getCachedMoviesByCategory(category: String): List<Movie> {
        return try {
            dbHelper.getMoviesByCategory(category)
        } catch (e: Exception) {
            Log.e(TAG, "Error retrieving cached movies by category", e)
            emptyList()
        }
    }

    // Check if cache is valid
    fun isCacheValid(): Boolean {
        return try {
            val count = dbHelper.getMovieCount()
            if (count == 0) return false
            dbHelper.isCacheValid()
        } catch (e: Exception) {
            Log.e(TAG, "Error checking cache validity", e)
            false
        }
    }

    // Clear all cache
    fun clearAllCache() {
        try {
            dbHelper.clearAllCache()
            Log.d(TAG, "All cache cleared")
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing cache", e)
        }
    }

    // Get cache stats
    fun getCacheStats(): String {
        return try {
            val count = dbHelper.getMovieCount()
            val isValid = dbHelper.isCacheValid()
            "Cached movies: $count, Valid: $isValid"
        } catch (e: Exception) {
            "Error getting stats: ${e.message}"
        }
    }
}
