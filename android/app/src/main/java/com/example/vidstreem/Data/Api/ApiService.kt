package com.example.vidstreem.Data.Api

import com.example.vidstreem.Data.Model.GoogleLoginRequest
import com.example.vidstreem.Data.Model.LoginRequest
import com.example.vidstreem.Data.Model.LoginResponse
import com.example.vidstreem.Data.Model.*
import com.example.vidstreem.Data.Model.RegisterRequest
import com.example.vidstreem.Data.Model.WatchHistoryDto
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    // auth apis
    @POST("User/login")
    fun login(@Body loginRequest: LoginRequest): Call<LoginResponse>

    @POST("User/register")
    fun register(@Body registerRequest: RegisterRequest): Call<LoginResponse>

    @POST("User/google-login")
    fun googleLogin(@Body request: GoogleLoginRequest): Call<LoginResponse>


    // Video hendal
    @GET("VideohandelApi")
    suspend fun getAllVideos(): Response<List<Movie>>

    @GET("VideohandelApi/{id}")
    fun getMovieDetails(@Path("id") movieId: Int): Call<Movie>


    @GET("VideohandelApi/{id}")
    suspend fun getMovieDetailsHistory(
        @Path("id") movieId: Int
    ): Response<Movie>

    @GET("VideohandelApi/Search")
    fun searchmovie(@Query("title") title: String): Call<List<Movie>>

    @GET("VideohandelApi/thumbnails")
    suspend fun getThumbnails(
        @Query("categoryId") categoryId: Int? = null,
        @Query("take") take: Int = 50,
        @Query("skip") skip: Int = 0
    ): Response<List<Movie>>

    // Watch history apis
    @POST("VideohandelApi/watch/update")
    suspend fun updateWatch(@Body body: WatchHistoryDto): Response<WatchHistory>

    @GET("VideohandelApi/watch/{userId}/{videoId}")
    suspend fun getAllUserWatchHistory(
        @Path("userId") userId: Int,
        @Path("videoId") videoId: Int
    ): Response<WatchHistoryResponse>

    @GET("VideohandelApi/watch/user/{userId}")
    suspend fun getWatchHistory(
        @Path("userId") userId: Int
    ): Response<List<WatchHistoryApiItem>>

    @GET("VideohandelApi/thumbnails")
    fun getMovies(): Call<List<Movie>>

    @GET("/api/CategoryVC/{id}/videos")
    fun getMoviesByCategory(@Path("id") categoryId: Int): Call<CategoryVideosResponse>

}
