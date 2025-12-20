package com.example.vidstreem.Ui

import SessionManager
import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.text.method.HideReturnsTransformationMethod
import android.text.method.PasswordTransformationMethod
import android.util.Log
import android.view.View
import android.widget.*
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.Model.LoginRequest
import com.example.vidstreem.Data.Model.LoginResponse
import com.example.vidstreem.R
import com.example.vidstreem.viewmodels.AuthViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginMainActivity : AppCompatActivity() {
    private lateinit var googleSignInClient: GoogleSignInClient
    private lateinit var authViewModel: AuthViewModel
    private lateinit var sessionManager: SessionManager

    private var keepSplashOnScreen = true

    private val googleSigninLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account?.idToken
                if (idToken != null) {
                    authViewModel.googleLogin(idToken, this)
                    goToHome()
                }
            } catch (e: ApiException) {
                Log.e("GoogleSignIn", "Sign-in failed: ${e.message}")
            }
        }
    }

    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { keepSplashOnScreen }

        super.onCreate(savedInstanceState)

        // Initialize managers
        sessionManager = SessionManager(this)
        authViewModel = AuthViewModel(sessionManager)

        checkLoginStatus()

        enableEdgeToEdge()
        setContentView(R.layout.activity_login_main)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Setup UI after setContentView
        setupPasswordToggle()
        setupLoginUI()
        setupGoogleSignIn()
        setupSignUpNavigation()
    }

    private fun setupSignUpNavigation() {
        // Navigate to sign up page
        val signUpText = findViewById<TextView>(R.id.signUpText)
        val signUpLayout = findViewById<LinearLayout>(R.id.signUpLayout)

        signUpText?.setOnClickListener {
            navigateToSignUp()
        }

        signUpLayout?.setOnClickListener {
            navigateToSignUp()
        }
    }

    private fun navigateToSignUp() {
        try {
            val intent = Intent(this@LoginMainActivity, MainActivity::class.java)
            startActivity(intent)
        } catch (e: Exception) {
            Log.e("Navigation", "Error navigating to signup: ${e.message}")
            Toast.makeText(this, "Unable to open signup page", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken("489097530473-anhlve78oi3oso85l2nvg4h0hmpliet1.apps.googleusercontent.com")
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }

    private fun checkLoginStatus() {
        lifecycleScope.launch {
            delay(1500)

            if (isLoggedIn()) {
                Log.d("LoginCheck", "User already logged in")
                startActivity(Intent(this@LoginMainActivity, HomeActivity::class.java))
                finish()
            } else {
                keepSplashOnScreen = false
            }
        }
    }

    private fun setupLoginUI() {
        val emailEditText = findViewById<EditText>(R.id.emailEditText)
        val passwordEditText = findViewById<EditText>(R.id.passwordEditText)
        val loginButton = findViewById<LinearLayout>(R.id.loginButton)
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)
        val googleSignInButton = findViewById<Button>(R.id.googleSignInButton)

        // Login button click
        loginButton?.setOnClickListener {
            val email = emailEditText?.text.toString().trim()
            val password = passwordEditText?.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            progressBar?.visibility = View.VISIBLE

            val request = LoginRequest(email, password)
            RetrofitInstance.api.login(request).enqueue(object : Callback<LoginResponse> {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    progressBar?.visibility = View.GONE

                    if (response.isSuccessful && response.body() != null) {
                        val loginResponse = response.body()!!
                        sessionManager.saveAuthToken(loginResponse.token)
                        Toast.makeText(
                            this@LoginMainActivity,
                            "Login successful!",
                            Toast.LENGTH_SHORT
                        ).show()
                        goToHome()
                    } else {
                        val errorMsg = response.errorBody()?.string() ?: "Login failed"
                        Toast.makeText(this@LoginMainActivity, errorMsg, Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    progressBar?.visibility = View.GONE
                    Toast.makeText(
                        this@LoginMainActivity,
                        "Error: ${t.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            })
        }

        googleSignInButton?.setOnClickListener {
            signInWithGoogle()
        }
    }

    private fun signInWithGoogle() {
        val signInIntent = googleSignInClient.signInIntent
        googleSigninLauncher.launch(signInIntent)
    }

    private fun goToHome() {
        val intent = Intent(this@LoginMainActivity, HomeActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    private fun isLoggedIn(): Boolean {
        return sessionManager.fetchAuthToken() != null
    }

    private fun setupPasswordToggle() {
        val passwordEditText = findViewById<EditText>(R.id.passwordEditText)
        val passwordToggle = findViewById<ImageView>(R.id.passwordToggle)

        var isPasswordVisible = false

        passwordToggle?.setOnClickListener {
            isPasswordVisible = !isPasswordVisible

            if (isPasswordVisible) {
                passwordEditText?.transformationMethod = HideReturnsTransformationMethod.getInstance()
                passwordToggle.setImageResource(R.drawable.ic_eye_custom)
            } else {
                passwordEditText?.transformationMethod = PasswordTransformationMethod.getInstance()
                passwordToggle.setImageResource(R.drawable.ic_eye_closed)
            }

            try {
                passwordToggle.setColorFilter(ContextCompat.getColor(this, R.color.orange_accent))
            } catch (e: Exception) {
                passwordToggle.setColorFilter(0xFFFF9248.toInt())
            }

            passwordEditText?.setSelection(passwordEditText.text?.length ?: 0)
        }
    }
}
