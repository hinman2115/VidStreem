package com.example.vidstreem.Data.Viewmodel

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.Model.Movie
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MovieDetailViewModel : ViewModel() {
    private val _movieDetails = MutableLiveData<Movie?>()
    val movieDetails: LiveData<Movie?> get() = _movieDetails

    fun fetchMovieDetails(movieId: Int) {
        RetrofitInstance.api.getMovieDetails(movieId).enqueue(object : Callback<Movie> {
            override fun onResponse(call: Call<Movie>, response: Response<Movie>) {
                if (response.isSuccessful) {
                    Log.d("videodata",response.body().toString())
                    _movieDetails.postValue(response.body())
                } else {
                    _movieDetails.postValue(null)
                }
            }

            override fun onFailure(call: Call<Movie>, t: Throwable) {
                _movieDetails.postValue(null)
            }
        })
    }
}