// MovieCacheDatabaseHelper.kt
package com.example.vidstreem.Data.LocalDb

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log
import com.example.vidstreem.Data.Model.Movie

class MovieCacheDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val TAG = "MovieCacheDB"
        private const val DATABASE_NAME = "movie_cache.db"
        private const val DATABASE_VERSION = 1

        // Table name
        private const val TABLE_MOVIES = "movies_cache"

        // Column names
        private const val COL_ID = "id"
        private const val COL_TITLE = "title"
        private const val COL_THUMBNAIL_URL = "thumbnail_url"
        private const val COL_VIDEO_URL = "video_url"
        private const val COL_CATEGORY_NAME = "category_name"
        private const val COL_UPLOADED_ON = "uploaded_on"
        private const val COL_DURATION = "duration"
        private const val COL_IS_PREMIUM = "is_premium"
        private const val COL_CACHED_TIME = "cached_time"
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createTable = """
            CREATE TABLE $TABLE_MOVIES (
                $COL_ID INTEGER PRIMARY KEY,
                $COL_TITLE TEXT NOT NULL,
                $COL_THUMBNAIL_URL TEXT,
                $COL_VIDEO_URL TEXT,
                $COL_CATEGORY_NAME TEXT,
                $COL_UPLOADED_ON TEXT NOT NULL,
                $COL_DURATION INTEGER NOT NULL,
                $COL_IS_PREMIUM INTEGER DEFAULT 0,
                $COL_CACHED_TIME INTEGER NOT NULL
            )
        """.trimIndent()

        db.execSQL(createTable)
        Log.d(TAG, "Database created")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_MOVIES")
        onCreate(db)
        Log.d(TAG, "Database upgraded from $oldVersion to $newVersion")
    }

    // Insert single movie
    private fun insertMovieInternal(db: SQLiteDatabase, movie: Movie): Long {
        // Accept movies even without video URL for now
        val values = ContentValues().apply {
            put(COL_ID, movie.id)
            put(COL_TITLE, movie.title)
            put(COL_THUMBNAIL_URL, movie.thumbnailUrl)
            put(COL_VIDEO_URL, movie.videoUrl ?: "")  // Use empty string if null
            put(COL_CATEGORY_NAME, movie.categoryName ?: movie.category?.name)
            put(COL_UPLOADED_ON, movie.uploadedOn)
            put(COL_DURATION, movie.duration)
            put(COL_IS_PREMIUM, if (movie.isPremium == true) 1 else 0)
            put(COL_CACHED_TIME, System.currentTimeMillis())
        }

        return db.insertWithOnConflict(TABLE_MOVIES, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    // Insert multiple movies
    fun insertMovies(movies: List<Movie>): Int {
        if (movies.isEmpty()) {
            Log.w(TAG, "No movies to insert")
            return 0
        }

        val db = writableDatabase
        var successCount = 0
        var failCount = 0

        db.beginTransaction()
        try {
            // Cache up to 100 movies
            movies.take(100).forEach { movie ->
                try {
                    val result = insertMovieInternal(db, movie)
                    if (result > 0) {
                        successCount++
                    } else {
                        failCount++
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error inserting movie ${movie.id}: ${e.message}")
                    failCount++
                }
            }
            db.setTransactionSuccessful()
            Log.d(TAG, "Transaction successful: $successCount inserted, $failCount failed")
        } catch (e: Exception) {
            Log.e(TAG, "Transaction failed", e)
        } finally {
            db.endTransaction()
        }

        Log.d(TAG, "Inserted $successCount movies out of ${movies.size}")
        return successCount
    }

    // Get all cached movies
    fun getAllMovies(): List<Movie> {
        val movies = mutableListOf<Movie>()
        val db = readableDatabase

        try {
            val cursor = db.query(
                TABLE_MOVIES,
                null,
                null,
                null,
                null,
                null,
                "$COL_UPLOADED_ON DESC"
            )

            cursor.use {
                while (it.moveToNext()) {
                    try {
                        movies.add(cursorToMovie(it))
                    } catch (e: Exception) {
                        Log.e(TAG, "Error converting cursor to movie", e)
                    }
                }
            }

            Log.d(TAG, "Retrieved ${movies.size} movies from cache")
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all movies", e)
        }

        return movies
    }

    // Get movies by category
    fun getMoviesByCategory(category: String): List<Movie> {
        val movies = mutableListOf<Movie>()
        val db = readableDatabase

        try {
            val cursor = db.query(
                TABLE_MOVIES,
                null,
                "$COL_CATEGORY_NAME = ?",
                arrayOf(category),
                null,
                null,
                "$COL_UPLOADED_ON DESC"
            )

            cursor.use {
                while (it.moveToNext()) {
                    try {
                        movies.add(cursorToMovie(it))
                    } catch (e: Exception) {
                        Log.e(TAG, "Error converting cursor to movie", e)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting movies by category", e)
        }

        return movies
    }

    // Check if cache is valid (less than 24 hours old)
    fun isCacheValid(): Boolean {
        val db = readableDatabase

        try {
            val cursor = db.rawQuery(
                "SELECT MAX($COL_CACHED_TIME) FROM $TABLE_MOVIES",
                null
            )

            cursor.use {
                if (it.moveToFirst() && !it.isNull(0)) {
                    val lastCacheTime = it.getLong(0)
                    if (lastCacheTime == 0L) {
                        Log.d(TAG, "No cache found")
                        return false
                    }

                    val currentTime = System.currentTimeMillis()
                    val cacheAge = currentTime - lastCacheTime
                    val maxAge = 24 * 60 * 60 * 1000L // 24 hours

                    val isValid = cacheAge < maxAge && cacheAge > 0
                    Log.d(TAG, "Last cache: $lastCacheTime, Current: $currentTime, Age: ${cacheAge / 1000 / 60} minutes, Valid: $isValid")
                    return isValid
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking cache validity", e)
        }

        return false
    }

    // Get movie count
    fun getMovieCount(): Int {
        val db = readableDatabase

        try {
            val cursor = db.rawQuery("SELECT COUNT(*) FROM $TABLE_MOVIES", null)

            cursor.use {
                if (it.moveToFirst()) {
                    return it.getInt(0)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting movie count", e)
        }

        return 0
    }

    // Clear old cache (older than 24 hours) - MODIFIED to not delete recent cache
    fun clearOldCache() {
        val db = writableDatabase
        val cutoffTime = System.currentTimeMillis() - (24 * 60 * 60 * 1000L)

        try {
            val deleted = db.delete(
                TABLE_MOVIES,
                "$COL_CACHED_TIME < ?",
                arrayOf(cutoffTime.toString())
            )

            if (deleted > 0) {
                Log.d(TAG, "Deleted $deleted old cached movies")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing old cache", e)
        }
    }

    // Clear all cache
    fun clearAllCache() {
        val db = writableDatabase
        try {
            val deleted = db.delete(TABLE_MOVIES, null, null)
            Log.d(TAG, "Cleared $deleted cached movies")
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing all cache", e)
        }
    }

    // Convert cursor to Movie object
    private fun cursorToMovie(cursor: Cursor): Movie {
        return Movie(
            id = cursor.getInt(cursor.getColumnIndexOrThrow(COL_ID)),
            title = cursor.getString(cursor.getColumnIndexOrThrow(COL_TITLE)),
            contentType = "video",
            uploadedOn = cursor.getString(cursor.getColumnIndexOrThrow(COL_UPLOADED_ON)),
            description = null,
            size = 0L,
            hasThumbnail = cursor.getString(cursor.getColumnIndexOrThrow(COL_THUMBNAIL_URL)) != null,
            thumbnailUrl = cursor.getString(cursor.getColumnIndexOrThrow(COL_THUMBNAIL_URL)),
            videoUrl = cursor.getString(cursor.getColumnIndexOrThrow(COL_VIDEO_URL)) ?: "",
            duration = cursor.getInt(cursor.getColumnIndexOrThrow(COL_DURATION)),
            category = null,
            categoryName = cursor.getString(cursor.getColumnIndexOrThrow(COL_CATEGORY_NAME)),
            uploadDate = cursor.getString(cursor.getColumnIndexOrThrow(COL_UPLOADED_ON)),
            isPremium = cursor.getInt(cursor.getColumnIndexOrThrow(COL_IS_PREMIUM)) == 1
        )
    }
}
