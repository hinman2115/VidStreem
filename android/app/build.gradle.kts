plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("kotlin-kapt")
}

android {
    namespace = "com.example.vidstreem"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.vidstreem"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    // Kotlin + core
    implementation(libs.androidx.core.ktx)

    // AppCompat + Material (single source of truth: use either libs or explicit, not both)
    implementation(libs.androidx.appcompat)
    implementation(libs.material) // remove the duplicate explicit "1.13.0" line

    // Activity + Fragment (for OnBackPressedDispatcher and addCallback)
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.fragment:fragment-ktx:1.8.5")

    // ConstraintLayout (match your version catalog; 2.1.4 is widely stable)
    implementation(libs.androidx.constraintlayout)

    // CoordinatorLayout
    implementation("androidx.coordinatorlayout:coordinatorlayout:1.3.0")
    // Lifecycle ViewModel (align with Fragment/Activity family)
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.6")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    // Choose ONE style. Prefer umbrella OR modular, not both.
    implementation("com.google.android.exoplayer:exoplayer:2.19.1")
    implementation("com.airbnb.android:lottie:6.1.0")
    implementation("com.google.android.gms:play-services-auth:21.4.0")

    // CardView (legacy UI support if used)
    implementation("androidx.cardview:cardview:1.0.0")

    // Glide for images
    implementation("com.github.bumptech.glide:glide:4.16.0")
    implementation(libs.androidx.activity)

    implementation ("androidx.room:room-runtime:2.6.1")
    implementation ("androidx.room:room-ktx:2.6.1")
    implementation(libs.androidx.recyclerview)
    kapt ("androidx.room:room-compiler:2.6.1")
    kapt("com.github.bumptech.glide:compiler:4.16.0")

    // Lottie animations
    implementation("com.airbnb.android:lottie:6.1.0")
    implementation("com.razorpay:checkout:1.6.40")
    // Splashscreen
    implementation("androidx.core:core-splashscreen:1.0.1")
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    implementation("androidx.palette:palette-ktx:1.0.0")

}
