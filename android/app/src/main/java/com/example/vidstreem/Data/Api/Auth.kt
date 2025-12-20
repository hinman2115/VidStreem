package com.example.vidstreem.viewmodels

import SessionManager
import android.content.Context
import android.widget.Toast
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.Model.GoogleLoginRequest
import com.example.vidstreem.Data.Model.LoginResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class AuthViewModel(private val sessionManager: SessionManager) {
    fun googleLogin(idToken: String, context: Context) {
        val request = GoogleLoginRequest(idToken)
        RetrofitInstance.api.googleLogin(request).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(
                call: Call<LoginResponse?>,
                response: Response<LoginResponse?>
            ) {
                if (response.isSuccessful)  {
                    val loginResponse = response.body()
                    if (loginResponse != null) {
                        // ✅ Save token using SessionManager
                        sessionManager.saveAuthToken(loginResponse.token)
                        Toast.makeText(context, "Welcome ${loginResponse.name}", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(context, "Login failed", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(context, "Server error: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(
                call: Call<LoginResponse?>,
                t: Throwable
            ) {
                Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_LONG).show()
            }

        })
    }
}
