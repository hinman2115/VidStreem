package com.example.vidstreem.Ui

import com.example.vidstreem.Data.Viewmodel.MovieDetailViewModel
import SessionManager
import android.content.Intent
import android.content.pm.ActivityInfo
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.vidstreem.Adapters.MovieAdapter
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.Model.Movie
import com.example.vidstreem.Data.Model.WatchHistoryDto
import com.example.vidstreem.R
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.ui.PlayerView
import kotlinx.coroutines.launch
import org.json.JSONObject

class MovieDetailActivity : AppCompatActivity() {

    private lateinit var viewModel: MovieDetailViewModel

    private var exoPlayer: ExoPlayer? = null
    private lateinit var playerView: PlayerView
    private lateinit var progressBar: ProgressBar
    private lateinit var detailsContainer: View
    private lateinit var titleTextView: TextView
    private lateinit var descriptionTextView: TextView
    private lateinit var loadingContainer: View

    // Fullscreen state
    private var isFullscreen = false
    private var originalPlayerHeight: Int = ViewGroup.LayoutParams.WRAP_CONTENT

    // Playback state persistence
    private var pendingVideoUrl: String? = null
    private var lastKnownPositionMs: Long = 0L
    private var playWhenReady: Boolean = true
    private var currentMovieId: Int = -1
    private var videoDuration: Long = 0L

    // Recommended videos
    private lateinit var recommendedRecyclerView: RecyclerView
    private lateinit var recommendedAdapter: MovieAdapter
    private lateinit var recommendedProgress: ProgressBar

    private val progressHandler = Handler(Looper.getMainLooper())
    private val progressRunnable = object : Runnable {
        override fun run() {
            val player = exoPlayer ?: return
            if (player.isPlaying) {
                sendWatchUpdate()
                progressHandler.postDelayed(this, 10_000L)
            }
        }
    }

    private val playerListener = object : Player.Listener {
        override fun onPlaybackStateChanged(state: Int) {
            when (state) {
                Player.STATE_READY -> {
                    videoDuration = exoPlayer?.duration ?: 0L
                    progressHandler.post(progressRunnable)
                    hideBuffering()
                }
                Player.STATE_ENDED -> {
                    sendWatchUpdate(completed = true)
                    progressHandler.removeCallbacks(progressRunnable)
                }
                Player.STATE_BUFFERING -> showBuffering()
                Player.STATE_IDLE -> hideBuffering()
            }
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            if (isPlaying) progressHandler.post(progressRunnable) else sendWatchUpdate()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_movie_detail)

        // Initialize Views
        playerView = findViewById(R.id.player_view)
        progressBar = findViewById(R.id.progress_bar)
        detailsContainer = findViewById(R.id.details_container)
        titleTextView = findViewById(R.id.movie_title_detail)
        descriptionTextView = findViewById(R.id.movie_description_detail)
        loadingContainer = findViewById(R.id.loading_container)

        // Recommended
        recommendedRecyclerView = findViewById(R.id.recommended_videos_recycler)
        recommendedProgress = findViewById(R.id.recommended_progress)
        setupRecommendedVideos()

        originalPlayerHeight = playerView.layoutParams.height
        setupCustomControls()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (isFullscreen) {
                    isFullscreen = false
                    exitFullscreen()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        currentMovieId = intent.getIntExtra("Id", -1)
        if (currentMovieId <= 0) {
            Toast.makeText(this, "Error: Movie ID not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        viewModel = ViewModelProvider(this)[MovieDetailViewModel::class.java]

        // Load watch history first
        loadWatchHistory()

        // Load details
        viewModel.fetchMovieDetails(currentMovieId)
        viewModel.movieDetails.observe(this) { movie ->
            progressBar.visibility = View.GONE
            loadingContainer.visibility = View.GONE

            if (movie != null) {
                bindMovieDetails(movie)
                ensureAccessOrRedirect {
                    pendingVideoUrl = movie.videoUrl
                    initializePlayer(pendingVideoUrl)
                    detailsContainer.visibility = View.VISIBLE
                    loadRecommendedVideos()
                }
            } else {
                Toast.makeText(this, "Failed to load movie details", Toast.LENGTH_SHORT).show()
            }

        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Restore state after rotation
        if (savedInstanceState != null) {
            lastKnownPositionMs = savedInstanceState.getLong("last_pos", 0L)
            playWhenReady = savedInstanceState.getBoolean("play_when_ready", true)
            isFullscreen = savedInstanceState.getBoolean("is_fullscreen", false)
            if (isFullscreen) enterFullscreen(applyOrientation = false)
        }
    }

    private fun setupRecommendedVideos() {
        recommendedAdapter = MovieAdapter { movie ->
            val intent = Intent(this, MovieDetailActivity::class.java)
            intent.putExtra("Id", movie.id)
            finish()
            startActivity(intent)
        }
        recommendedRecyclerView.apply {
            layoutManager = GridLayoutManager(this@MovieDetailActivity, 2)
            adapter = recommendedAdapter
            setHasFixedSize(false)
        }
    }

    private fun loadRecommendedVideos() {
        recommendedProgress.visibility = View.VISIBLE
        lifecycleScope.launch {
            try {
                val response = RetrofitInstance.api.getAllVideos()
                if (response.isSuccessful) {
                    val allVideos = response.body() ?: emptyList()
                    val recommendedVideos = allVideos
                        .filter { it.id != currentMovieId }
                        .shuffled()
                        .take(10)
                    recommendedAdapter.updateMovies(recommendedVideos)
                    recommendedProgress.visibility = View.GONE
                } else {
                    recommendedProgress.visibility = View.GONE
                    Toast.makeText(this@MovieDetailActivity, "Failed to load recommendations", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                recommendedProgress.visibility = View.GONE
                Log.e("RecommendedVideos", "Error: ${e.message}", e)
            }
        }
    }
    private suspend fun hasSubscription(): Boolean {
        val token = SessionManager(applicationContext).fetchAuthToken() ?: return false
        Log.d("TOKEN", "Bearer $token")

        val resp = RetrofitInstance.subapi.checkAccess("Bearer $token")
        if (!resp.isSuccessful) return false
        val body = resp.body() ?: return false
        // body like { success: true, hasAccess: true/false }
        val hasAccess = (body["hasAccess"] as? Boolean) ?: false
        return hasAccess
    }

    private fun ensureAccessOrRedirect(onReady: () -> Unit) {
        lifecycleScope.launch {
            try {
                if (hasSubscription()) {
                    onReady()
                } else {
                    // open plans screen
                    val intent = Intent(this@MovieDetailActivity, Subscriptionplanactivity::class.java)
                    // optionally pass return target or movie id
                    intent.putExtra("return_to_movie_id", currentMovieId)
                    startActivity(intent)
                    finish()
                }
            } catch (_: Exception) {
                // if API fails, default to no access and show plans
                val intent = Intent(this@MovieDetailActivity, Subscriptionplanactivity::class.java)
                intent.putExtra("return_to_movie_id", currentMovieId)
                startActivity(intent)
                finish()
            }
        }
    }

    private fun setupCustomControls() {
        val centerPlayPause: ImageButton? = playerView.findViewById(R.id.exo_play_pause_center)
        centerPlayPause?.setOnClickListener {
            exoPlayer?.let { player -> if (player.isPlaying) player.pause() else player.play() }
        }

        val playButton: ImageButton? = playerView.findViewById(R.id.exo_play)
        val pauseButton: ImageButton? = playerView.findViewById(R.id.exo_pause)
        playButton?.setOnClickListener { exoPlayer?.play() }
        pauseButton?.setOnClickListener { exoPlayer?.pause() }

        val fullscreenButton: ImageButton? = playerView.findViewById(R.id.exo_fullscreen)
        fullscreenButton?.setOnClickListener {
            isFullscreen = !isFullscreen
            if (isFullscreen) enterFullscreen() else exitFullscreen()
        }

        val rewindButton: ImageButton? = playerView.findViewById(R.id.exo_rew_10)
        rewindButton?.setOnClickListener {
            exoPlayer?.let { player ->
                val newPosition = (player.currentPosition - 10000L).coerceAtLeast(0L)
                player.seekTo(newPosition)
            }
        }

        val forwardButton: ImageButton? = playerView.findViewById(R.id.exo_ffwd_10)
        forwardButton?.setOnClickListener {
            exoPlayer?.let { player ->
                val newPosition = (player.currentPosition + 10000L).coerceAtMost(player.duration)
                player.seekTo(newPosition)
            }
        }

        val backButton: ImageButton? = playerView.findViewById(R.id.exo_back)
        backButton?.setOnClickListener {
            if (isFullscreen) {
                exitFullscreen()
            } else {
                finish()
            }
        }
    }

    private fun loadWatchHistory() {
        val session = SessionManager(this)
        val token = session.fetchAuthToken() ?: return
        val payload = decodeJWT(token) ?: return
        val userIdStr = payload.optString("id")
            .ifBlank { payload.optString("userId") }
            .ifBlank { payload.optString("sub") }
            .trim()
        val userId = userIdStr.toIntOrNull() ?: return

        lifecycleScope.launch {
            try {
                val response = RetrofitInstance.api.getAllUserWatchHistory(userId, currentMovieId)
                if (response.isSuccessful) {
                    response.body()?.let { history ->
                        lastKnownPositionMs = history.lastPosition * 1000
                    }
                }
            } catch (_: Exception) {
                // Ignore; start from beginning
            }
        }
    }

    private fun bindMovieDetails(movie: Movie) {
        titleTextView.text = movie.title
        descriptionTextView.text = movie.description
        val playerTitle: TextView? = playerView.findViewById(R.id.exo_title)
        playerTitle?.text = movie.title
    }

    private fun initializePlayer(videoUrl: String?) {
        if (videoUrl.isNullOrEmpty()) return
        if (exoPlayer == null) {
            exoPlayer = ExoPlayer.Builder(this).build().also { player ->
                playerView.player = player
                player.addListener(playerListener)
            }
        }
        exoPlayer?.let { player ->
            player.setMediaItem(MediaItem.fromUri(videoUrl))
            if (lastKnownPositionMs > 0L) player.seekTo(lastKnownPositionMs)
            player.playWhenReady = playWhenReady
            player.prepare()
        }
        progressHandler.post(progressRunnable)
    }

    private fun releasePlayer() {
        progressHandler.removeCallbacks(progressRunnable)
        exoPlayer?.removeListener(playerListener)
        exoPlayer?.release()
        exoPlayer = null
    }

    private fun enterFullscreen(applyOrientation: Boolean = true) {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, playerView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        if (applyOrientation) {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        }
        supportActionBar?.hide()
        detailsContainer.visibility = View.GONE
        playerView.layoutParams = playerView.layoutParams.apply {
            height = ViewGroup.LayoutParams.MATCH_PARENT
            width = ViewGroup.LayoutParams.MATCH_PARENT
        }
        playerView.requestLayout()
        val fullscreenButton: ImageButton? = playerView.findViewById(R.id.exo_fullscreen)
        fullscreenButton?.setImageResource(R.drawable.ic_fullscreen)
    }

    private fun exitFullscreen() {
        WindowCompat.setDecorFitsSystemWindows(window, true)
        WindowInsetsControllerCompat(window, playerView).show(WindowInsetsCompat.Type.systemBars())
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        supportActionBar?.show()
        detailsContainer.visibility = View.VISIBLE
        playerView.layoutParams = playerView.layoutParams.apply {
            height = originalPlayerHeight
            width = ViewGroup.LayoutParams.MATCH_PARENT
        }
        playerView.requestLayout()
        val fullscreenButton: ImageButton? = playerView.findViewById(R.id.exo_fullscreen)
        fullscreenButton?.setImageResource(R.drawable.ic_fullscreen)
    }

    private fun showBuffering() {
        playerView.findViewById<View>(R.id.exo_buffering)?.visibility = View.VISIBLE
    }

    private fun hideBuffering() {
        playerView.findViewById<View>(R.id.exo_buffering)?.visibility = View.GONE
    }

    private fun sendWatchUpdate(completed: Boolean = false) {
        val player = exoPlayer ?: return
        if (currentMovieId <= 0) return
        val lastPosMs = player.currentPosition
        val durMs = if (player.duration > 0) player.duration else videoDuration

        val session = SessionManager(this)
        val token = session.fetchAuthToken() ?: return
        val payload = decodeJWT(token) ?: return
        val userIdStr = payload.optString("id")
            .ifBlank { payload.optString("userId") }
            .ifBlank { payload.optString("sub") }
            .trim()
        val userIdLong = userIdStr.toLongOrNull() ?: return

        val body = WatchHistoryDto(
            userId = userIdLong.toInt(),
            videoId = currentMovieId,
            lastPosition = lastPosMs / 1000,
            duration = durMs / 1000,
            deviceType = "Android"
        )

        lifecycleScope.launch {
            try {
                RetrofitInstance.api.updateWatch(body)
            } catch (e: Exception) {
                Log.e("WatchHistory", "Error updating: ${e.message}", e)
            }
        }
    }

    private fun decodeJWT(token: String): JSONObject? {
        return try {
            val parts = token.split(".")
            if (parts.size < 2) return null
            val payloadB64 = parts[1]
            val decodedBytes = Base64.decode(
                payloadB64,
                Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP
            )
            val decodedString = String(decodedBytes, Charsets.UTF_8)
            JSONObject(decodedString)
        } catch (e: Exception) {
            null
        }
    }

    override fun onStart() {
        super.onStart()
        if (exoPlayer == null && pendingVideoUrl != null) {
            initializePlayer(pendingVideoUrl)
        }
    }

    override fun onResume() {
        super.onResume()
        exoPlayer?.playWhenReady = playWhenReady
    }

    override fun onPause() {
        exoPlayer?.let { player ->
            lastKnownPositionMs = player.currentPosition
            playWhenReady = player.playWhenReady
            player.playWhenReady = false
        }
        super.onPause()
    }

    override fun onStop() {
        super.onStop()
        sendWatchUpdate()
        releasePlayer()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        exoPlayer?.let { player ->
            outState.putLong("last_pos", player.currentPosition)
            outState.putBoolean("play_when_ready", player.playWhenReady)
        }
        outState.putBoolean("is_fullscreen", isFullscreen)
        super.onSaveInstanceState(outState)
    }
}
