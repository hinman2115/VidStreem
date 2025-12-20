package com.example.vidstreem.Adapters

import android.graphics.drawable.Drawable
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.target.Target
import com.example.vidstreem.Data.Model.Movie
import com.example.vidstreem.R

class MovieGridAdapter(
    private val onMovieClick: (Movie) -> Unit
) : RecyclerView.Adapter<MovieGridAdapter.MovieViewHolder>() {

    private val movies = mutableListOf<Movie>()

    companion object {
        private const val TAG = "MovieGridAdapter"
    }

    class MovieViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val thumbnail: ImageView = itemView.findViewById(R.id.movieThumbnail)
        val title: TextView = itemView.findViewById(R.id.movieTitle)
        val loader: ProgressBar = itemView.findViewById(R.id.thumbnailLoader)
        val playOverlay: ImageView = itemView.findViewById(R.id.playOverlay)
        // Optional views
        val description: TextView? = itemView.findViewById(R.id.movieDescription)
        val metadata: View? = itemView.findViewById(R.id.movieMetadata)


    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MovieViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.movie_grid_item, parent, false)
        return MovieViewHolder(view)
    }

    override fun onBindViewHolder(holder: MovieViewHolder, position: Int) {
        val movie = movies[position]

        // Title
        holder.title.text = movie.title
        holder.thumbnail.post {
            Log.d(TAG, "ImageView size: ${holder.thumbnail.width}x${holder.thumbnail.height}")
            Log.d(TAG, "ImageView visibility: ${holder.thumbnail.visibility}")
        }

        // Show loader before image load
        holder.loader.visibility = View.VISIBLE
        holder.playOverlay.visibility = View.GONE

        // Check if thumbnail URL exists
        if (movie.thumbnailUrl.isNullOrEmpty()) {
            Log.w(TAG, "No thumbnail URL for movie: ${movie.title}")
            holder.loader.visibility = View.GONE
            holder.thumbnail.setImageResource(R.drawable.movie_placeholder)
            setupClickListener(holder, movie)
            return
        }

        Log.d(TAG, "Loading: ${movie.title}, URL: ${movie.thumbnailUrl}")

        // Load thumbnail with Glide and proper listener
        Glide.with(holder.itemView.context)
            .load(movie.thumbnailUrl)
            .placeholder(R.drawable.movie_placeholder)
            .error(R.drawable.movie_placeholder)
            .diskCacheStrategy(DiskCacheStrategy.ALL)
            .centerCrop()
            .listener(object : com.bumptech.glide.request.RequestListener<android.graphics.drawable.Drawable>{
                override fun onLoadFailed(
                    e: GlideException?,
                    model: Any?,
                    target: Target<Drawable?>,
                    isFirstResource: Boolean
                ): Boolean {
                    holder.loader.visibility = View.GONE
                    Log.e(TAG, "Failed to load: ${movie.title}, Error: ${e?.message}")
                    return false
                }

                override fun onResourceReady(
                    resource: Drawable,
                    model: Any,
                    target: Target<Drawable?>?,
                    dataSource: DataSource,
                    isFirstResource: Boolean
                ): Boolean {
                    holder.loader.visibility = View.GONE
                    Log.d(TAG, "Successfully loaded: ${movie.title}")
                    return false
                }

            })
            .into(holder.thumbnail)

        setupClickListener(holder, movie)
    }

    private fun setupClickListener(holder: MovieViewHolder, movie: Movie) {
        // Click handling
        holder.itemView.setOnClickListener {
            onMovieClick(movie)
        }

        // Optional: show play overlay on focus
        holder.itemView.setOnFocusChangeListener { _, hasFocus ->
            holder.playOverlay.visibility = if (hasFocus) View.VISIBLE else View.GONE
        }
    }

    override fun getItemCount(): Int = movies.size

    // -----------------------------------------
    // Update data safely
    // -----------------------------------------
    fun updateMovies(newMovies: List<Movie>) {
        movies.clear()
        // Remove duplicates
        val uniqueMovies = newMovies.distinctBy {
            "${it.id}_${it.thumbnailUrl}"
        }
        movies.addAll(uniqueMovies)
        Log.d(TAG, "Updated with ${movies.size} movies")
        notifyDataSetChanged()
    }
}
