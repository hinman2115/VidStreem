package com.example.vidstreem.Adapters

import android.graphics.Bitmap
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.request.RequestOptions
import com.example.vidstreem.Data.Model.Movie
import com.example.vidstreem.R
import com.example.vidstreem.Util.ColorExtractor

class BannerAdapter(
    private val onBannerClick: (Movie) -> Unit,
    private val onColorExtracted: (dominantColor: Int, vibrantColor: Int?, darkVibrantColor: Int?) -> Unit
) : RecyclerView.Adapter<BannerAdapter.BannerViewHolder>() {

    private var bannerMovies: List<Movie> = emptyList()

    fun submitList(movies: List<Movie>) {
        bannerMovies = movies
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BannerViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_banner, parent, false)
        return BannerViewHolder(view)
    }

    override fun onBindViewHolder(holder: BannerViewHolder, position: Int) {
        holder.bind(bannerMovies[position])
    }

    override fun getItemCount(): Int = bannerMovies.size

    inner class BannerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val bannerImage: ImageView = itemView.findViewById(R.id.banner_image)
        private val bannerTitle: TextView = itemView.findViewById(R.id.banner_title)
        private val bannerDescription: TextView = itemView.findViewById(R.id.banner_description)

        fun bind(movie: Movie) {
            bannerTitle.text = movie.title
            bannerDescription.text = movie.description ?: ""

            // Load image and extract colors
            movie.thumbnailUrl?.let { imageUrl ->
                Glide.with(itemView.context)
                    .asBitmap()
                    .load(imageUrl)
                    .apply(RequestOptions().override(400, 400)) // Smaller size for faster processing
                    .into(ColorExtractor.extractColorsFromUrl(imageUrl) { dominant, vibrant, darkVibrant ->
                        // Notify the fragment about color change
                        onColorExtracted(dominant, vibrant, darkVibrant)
                    })

                // Also load the actual image for display
                Glide.with(itemView.context)
                    .load(imageUrl)
                    .into(bannerImage)
            }

            itemView.setOnClickListener {
                onBannerClick(movie)
            }
        }
    }
}
