package com.example.vidstreem.Util

import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import androidx.palette.graphics.Palette
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition

class ColorExtractor {

    companion object {
        /**
         * Extract dominant color from image URL
         */
        fun extractColorsFromUrl(
            imageUrl: String,
            onColorsExtracted: (dominantColor: Int, vibrantColor: Int?, darkVibrantColor: Int?) -> Unit
        ): CustomTarget<Bitmap> {
            return object : CustomTarget<Bitmap>() {
                override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
                    Palette.from(resource).generate { palette ->
                        palette?.let {
                            // Get dominant color (fallback to black)
                            val dominantColor = it.getDominantColor(0xFF000000.toInt())

                            // Get vibrant color for status bar
                            val vibrantColor = it.getVibrantColor(dominantColor)

                            // Get dark vibrant for even darker shade
                            val darkVibrantColor = it.getDarkVibrantColor(dominantColor)

                            onColorsExtracted(dominantColor, vibrantColor, darkVibrantColor)
                        }
                    }
                }

                override fun onLoadCleared(placeholder: Drawable?) {
                    // Handle cleanup if needed
                }
            }
        }

        /**
         * Make color darker for status bar
         */
        fun getDarkerColor(color: Int, factor: Float = 0.7f): Int {
            val hsv = FloatArray(3)
            android.graphics.Color.colorToHSV(color, hsv)
            hsv[2] *= factor // Value (brightness)
            return android.graphics.Color.HSVToColor(hsv)
        }
    }
}
