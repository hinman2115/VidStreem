package com.example.vidstreem.Ui.Fragments

import SessionManager
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.vidstreem.Adapters.MovieAdapter
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.Model.WatchHistoryItem
import com.example.vidstreem.R
import com.example.vidstreem.Ui.LoginMainActivity
import com.example.vidstreem.Ui.MovieDetailActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {

    private lateinit var sessionManager: SessionManager
    private lateinit var historyRecyclerView: RecyclerView
    private lateinit var movieAdapter: MovieAdapter
    private lateinit var loginText: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        //local data
        sessionManager = SessionManager(requireContext())


        try {
            loginText = view.findViewById(R.id.login_text)
            historyRecyclerView = view.findViewById(R.id.history_recycler_view)
//            viplogo = view.findViewById(R.id.viplogo)
//            reedemlogo = view.findViewById(R.id.reedemlogo)
        } catch (e: Exception) {
            Log.e("ProfileFragment", "Error initializing views: ${e.message}", e)
            return
        }

        // Setup RecyclerView
        setupHistoryRecyclerView()

        // Check login status
        checkLoginStatus()

        // Setup click listeners
        setupClickListeners(view)

        // Load data
        loadWatchHistory()
        getUserData() // Renamed from getuserdata()
    }

    private fun setupHistoryRecyclerView() {
        movieAdapter = MovieAdapter { movie ->
            val intent = Intent(requireContext(), MovieDetailActivity::class.java)
            intent.putExtra("Id", movie.id)
            startActivity(intent)
        }

        historyRecyclerView.apply {
            layoutManager = LinearLayoutManager(
                requireContext(),
                LinearLayoutManager.HORIZONTAL,
                false
            )
            adapter = movieAdapter
        }
    }

    private fun checkLoginStatus() {
        val token = sessionManager.fetchAuthToken()
        if (token != null) {
            val userdata = sessionManager.getUserName()
            if (userdata != null) {
                loginText.text = userdata
                // Optional: Hide VIP sections for logged in users
                // viplogo.visibility = View.GONE
                // reedemlogo.visibility = View.GONE
            }
        } else {
            loginText.text = "Login"
        }
    }

    private fun setupClickListeners(view: View) {
        // Profile header click
        view.findViewById<View>(R.id.profile_icon)?.setOnClickListener {
            if (sessionManager.fetchAuthToken() == null) {
                val intent = Intent(requireContext(), LoginMainActivity::class.java)
                startActivity(intent)
            }
        }


        // Redeem VIP
        view.findViewById<MaterialButton>(R.id.btn_enter_redeem)?.setOnClickListener {
            Toast.makeText(requireContext(), "Redeem feature coming soon!", Toast.LENGTH_SHORT).show()
        }

        // View all history
        view.findViewById<View>(R.id.btn_view_all_history)?.setOnClickListener {
            Toast.makeText(requireContext(), "All history", Toast.LENGTH_SHORT).show()
        }

        // Logout menu item - FIXED: Changed from LinearLayout to MaterialCardView
        view.findViewById<TextView>(R.id.menu_download_text)?.setOnClickListener {
            sessionManager.logout()

            val intent = Intent(requireContext(), LoginMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }

    }

    private fun loadWatchHistory() {
        val userId = sessionManager.getUserId()
        if (userId == null) {
            Log.e("ProfileFragment", "User ID is null")
            return
        }

        lifecycleScope.launch {
            try {
                val historyResponse = RetrofitInstance.api.getWatchHistory(userId)

                if (!historyResponse.isSuccessful) {
                    Log.e("ProfileFragment", "Failed to load watch history: ${historyResponse.code()}")
                    return@launch
                }

                val historyList = historyResponse.body()
                if (historyList.isNullOrEmpty()) {
                    Log.d("ProfileFragment", "Watch history is empty")
                    return@launch
                }

                val combinedList = mutableListOf<WatchHistoryItem>()


                for (history in historyList.take(10)) {
                    try {
                        val movieResponse = RetrofitInstance.api.getMovieDetailsHistory(history.videoId)

                        if (movieResponse.isSuccessful) {
                            movieResponse.body()?.let { movie ->
                                combinedList.add(
                                    WatchHistoryItem(
                                        movie = movie,
                                        lastPosition = history.lastPosition,
                                        duration = history.duration,
                                        percentageWatched = history.percentageWatched,
                                        isCompleted = history.isCompleted,
                                        lastWatchedTime = history.lastWatchedTime
                                    )
                                )
                            }
                        }
                    } catch (e: Exception) {
                        Log.e("ProfileFragment", "Error fetching movie ${history.videoId}: ${e.message}")
                    }
                }

                // Update adapter on main thread
                if (combinedList.isNotEmpty()) {
                    movieAdapter.updateMovies(combinedList.map { it.movie })
                    Log.d("ProfileFragment", "Loaded ${combinedList.size} history items")
                }

            } catch (e: Exception) {
                Log.e("ProfileFragment", "Error loading watch history", e)
                Toast.makeText(requireContext(), "Failed to load history", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun getUserData() {
        lifecycleScope.launch {
            try {
                val userId = sessionManager.getUserIdFromToken()

                if (userId == null) {
                    Log.e("ProfileFragment", "User ID not found in token")
                    return@launch
                }

                val response = RetrofitInstance.userapi.getprofiledetails(userId)
                if (response != null) {
                    Log.d("ProfileFragment", "Profile data fetched successfully")
                    // TODO: Update UI with profile data
                } else {
                    Log.e("ProfileFragment", "Failed to fetch profile")
                }
            } catch (e: Exception) {
                Log.e("ProfileFragment", "Error fetching profile: ${e.message}", e)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Check if views are initialized before reloading
        if (::historyRecyclerView.isInitialized) {
            loadWatchHistory()
        }
    }
}
