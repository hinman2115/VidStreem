package com.example.vidstreem.Ui

import SessionManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.vidstreem.Data.Api.RetrofitInstance
import com.example.vidstreem.Data.Model.*
import com.example.vidstreem.R
import com.example.vidstreem.subscription.SubscriptionPlansAdapter
import com.razorpay.PaymentData
import com.razorpay.PaymentResultWithDataListener
import com.razorpay.Checkout
import kotlinx.coroutines.launch
import org.json.JSONObject

class Subscriptionplanactivity : AppCompatActivity(), PaymentResultWithDataListener {

    private lateinit var recycler: RecyclerView
    private lateinit var adapter: SubscriptionPlansAdapter

    // Cache the last order to verify on success
    private var lastOrderId: String? = null
    private var selectedPlan: PlanDto? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_subscriptionplanactivity) // must contain RecyclerView with id rvPlans

        // Preload Razorpay SDK
        Checkout.preload(applicationContext)

        recycler = findViewById(R.id.rvPlans)
        adapter = SubscriptionPlansAdapter { plan -> startCheckout(plan) }
        recycler.layoutManager = GridLayoutManager(this, 1)
        recycler.adapter = adapter

        loadPlans()
    }

    private fun loadPlans() {
        lifecycleScope.launch {
            val token = SessionManager(this@Subscriptionplanactivity).fetchAuthToken()
            if (token.isNullOrBlank()) {
                Toast.makeText(this@Subscriptionplanactivity, "Login required", Toast.LENGTH_SHORT)
                    .show()
                finish()
                return@launch
            }
            try {
                val resp = RetrofitInstance.subapi.getPlans("Bearer $token")
                if (!resp.isSuccessful) {
                    Toast.makeText(
                        this@Subscriptionplanactivity,
                        "Failed to load plans (${resp.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                    return@launch
                }
                val plans = resp.body()?.data ?: emptyList<PlanDto>()
                adapter.submitList(plans)
            } catch (e: Exception) {
                Log.e("Plans", "Error: ${e.message}", e)
                Toast.makeText(
                    this@Subscriptionplanactivity,
                    "Error loading plans",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun startCheckout(plan: PlanDto) {
        selectedPlan = plan
        lifecycleScope.launch {
            val token = SessionManager(this@Subscriptionplanactivity).fetchAuthToken()
            if (token.isNullOrBlank()) {
                Toast.makeText(this@Subscriptionplanactivity, "Login required", Toast.LENGTH_SHORT)
                    .show()
                return@launch
            }

            try {
                val createResp = RetrofitInstance.subapi.create(
                    "Bearer $token",
                    CreateOrderRequest(plan.planId)
                )
                if (!createResp.isSuccessful) {
                    Toast.makeText(
                        this@Subscriptionplanactivity,
                        "Create order failed (${createResp.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                    return@launch
                }
                val body = createResp.body() ?: run {
                    Toast.makeText(
                        this@Subscriptionplanactivity,
                        "Empty create response",
                        Toast.LENGTH_SHORT
                    ).show()
                    return@launch
                }
                val data = body["data"] as? Map<*, *> ?: run {
                    Toast.makeText(
                        this@Subscriptionplanactivity,
                        "Invalid create response",
                        Toast.LENGTH_SHORT
                    ).show()
                    return@launch
                }

                val orderId = data["orderId"] as String
                val keyId = data["keyId"] as String
                val amount = (data["amount"] as Number).toInt()
                val currency = data["currency"] as String

                lastOrderId = orderId

                val co = Checkout()
                co.setKeyID(keyId)

                val options = JSONObject().apply {
                    put("name", "VidStreem")
                    put("description", plan.planName)
                    put("order_id", orderId)
                    put("currency", currency)
                    // Backend created order in paise; amount here is INR from API, send paise to SDK:
                    put("amount", amount * 100)
                    put("retry", JSONObject().apply {
                        put("enabled", true)
                        put("max_count", 1)
                    })
                }

                co.open(this@Subscriptionplanactivity, options)
            } catch (e: Exception) {
                Log.e("Checkout", "Error: ${e.message}", e)
                Toast.makeText(
                    this@Subscriptionplanactivity,
                    "Payment init error",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    // Implement PaymentResultWithDataListener methods
    override fun onPaymentSuccess(p0: String?, p1: PaymentData?) {
        val paymentId = p0 ?: run {
            Toast.makeText(this, "Missing paymentId", Toast.LENGTH_SHORT).show()
            return
        }
        val orderId = p1?.orderId ?: lastOrderId ?: run {
            Toast.makeText(this, "Missing orderId", Toast.LENGTH_SHORT).show()
            return
        }
        val signature = p1?.signature ?: run {
            Toast.makeText(this, "Missing signature", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            val token =
                SessionManager(this@Subscriptionplanactivity).fetchAuthToken() ?: return@launch
            val req = VerifyPaymentRequest(
                RazorpayOrderId = orderId,
                RazorpayPaymentId = paymentId,
                RazorpaySignature = signature
            )
            val resp = RetrofitInstance.subapi.verify("Bearer $token", req)
            if (resp.isSuccessful) {
                Toast.makeText(
                    this@Subscriptionplanactivity,
                    "Subscription Activated!",
                    Toast.LENGTH_SHORT
                ).show()
                setResult(RESULT_OK)
                finish()
            } else {
                Toast.makeText(
                    this@Subscriptionplanactivity,
                    "Verify failed: ${resp.code()}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    override fun onPaymentError(p0: Int, p1: String?, p2: PaymentData?) {
        Log.e("Payment", "Error code=$p0, resp=$p1")
        Toast.makeText(this, "Payment failed ($p0)", Toast.LENGTH_SHORT).show()
    }
}