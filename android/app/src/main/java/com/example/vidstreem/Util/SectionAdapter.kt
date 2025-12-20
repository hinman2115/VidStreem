package com.example.vidstreem.Adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.vidstreem.Data.Model.Movie
import com.example.vidstreem.Data.Model.Section
import com.example.vidstreem.R

class SectionAdapter(
    private val onMovieClick: (Movie) -> Unit,
    private val onSectionMoreClick: (Section) -> Unit
) : RecyclerView.Adapter<SectionAdapter.SectionViewHolder>() {

    private val sections = mutableListOf<Section>()

    // Update data
    fun submitSections(list: List<Section>) {
        sections.clear()
        sections.addAll(list)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SectionViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_section, parent, false)
        return SectionViewHolder(view)
    }

    override fun onBindViewHolder(holder: SectionViewHolder, position: Int) {
        holder.bind(sections[position])
    }

    override fun getItemCount(): Int = sections.size

    // =====================================================
    // ViewHolder
    // =====================================================
    inner class SectionViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val titleText: TextView = itemView.findViewById(R.id.txt_section_title)
        private val moreText: TextView = itemView.findViewById(R.id.txt_more)
        private val recyclerView: RecyclerView = itemView.findViewById(R.id.recycler_section)

        fun bind(section: Section) {
            titleText.text = section.title

            // Horizontal movie list
            val movieAdapter = MovieAdapter { movie ->
                onMovieClick(movie)
            }

            recyclerView.apply {
                layoutManager = LinearLayoutManager(
                    itemView.context,
                    LinearLayoutManager.HORIZONTAL,
                    false
                )
                adapter = movieAdapter
                setHasFixedSize(true)
            }

            movieAdapter.updateMovies(section.items)

            // "More" click → pass entire section
            moreText.setOnClickListener {
                onSectionMoreClick(section)
            }
        }
    }
}
