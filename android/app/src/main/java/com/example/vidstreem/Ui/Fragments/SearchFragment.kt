package com.example.vidstreem.Ui.Fragments

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.vidstreem.Adapters.MovieAdapter
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.Model.Movie
import com.example.vidstreem.R
import com.example.vidstreem.Ui.MovieDetailActivity
import com.google.android.material.progressindicator.CircularProgressIndicator
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SearchFragment : Fragment() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var movieAdapter: MovieAdapter
    private lateinit var searchEditText: EditText
    private lateinit var progressIndicator: CircularProgressIndicator
    private lateinit var emptyStateLayout: LinearLayout
    private lateinit var initialStateLayout: LinearLayout
    private var searchCall: Call<List<Movie>>? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_search, container, false)

        recyclerView = view.findViewById(R.id.recyclerViewMovies)
        searchEditText = view.findViewById(R.id.searchEditText)
        progressIndicator = view.findViewById(R.id.progressIndicator)
        emptyStateLayout = view.findViewById(R.id.emptyStateLayout)
        initialStateLayout = view.findViewById(R.id.initialStateLayout)

        setupRecyclerView()
        setupSearch()
        showInitialState()

        return view
    }

    private fun setupRecyclerView() {
        movieAdapter = MovieAdapter { result ->

            val i = Intent(context, MovieDetailActivity::class.java)
                .putExtra("Id", result.id)
            startActivity(i)
            Toast.makeText(context, "Clicked: ${result.title}", Toast.LENGTH_SHORT).show()
        }
        recyclerView.layoutManager = GridLayoutManager(context, 2)
        recyclerView.adapter = movieAdapter
    }

    private fun setupSearch() {
        searchEditText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val searchText = s.toString().trim()
                if (searchText.length > 1) {
                    searchMovies(searchText)
                } else {
                    searchCall?.cancel()
                    movieAdapter.updateMovies(emptyList())
                    showInitialState()
                }
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun searchMovies(query: String) {
        searchCall?.cancel()
        showLoading()

        searchCall = RetrofitInstance.api.searchmovie(query)
        searchCall?.enqueue(object : Callback<List<Movie>> {
            override fun onResponse(call: Call<List<Movie>>, response: Response<List<Movie>>) {
                if (!isAdded) return
                progressIndicator.visibility = View.GONE

                if (response.isSuccessful && response.body() != null) {
                    val movies = response.body()!!
                    if (movies.isEmpty()) {
                        showEmptyState()
                    } else {
                        showResults()
                        movieAdapter.updateMovies(movies)
                    }
                } else {
                    showEmptyState()
                    Toast.makeText(context, "Search failed: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Movie>>, t: Throwable) {
                if (!isAdded || call.isCanceled) return
                progressIndicator.visibility = View.GONE
                showEmptyState()
                Log.e("SearchFailure", "Error: ${t.message}", t)
                Toast.makeText(context, "Error: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun showInitialState() {
        progressIndicator.visibility = View.GONE
        emptyStateLayout.visibility = View.GONE
        recyclerView.visibility = View.GONE
        initialStateLayout.visibility = View.VISIBLE
    }

    private fun showLoading() {
        progressIndicator.visibility = View.VISIBLE
        emptyStateLayout.visibility = View.GONE
        recyclerView.visibility = View.GONE
        initialStateLayout.visibility = View.GONE
    }

    private fun showResults() {
        progressIndicator.visibility = View.GONE
        emptyStateLayout.visibility = View.GONE
        initialStateLayout.visibility = View.GONE
        recyclerView.visibility = View.VISIBLE
    }

    private fun showEmptyState() {
        progressIndicator.visibility = View.GONE
        initialStateLayout.visibility = View.GONE
        recyclerView.visibility = View.GONE
        emptyStateLayout.visibility = View.VISIBLE
    }
}