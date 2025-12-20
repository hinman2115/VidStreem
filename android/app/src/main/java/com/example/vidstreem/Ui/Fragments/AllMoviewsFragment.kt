import android.graphics.Rect
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.vidstreem.Adapters.MovieGridAdapter
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.LocalDb.MovieCacheManager
import com.example.vidstreem.Data.Model.Movie
import com.example.vidstreem.Data.Model.CategoryVideosResponse
import com.example.vidstreem.Data.Model.CategoryVideo
import com.example.vidstreem.Data.Model.CategoryDto
import com.example.vidstreem.R
import com.example.vidstreem.Ui.MovieDetailActivity
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class AllMoviewsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var categoryHeaderText: TextView
    private lateinit var movieAdapter: MovieGridAdapter
    private lateinit var cacheManager: MovieCacheManager

    private var categoryId: Int? = null
    private var categoryName: String? = null

    companion object {
        const val ARG_CATEGORY_ID = "category_id"
        const val ARG_CATEGORY_NAME = "category_name"
        private const val TAG = "AllMoviesFragment"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
            val id = it.getInt(ARG_CATEGORY_ID, -1)
            categoryId = if (id == -1 || id == 0) null else id
            categoryName = it.getString(ARG_CATEGORY_NAME)
            Log.d(TAG, "Fragment created with categoryId: $categoryId, name: $categoryName")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_all_moviews, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        cacheManager = MovieCacheManager(requireContext())
        setupViews(view)
        setupRecyclerView(view)
        loadMoviesWithCache()
    }

    private fun setupViews(view: View) {
        categoryHeaderText = view.findViewById(R.id.categoryHeader)
        if (!categoryName.isNullOrEmpty()) {
            categoryHeaderText.text = categoryName
            categoryHeaderText.visibility = View.VISIBLE
        } else {
            categoryHeaderText.text = "All Movies"
            categoryHeaderText.visibility = View.VISIBLE
        }
    }

    private fun setupRecyclerView(view: View) {
        recyclerView = view.findViewById(R.id.recycler_all_movies)
        movieAdapter = MovieGridAdapter { movie ->
            val intent = Intent(requireContext(), MovieDetailActivity::class.java)
            intent.putExtra("Id", movie.id)
            startActivity(intent)
        }

        val gridLayoutManager = GridLayoutManager(requireContext(), 3)
        recyclerView.layoutManager = gridLayoutManager

        val spacingInPixels = resources.getDimensionPixelSize(R.dimen.grid_spacing)
        recyclerView.addItemDecoration(GridSpacingItemDecoration(3, spacingInPixels, true))
        recyclerView.adapter = movieAdapter
    }

    private fun loadMoviesWithCache() {
        lifecycleScope.launch {
            val cached = cacheManager.getCachedMovies()
            if (!cached.isNullOrEmpty()) {
                Log.d(TAG, "Displaying ${cached.size} movies from cache")
                displayMovies(cached)
            }
            loadMoviesFromNetwork()
        }
    }

    private fun loadMoviesFromNetwork() {
        if (categoryId != null) {
            Log.d(TAG, "Loading movies for category ID: $categoryId")
            loadMoviesByCategory(categoryId!!)
        } else if (!categoryName.isNullOrEmpty()) {
            Log.d(TAG, "Category ID is null, filtering by name: $categoryName")
            loadAndFilterByName(categoryName!!)
        } else {
            Log.d(TAG, "Loading all movies")
            loadAllMovies()
        }
    }

    private fun displayMovies(movies: List<Movie>) {
        val filteredMovies = when {
            categoryId != null -> {
                movies.filter { it.category?.categoryId == categoryId }
            }
            !categoryName.isNullOrEmpty() -> {
                movies.filter {
                    it.category?.name?.equals(categoryName, ignoreCase = true) == true ||
                            it.categoryName?.equals(categoryName, ignoreCase = true) == true
                }
            }
            else -> movies
        }
        Log.d(TAG, "Displaying ${filteredMovies.size} movies")
        movieAdapter.updateMovies(filteredMovies)
    }

    private fun loadAllMovies() {
        RetrofitInstance.api.getMovies()
            .enqueue(object : Callback<List<Movie>> {
                override fun onResponse(
                    call: Call<List<Movie>>,
                    response: Response<List<Movie>>
                ) {
                    if (response.isSuccessful) {
                        val movies = response.body().orEmpty()
                        Log.d(TAG, "Fetched ${movies.size} movies from API")
                        cacheManager.cacheMovies(movies)
                        displayMovies(movies)
                    } else {
                        Log.e(TAG, "API Error: ${response.code()}")
                        showError("Failed to load movies")
                    }
                }

                override fun onFailure(call: Call<List<Movie>>, t: Throwable) {
                    Log.e(TAG, "Network failure", t)
                    showError("Network error: ${t.localizedMessage}")
                }
            })
    }

    private fun loadMoviesByCategory(catId: Int) {
        RetrofitInstance.api.getMoviesByCategory(catId)
            .enqueue(object : Callback<CategoryVideosResponse> {
                override fun onResponse(
                    call: Call<CategoryVideosResponse>,
                    response: Response<CategoryVideosResponse>
                ) {
                    if (response.isSuccessful && response.body() != null) {
                        val responseBody = response.body()!!
                        Log.d(TAG, "${responseBody.message} - Category: ${responseBody.category} - Count: ${responseBody.count}")

                        val movies = responseBody.data.map { video ->
                            convertToMovie(video, responseBody.category, catId)
                        }

                        cacheManager.cacheMovies(movies)
                        movieAdapter.updateMovies(movies)
                        categoryHeaderText.text = responseBody.category

                    } else {
                        Log.e(TAG, "API Error: ${response.code()}")
                        showError("Failed to load category videos")
                    }
                }

                override fun onFailure(call: Call<CategoryVideosResponse>, t: Throwable) {
                    Log.e(TAG, "Network failure for category $catId", t)
                    showError("Network error: ${t.localizedMessage}")
                }
            })
    }

    private fun loadAndFilterByName(name: String) {
        RetrofitInstance.api.getMovies()
            .enqueue(object : Callback<List<Movie>> {
                override fun onResponse(
                    call: Call<List<Movie>>,
                    response: Response<List<Movie>>
                ) {
                    if (response.isSuccessful) {
                        val allMovies = response.body().orEmpty()
                        cacheManager.cacheMovies(allMovies)

                        val filtered = allMovies.filter {
                            it.category?.name?.equals(name, ignoreCase = true) == true ||
                                    it.categoryName?.equals(name, ignoreCase = true) == true
                        }

                        Log.d(TAG, "Filtered ${filtered.size} movies for category: $name")
                        movieAdapter.updateMovies(filtered)
                    } else {
                        showError("Failed to load movies")
                    }
                }

                override fun onFailure(call: Call<List<Movie>>, t: Throwable) {
                    showError("Network error: ${t.localizedMessage}")
                }
            })
    }

    private fun convertToMovie(
        video: CategoryVideo,
        categoryName: String,
        catId: Int
    ): Movie {
        return Movie(
            id = video.id,
            contentType = "video/mp4",
            uploadedOn = video.uploadedOn,
            title = video.title,
            description = video.description,
            size = 0L,
            hasThumbnail = true,
            thumbnailUrl = video.thumbnailPath,
            videoUrl = "",
            duration = video.duration,
            category = CategoryDto(
                categoryId = catId,
                name = categoryName,
                videos = null
            ),
            categoryName = categoryName,
            uploadDate = video.uploadedOn,
            isPremium = false
        )
    }

    private fun showError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
    }

    inner class GridSpacingItemDecoration(
        private val spanCount: Int,
        private val spacing: Int,
        private val includeEdge: Boolean
    ) : RecyclerView.ItemDecoration() {

        override fun getItemOffsets(
            outRect: Rect,
            view: View,
            parent: RecyclerView,
            state: RecyclerView.State
        ) {
            val position = parent.getChildAdapterPosition(view)
            val column = position % spanCount

            if (includeEdge) {
                outRect.left = spacing - column * spacing / spanCount
                outRect.right = (column + 1) * spacing / spanCount
                if (position < spanCount) {
                    outRect.top = spacing
                }
                outRect.bottom = spacing
            } else {
                outRect.left = column * spacing / spanCount
                outRect.right = spacing - (column + 1) * spacing / spanCount
                if (position >= spanCount) {
                    outRect.top = spacing
                }
            }
        }
    }
}