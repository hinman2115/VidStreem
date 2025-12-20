package com.example.vidstreem.Data.Model

data class Plan(
    val planId: Int,
    val planName: String,
    val description: String,
    // Keep amount as "rupees" on app side; backend will send "amount" in rupees
    val amount: Int,
    val currency: String = "INR",
    val isActive: Boolean = true,
    val videoQuality: String,
    val maxDevices: Int,
    val downloadAllowed: Boolean,
    val adFree: Boolean,
    val billingPeriod: String // "month" or "year"
)

data class AccessResponse(
    val success: Boolean,
    val hasAccess: Boolean
)

data class ApiEnvelope<T>(val success: Boolean, val data: T?)
data class PlanDto(
    val planId: Int,
    val planName: String,
    val amount: Int,
    val currency: String,
    val billingPeriod: String,
    val billingInterval: Int,
    val description: String,
    val adFree: Boolean = false,
    val maxDevices: Int = 1,
    val videoQuality: String = "",
    val downloadAllowed: Boolean = false
)

data class CreateOrderRequest(val PlanId: Int)
data class CreateOrderResponse(
    val orderId: String,
    val amount: Int,
    val currency: String,
    val planId: Int,
    val planName: String,
    val keyId: String
)

data class VerifyPaymentRequest(
    val RazorpayOrderId: String,
    val RazorpayPaymentId: String,
    val RazorpaySignature: String
)

data class VerifyPaymentResponse(val startDate: String, val endDate: String)
