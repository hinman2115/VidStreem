package com.example.vidstreem.Ui

import AllMoviewsFragment
import android.content.res.ColorStateList
import android.os.Build
import android.os.Bundle
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import androidx.fragment.app.Fragment
import com.example.vidstreem.R
import com.example.vidstreem.Ui.Fragments.HomeFragment
import com.example.vidstreem.Ui.Fragments.ProfileFragment
import com.example.vidstreem.Ui.Fragments.SearchFragment
import com.google.android.material.bottomnavigation.BottomNavigationView

class HomeActivity : AppCompatActivity() {

    @RequiresApi(Build.VERSION_CODES.Q)
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.Theme_Vidstreem)
        super.onCreate(savedInstanceState)

        // Make navigation bar fully transparent
        window.isNavigationBarContrastEnforced = false

        setContentView(R.layout.activity_home)

        val bottomNavigation: BottomNavigationView = findViewById(R.id.bottom_navigation)

        // Handle window insets for bottom navigation
        ViewCompat.setOnApplyWindowInsetsListener(bottomNavigation) { view, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars())
            view.updatePadding(bottom = insets.bottom)
            windowInsets
        }

        // Color state list for bottom navigation
        val states = arrayOf(
            intArrayOf(android.R.attr.state_checked),
            intArrayOf(-android.R.attr.state_checked)
        )

        val colors = intArrayOf(
            0xFFFF9248.toInt(), // Orange for selected
            0xFF9E9E9E.toInt()  // Gray for unselected
        )

        val colorStateList = ColorStateList(states, colors)
        bottomNavigation.itemIconTintList = colorStateList
        bottomNavigation.itemTextColor = colorStateList

        if (savedInstanceState == null) {
            loadFragment(HomeFragment())
            bottomNavigation.selectedItemId = R.id.nav_home
        }

        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    loadFragment(HomeFragment())
                    true
                }
                R.id.nav_movie -> {
                    loadFragment(AllMoviewsFragment())
                    true
                }
                R.id.nav_profile -> {
                    loadFragment(ProfileFragment())
                    true
                }
                R.id.nav_search -> {
                    loadFragment(SearchFragment())
                    true
                }
                else -> false
            }
        }
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }
}
