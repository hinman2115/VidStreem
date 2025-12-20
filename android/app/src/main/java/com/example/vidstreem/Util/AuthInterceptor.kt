package com.example.vidstreem.Util

import okhttp3.Interceptor
import okhttp3.Response

// AuthInterceptor.kt
class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val builder = original.newBuilder()
            .header("Accept", "application/json")
            .header("Content-Type", "application/json")
        tokenProvider()?.let { builder.header("Authorization", "Bearer $it") }
        return chain.proceed(builder.build())
    }
}
