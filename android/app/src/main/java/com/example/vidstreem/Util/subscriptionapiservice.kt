
import com.example.vidstreem.Data.Model.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface SubscriptionApiService {

    // Public
    @GET("subscription/check-access")
    suspend fun checkAccess(@Header("Authorization") bearer: String): Response<Map<String, Any>>

    @GET("subscription/plans")
    suspend fun getPlans(@Header("Authorization") bearer: String): Response<ApiEnvelope<List<PlanDto>>>

    @POST("subscription/create")
    suspend fun create(@Header("Authorization") bearer: String, @Body req: CreateOrderRequest): Response<Map<String, Any>>

    @POST("subscription/verify-payment")
    suspend fun verify(@Header("Authorization") bearer: String, @Body req: VerifyPaymentRequest): Response<Map<String, Any>>
}
