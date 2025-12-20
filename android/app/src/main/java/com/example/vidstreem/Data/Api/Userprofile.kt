package com.example.vidstreem.Data.Api

import com.example.vidstreem.Data.Model.UserProfile
import retrofit2.http.GET
import retrofit2.http.Path

interface UserprofilApi {

    @GET("User/profile/{id}")
    fun getprofiledetails(@Path("id") id: Int): UserProfile
}