package com.example.vidstreem.Data.Api

import SubscriptionApiService
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitInstance {

    //http://192.168.29.107:5148
    //http://vidstreem.runasp.net/
    private val retrofit by lazy{
        Retrofit.Builder().baseUrl("http://vidstreem.runasp.net/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val api: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
    val subapi :SubscriptionApiService by lazy {
        retrofit.create(SubscriptionApiService::class.java)
    }
    val userapi : UserprofilApi by lazy {
        retrofit.create(UserprofilApi::class.java)
    }

}