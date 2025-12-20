package com.example.vidstreem.Adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.example.vidstreem.Data.Model.Movie
import com.example.vidstreem.R

class MovieAdapter(
    private val onMovieClick: (Movie) -> Unit
) : RecyclerView.Adapter<MovieAdapter.MovieViewHolder>() {

    private val movies = mutableListOf<Movie>()

    // -----------------------------------------
    // ViewHolder
    // -----------------------------------------
    class MovieViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        val thumbnail: ImageView = itemView.findViewById(R.id.movieThumbnail)
        val title: TextView = itemView.findViewById(R.id.movieTitle)
        val loader: ProgressBar = itemView.findViewById(R.id.thumbnailLoader)
        val playOverlay: ImageView = itemView.findViewById(R.id.playOverlay)

        // Optional views (kept for future use)
        val description: TextView? = itemView.findViewById(R.id.movieDescription)
        val metadata: View? = itemView.findViewById(R.id.movieMetadata)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MovieViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.movie_item, parent, false)
        return MovieViewHolder(view)
    }

    override fun onBindViewHolder(holder: MovieViewHolder, position: Int) {
        val movie = movies[position]

        // Title
        holder.title.text = movie.title

        // Show loader before image load
        holder.loader.visibility = View.VISIBLE
        holder.playOverlay.visibility = View.GONE

        // Load thumbnail
        Glide.with(holder.itemView.context)
            .load(movie.thumbnailUrl)
            .placeholder(R.drawable.movie_placeholder)
            .error(R.drawable.movie_placeholder)
            .diskCacheStrategy(DiskCacheStrategy.ALL)
            .centerCrop()
            .into(holder.thumbnail)

        holder.loader.visibility = View.GONE

        // Click handling
        holder.itemView.setOnClickListener {
            onMovieClick(movie)
        }

        // Optional: show play overlay on focus (TV / future use)
        holder.itemView.setOnFocusChangeListener { _, hasFocus ->
            holder.playOverlay.visibility = if (hasFocus) View.VISIBLE else View.GONE
        }
    }

    override fun getItemCount(): Int = movies.size

    fun updateMovies(newMovies: List<Movie>) {
        movies.clear()

        // Remove duplicates
        val uniqueMovies = newMovies.distinctBy {
            "${it.id}_${it.thumbnailUrl}"
        }

        movies.addAll(uniqueMovies)
        notifyDataSetChanged()
    }
}
