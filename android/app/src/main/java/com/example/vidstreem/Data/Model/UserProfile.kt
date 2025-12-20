package com.example.vidstreem.Data.Model

data class UserProfile(
    val userId: Int,
    val name: String?,
    val email: String?,
    val phone: String?,
    val role: String?,
    val createdAt: String?
)
