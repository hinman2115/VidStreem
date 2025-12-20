package com.example.vidstreem.Data.Model

data class LoginRequest(

    val email: String,
    val password: String
)

data class LoginResponse(
    val message: String,
    val token: String,
    val userId: Int,
    val role: String,
    val name: String
)

data class GoogleLoginRequest(
    val idToken: String
)