package com.payphi.reactnative.sdk

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.payphi.customersdk.utils.HmacUtility
import com.payphi.customersdk.utils.PayPhiSecurePrefConst
import com.payphi.customersdk.views.Application
import com.payphi.customersdk.views.PayPhiSdk
import com.payphi.customersdk.views.PaymentOptionsActivity
import org.json.JSONException
import org.json.JSONObject
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/**
 * Bridge to ICICI PayPhi Customer SDK.
 * Crash-hardening:
 * - Prefer current Activity (DIALOG mode needs a window token)
 * - Never pass null SecureToken / invalid amount to native sheet
 * - Catch Throwable and emit payment_response instead of killing the app
 */
class PayphiModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "PayphiModule"

    override fun getName(): String = "PayphiSdk"

    private fun sendEvent(eventName: String, params: String) {
        try {
            if (!reactContext.hasActiveReactInstance()) return
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (t: Throwable) {
            Log.e(TAG, "sendEvent failed: ${t.message}", t)
        }
    }

    private fun emitError(message: String) {
        val safe = message.replace("\"", "'").replace("\n", " ")
        sendEvent("payment_response", "{\"error\": \"$safe\"}")
    }

    @ReactMethod
    fun setAppInfo(params: ReadableMap, promise: Promise) {
        Log.d(TAG, "setAppInfo Called")

        if (!params.hasKey("environment") || !params.hasKey("merchantId") || !params.hasKey("appId")) {
            promise.reject("MISSING_ARGS", "Mandatory fields are missing")
            return
        }

        val merchantId = params.getString("merchantId")?.trim().orEmpty()
        val appId = params.getString("appId")?.trim().orEmpty()
        val envRaw = params.getString("environment")?.trim().orEmpty()
        val env = normalizeSdkEnv(envRaw)
        val merchantName =
            if (params.hasKey("merchantName")) params.getString("merchantName")?.trim().orEmpty() else ""

        if (merchantId.isEmpty() || appId.isEmpty() || env.isEmpty()) {
            promise.reject("MISSING_ARGS", "Mandatory fields are missing")
            return
        }

        Log.d(TAG, "setAppInfoData: merchantId: $merchantId, appId: $appId, environment: $env (raw=$envRaw)")
        Log.i(
            TAG,
            """
            |========== ICICI PAYPHI NATIVE — setAppInfo START ==========
            |package=com.ayurmuniecosystem
            |environment=$env (raw=$envRaw)
            |merchantId=$merchantId
            |appId=$appId
            |merchantName=$merchantName
            |expectedLogin=https://pgpayuat.icicibank.com/merapp/login/
            |============================================================
            """.trimMargin()
        )

        try {
            val ctx: android.content.Context =
                reactContext.currentActivity ?: reactContext.applicationContext ?: reactContext

            // Prevents PaymentOptionsActivity NPE when secure pref key/context was never primed.
            try {
                PayPhiSecurePrefConst.init(ctx.applicationContext)
            } catch (t: Throwable) {
                Log.w(TAG, "PayPhiSecurePrefConst.init warning: ${t.message}")
            }

            val application = Application
            // Valid only: QA | PROD | PREPROD | INT | dev — "UAT" throws Invalid Parameter!!
            application.setEnv(env)

            application.setAppInfo(
                merchantId,
                appId,
                ctx,
                object : Application.IAppInitializationListener {
                    override fun onSuccess(status: String?) {
                        Log.i(
                            TAG,
                            """
                            |========== ICICI PAYPHI NATIVE — LOGIN SUCCESS ==========
                            |setAppInfo OK status=${status ?: "OK"}
                            |merchantId=$merchantId appId=$appId env=$env
                            |=========================================================
                            """.trimMargin()
                        )
                        try {
                            if (merchantName.isNotEmpty()) {
                                application.setMerchantName(merchantName, ctx)
                            }
                        } catch (t: Throwable) {
                            Log.w(TAG, "setMerchantName warning: ${t.message}")
                        }
                        promise.resolve(status ?: "OK")
                    }

                    override fun onFailure(errorCode: String?) {
                        val code = errorCode?.trim().orEmpty().ifEmpty { "UNKNOWN" }
                        val message = when (code) {
                            "201" -> "Invalid app credentials (MID/AppId). Code 201"
                            "504" -> "Connection error reaching PayPhi. Code 504"
                            "205" -> "Payments not enabled for this merchant. Code 205"
                            "101" -> "Internal error fetching payment options. Code 101"
                            else -> "PayPhi setAppInfo failed (code=$code)"
                        }
                        Log.e(
                            TAG,
                            """
                            |========== ICICI PAYPHI NATIVE — LOGIN FAILED ==========
                            |SEND THIS BLOCK TO ICICI TEAM
                            |loginUrl=https://pgpayuat.icicibank.com/merapp/login/
                            |httpNote=Often HTTP 200 with business error body
                            |environment=$env
                            |merchantId=$merchantId
                            |appId=$appId
                            |package=com.ayurmuniecosystem
                            |errorCode=$code
                            |errorMessage=$message
                            |knownIssue=${if (code.contains("server communication error", ignoreCase = true)) "server communication error 200 — MID/AppId not accepted OR package not whitelisted OR Customer SDK not enabled on INT" else "see errorCode"}
                            |askIcici=Confirm Customer SDK App ID, whitelist com.ayurmuniecosystem, enable Customer App SDK on INT
                            |========================================================
                            """.trimMargin()
                        )
                        promise.reject(code, message)
                    }
                }
            )
        } catch (t: Throwable) {
            Log.e(TAG, "setAppInfo crash prevented: ${t.message}", t)
            promise.reject("SET_APP_INFO_ERROR", t.message, t)
        }
    }

    @ReactMethod
    fun makePayment(params: ReadableMap) {
        val activity = reactContext.currentActivity
        if (activity == null || activity.isFinishing) {
            emitError("App activity not ready for PayPhi. Try again.")
            return
        }

        activity.runOnUiThread {
            try {
                startPayment(activity, params)
            } catch (t: Throwable) {
                Log.e(TAG, "makePayment crash prevented: ${t.message}", t)
                emitError(t.message ?: "Unable to open PayPhi payment")
            }
        }
    }

    private fun startPayment(activity: Activity, params: ReadableMap) {
        if (!params.hasKey("amount") || !params.hasKey("merchantId") || !params.hasKey("merchantTxnNo") ||
            !params.hasKey("currencyCode") || !params.hasKey("customerEmailID")
        ) {
            emitError("Mandatory fields are missing")
            return
        }

        val amountRaw = params.getString("amount")?.trim().orEmpty()
        val merchantId = params.getString("merchantId")?.trim().orEmpty()
        val merchantTxnNo = params.getString("merchantTxnNo")?.trim().orEmpty()
        val currencyCode = params.getString("currencyCode")?.trim().orEmpty()
        val customerEmail = params.getString("customerEmailID")?.trim().orEmpty()
        val secretKey =
            if (params.hasKey("secretKey")) params.getString("secretKey")?.trim() else null

        if (amountRaw.isEmpty() || merchantId.isEmpty() || merchantTxnNo.isEmpty() ||
            currencyCode.isEmpty() || customerEmail.isEmpty()
        ) {
            emitError("Mandatory fields are missing")
            return
        }

        val amountFormatted = formatAmount(amountRaw)
        if (amountFormatted == null) {
            emitError("Invalid amount: $amountRaw")
            return
        }

        val secureTokenFromServer = when {
            params.hasKey("secureToken") && !params.getString("secureToken").isNullOrBlank() ->
                params.getString("secureToken")!!.trim()
            params.hasKey("SecureToken") && !params.getString("SecureToken").isNullOrBlank() ->
                params.getString("SecureToken")!!.trim()
            else -> null
        }

        // HMAC(amount + currencyCode + merchantId + merchantTxnNo, secretKey)
        val secureToken = secureTokenFromServer
            ?: getSecureToken(amountFormatted, currencyCode, merchantId, merchantTxnNo, secretKey)
            ?: ""

        if (secureToken.isBlank()) {
            emitError("SecureToken missing — provide secretKey (UAT Key) or secureToken")
            return
        }

        val paymentParams = Bundle().apply {
            putString("Amount", amountFormatted)
            putString("MerchantID", merchantId)
            putString("MerchantTxnNo", merchantTxnNo)
            putString("CurrencyCode", currencyCode)
            putString("CustomerEmailID", customerEmail)
            putString("SecureToken", secureToken)
            putString("invoiceNo", merchantTxnNo)

            putOptional(params, "allowDisablePaymentMode", "allowDisablePaymentMode")
            putOptional(params, "addlParam1", "addlParam1")
            putOptional(params, "addlParam2", "addlParam2")
            putOptional(params, "paymentType", "PaymentType")
            putOptional(params, "vpa", "vpa")
            putOptional(params, "aggregatorID", "aggregatorID")
            putOptional(params, "apiVersion", "apiVersion")
            putOptional(params, "customerMobileNo", "CustomerMobileNo")
            putOptional(params, "customerName", "CustomerName")
            putOptional(params, "transactionType", "TransactionType")
            putOptional(params, "payType", "PayType")
        }

        val responseListener = object : PayPhiSdk.IAppPaymentResponseListenerEx {
            override fun onPaymentResponse(
                resultCode: Int,
                data: Intent?,
                additionalInfo: Map<String?, String?>?
            ) {
                try {
                    val bundleData = data?.extras
                    val json = if (bundleData != null) bundleToJson(bundleData) else JSONObject()
                    if (additionalInfo != null) {
                        for ((k, v) in additionalInfo) {
                            if (!k.isNullOrBlank() && v != null) {
                                json.put(k, v)
                            }
                        }
                    }
                    json.put("resultCode", resultCode)
                    Log.d(TAG, "onPaymentResponse: $json")
                    sendEvent("payment_response", json.toString())
                } catch (t: Throwable) {
                    Log.e(TAG, "onPaymentResponse error: ${t.message}", t)
                    emitError(t.message ?: "Payment response parse failed")
                }
            }

            override fun onPaymentResponse1(resultCode: Int, data: Intent?) {
                Log.d(TAG, "onPaymentResponse1: resultCode => $resultCode")
            }
        }

        // Use Activity context — DIALOG mode needs a window token (Application context crashes).
        val intent = Intent(activity, PaymentOptionsActivity::class.java).apply {
            putExtras(paymentParams)
        }

        Log.i(
            TAG,
            """
            |========== ICICI PAYPHI NATIVE — makePayment START ==========
            |amount=$amountFormatted
            |merchantId=$merchantId
            |merchantTxnNo=$merchantTxnNo
            |currencyCode=$currencyCode
            |customerEmail=$customerEmail
            |hasSecureToken=${secureToken.isNotBlank()}
            |opening PaymentOptionsActivity (DIALOG)
            |=============================================================
            """.trimMargin()
        )
        PayPhiSdk.makePayment(activity, intent, PayPhiSdk.DIALOG, responseListener)
    }

    private fun Bundle.putOptional(params: ReadableMap, jsKey: String, bundleKey: String) {
        if (!params.hasKey(jsKey)) return
        val value = params.getString(jsKey)?.trim().orEmpty()
        if (value.isNotEmpty()) putString(bundleKey, value)
    }

    /** Always return "##.##" or null — avoids NumberFormatException / null format crashes. */
    private fun formatAmount(raw: String): String? {
        return try {
            val cleaned = raw.replace(",", "").replace("₹", "").replace("Rs", "", ignoreCase = true).trim()
            val value = cleaned.toDouble()
            if (value <= 0.0 || value.isNaN() || value.isInfinite()) return null
            String.format("%.2f", value)
        } catch (_: Throwable) {
            null
        }
    }

    /**
     * Map friendly names to SDK env constants.
     * SDK setEnv throws InvalidParameterException("Invalid Parameter!!") for anything else.
     */
    private fun normalizeSdkEnv(raw: String): String {
        val env = raw.trim().uppercase().replace(Regex("[\\s_-]"), "")
        return when (env) {
            "PROD", "PRODUCTION", "LIVE", "1" -> "PROD"
            "PREPROD", "PREPRODUCTION" -> "PREPROD"
            "QA", "QATSP" -> "QA"
            "DEV", "DEVELOPMENT" -> "dev"
            // UAT / sandbox / integration → INT (matches pgpayuat.../tsp/)
            else -> "INT"
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    private fun getSecureToken(
        amountFormatted: String,
        currencyCode: String,
        merchantId: String,
        merchantTxnNo: String,
        secretKey: String?
    ): String? {
        if (secretKey.isNullOrBlank()) return null
        val value = amountFormatted + currencyCode + merchantId + merchantTxnNo
        return generateHMAC(value, secretKey)
    }

    private fun generateHMAC(message: String, secretKey: String): String? {
        return try {
            val sha256Hmac = Mac.getInstance("HmacSHA256")
            val keySpec = SecretKeySpec(secretKey.toByteArray(Charsets.UTF_8), "HmacSHA256")
            sha256Hmac.init(keySpec)
            val hashedBytes = sha256Hmac.doFinal(message.toByteArray(Charsets.UTF_8))
            HmacUtility.bytesToHex(hashedBytes)
        } catch (e: Exception) {
            Log.e(TAG, "HMAC failed: ${e.message}", e)
            null
        }
    }

    private fun bundleToJson(bundle: Bundle): JSONObject {
        val json = JSONObject()
        for (key in bundle.keySet()) {
            try {
                json.put(key, JSONObject.wrap(bundle.get(key)))
            } catch (_: JSONException) {
                // skip bad keys
            }
        }
        return json
    }
}
