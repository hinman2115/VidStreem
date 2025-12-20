package com.example.vidstreem.Ui.Fragments

import AllMoviewsFragment
import android.content.Intent
import android.os.*
import android.util.Log
import android.view.*
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.*
import androidx.viewpager2.widget.ViewPager2
import com.example.vidstreem.Adapters.BannerAdapter
import com.example.vidstreem.Adapters.MovieAdapter
import com.example.vidstreem.Adapters.SectionAdapter
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.LocalDb.MovieCacheManager
import com.example.vidstreem.Data.Model.*
import com.example.vidstreem.R
import com.example.vidstreem.Ui.MovieDetailActivity
import com.example.vidstreem.Util.ColorExtractor
import kotlinx.coroutines.launch
import retrofit2.*

class HomeFragment : Fragment() {

    // Views
    private lateinit var heroBannerViewPager: ViewPager2
    private lateinit var sectionsRecycler: RecyclerView
    private lateinit var wetvHotRecycler: RecyclerView
    private lateinit var newReleaseRecycler: RecyclerView
    private lateinit var continueWatchingRecycler: RecyclerView

    // Adapters
    private lateinit var bannerAdapter: BannerAdapter
    private lateinit var sectionAdapter: SectionAdapter

    private lateinit var wetvHotAdapter: MovieAdapter

    private lateinit var newReleaseAdapter: MovieAdapter
    private lateinit var continueWatchingAdapter: MovieAdapter

    // Cache
    private lateinit var cacheManager: MovieCacheManager

    companion object {
        private const val TAG = "HomeFragment"
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        cacheManager = MovieCacheManager(requireContext())
        bindViews(view)
        setupHeroBanner()
        setupFixedRows()
        setupSectionAdapter()
        //setupClickListeners(view)
        loadMoviesWithCache()
    }

    private fun bindViews(view: View) {
        heroBannerViewPager = view.findViewById(R.id.hero_banner_viewpager)
        sectionsRecycler = view.findViewById(R.id.sectionsRecycler)
        wetvHotRecycler = view.findViewById(R.id.wetv_hot_recycler)
        newReleaseRecycler = view.findViewById(R.id.new_release_recycler)
        continueWatchingRecycler = view.findViewById(R.id.continue_watching_recycler)
    }

    private fun setupHeroBanner() {
        bannerAdapter = BannerAdapter(
            onBannerClick = { navigateToMovieDetail(it) },
            onColorExtracted = { dominant, _, dark ->
                changeSystemBarsColor(dominant, dark)
            }
        )
        heroBannerViewPager.adapter = bannerAdapter
    }

    private fun setupFixedRows() {
        wetvHotAdapter = MovieAdapter { navigateToMovieDetail(it) }
        wetvHotRecycler.layoutManager =
            LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        wetvHotRecycler.adapter = wetvHotAdapter

        newReleaseAdapter = MovieAdapter { navigateToMovieDetail(it) }
        newReleaseRecycler.layoutManager =
            LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        newReleaseRecycler.adapter = newReleaseAdapter

        continueWatchingAdapter = MovieAdapter { navigateToMovieDetail(it) }
        continueWatchingRecycler.layoutManager =
            LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        continueWatchingRecycler.adapter = continueWatchingAdapter
    }

    private fun setupSectionAdapter() {
        sectionAdapter = SectionAdapter(
            onMovieClick = { movie ->
                navigateToMovieDetail(movie)
            },
            onSectionMoreClick = { section ->
                openCategoryMovies(
                    categoryId = getCategoryIdByName(section.title),
                    categoryName = section.title
                )
            }
        )

        sectionsRecycler.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
            adapter = sectionAdapter
            setHasFixedSize(false)
            isNestedScrollingEnabled = false
        }
    }


    // --------------------------------------------------
    // Buttons
    // --------------------------------------------------
//    private fun setupClickListeners(view: View) {
//        view.findViewById<View>(R.id.btn_big_hit_more)?.setOnClickListener {
//            openAllMovies()
//        }
//    }

    private fun loadMoviesWithCache() {
        lifecycleScope.launch {
            val cached = cacheManager.getCachedMovies()
            if (!cached.isNullOrEmpty()) {
                displayMovies(cached)
            }
            loadMoviesFromNetwork()
        }
    }

    private fun loadMoviesFromNetwork() {
        RetrofitInstance.api.getMovies().enqueue(object : Callback<List<Movie>> {
            override fun onResponse(
                call: Call<List<Movie>>,
                response: Response<List<Movie>>
            ) {
                if (response.isSuccessful) {
                    val movies = response.body().orEmpty()
                    displayMovies(movies)
                    cacheManager.cacheMovies(movies)
                }
            }

            override fun onFailure(call: Call<List<Movie>>, t: Throwable) {
                Toast.makeText(context, t.localizedMessage, Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun displayMovies(movies: List<Movie>) {

        bannerAdapter.submitList(movies.shuffled().take(5))

        val grouped = movies.groupBy {
            it.category?.name ?: it.categoryName ?: "Other"
        }

        wetvHotAdapter.updateMovies(grouped["Fantasy"].orEmpty())
        newReleaseAdapter.updateMovies(movies.take(10))
        continueWatchingAdapter.updateMovies(movies.takeLast(10))

        val sections = grouped.map {
            Section(title = it.key, items = it.value)
        }

        sectionAdapter.submitSections(sections)
    }

    private fun openAllMovies() {
        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, AllMoviewsFragment())
            .addToBackStack(null)
            .commit()
    }

    private fun openCategoryMovies(categoryId: Int, categoryName: String) {
        val fragment = AllMoviewsFragment().apply {
            arguments = Bundle().apply {
                putInt(AllMoviewsFragment.ARG_CATEGORY_ID, categoryId)
                putString(AllMoviewsFragment.ARG_CATEGORY_NAME, categoryName)
            }
        }

        Log.d(TAG, "Opening category: $categoryName with ID: $categoryId")

        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .addToBackStack(null)
            .commit()
    }

    private fun getCategoryIdByName(name: String): Int {
        return when (name.lowercase()) {
            "fantasy" -> 1
            "action" -> 2
            "romance" -> 3
            "comedy" -> 4
            "hollywood" -> 5
            "drama" -> 6
            "thriller" -> 7
            else -> 0
        }
    }


    private fun navigateToMovieDetail(movie: Movie) {
        startActivity(
            Intent(requireContext(), MovieDetailActivity::class.java)
                .putExtra("Id", movie.id)
        )
    }

    private fun changeSystemBarsColor(color: Int, dark: Int?) {
        activity?.window?.statusBarColor = dark ?: color
    }

    override fun onDestroyView() {
        super.onDestroyView()
        activity?.window?.statusBarColor =
            ContextCompat.getColor(requireContext(), R.color.dark_background)
    }
}
