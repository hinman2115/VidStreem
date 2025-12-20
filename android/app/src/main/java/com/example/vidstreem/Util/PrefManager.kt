package com.example.vidstreem.Util

import android.content.Context
import com.example.vidstreem.Data.Model.UserProfile
import javax.xml.namespace.NamespaceContext

class PrefManager(context: Context) {

 private val sharedPreferences = context.getSharedPreferences("my_app_prefs", Context.MODE_PRIVATE)

    fun saveUser(profile: UserProfile){
        sharedPreferences.edit().apply{
            putInt("userId", profile.userId)
            putString("name", profile.name)
            putString("email", profile.email)
            putString("phone", profile.phone)
            putString("role", profile.role)
            putString("createdAt", profile.createdAt)
        }.apply()
    }
    fun getUser(): UserProfile? {
        val id = sharedPreferences.getInt("userId", -1)
        if (id == -1) return null

        return UserProfile(
            id,
            sharedPreferences.getString("name",""),
            sharedPreferences.getString("email", ""),
            sharedPreferences.getString("phone", null),
            sharedPreferences.getString("role", ""),
            sharedPreferences.getString("createdAt", "")
        )
    }
}