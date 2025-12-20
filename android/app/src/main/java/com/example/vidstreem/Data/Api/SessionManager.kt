import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import android.util.Log
import com.example.vidstreem.Data.LocalDb.MovieCacheDatabaseHelper
import org.json.JSONObject

class SessionManager(context: Context) {

    var movicase = MovieCacheDatabaseHelper(context)
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "MyAppSession"
        private const val USER_TOKEN = "user_token"
    }

    //save token
    fun saveAuthToken(token: String?) {
        if (token.isNullOrEmpty()) {
            Log.e("JWT_DEBUG", "Attempted to save null or empty token!")
            return
        }
        prefs.edit().putString(USER_TOKEN, token).apply()
        Log.d("JWT_DEBUG", "Token saved: $token")
    }

    //fetch token
    fun fetchAuthToken(): String? {
        val token = prefs.getString(USER_TOKEN, null)
        Log.d("JWT_DEBUG", "Fetched token: $token")
        return token
    }

    //Clears token
    fun clearAuthToken() {
        prefs.edit().remove(USER_TOKEN).apply()
        Log.d("JWT_DEBUG", "Token cleared")
    }


    //token decoding
    fun decodeJWT(token: String): JSONObject? {
        return try {
            val parts = token.split(".")
            if (parts.size < 2) return null

            var payload = parts[1]

            // FIX padding
            val pad = payload.length % 4
            if (pad != 0) {
                payload += "=".repeat(4 - pad)
            }

            val decodedBytes = Base64.decode(payload, Base64.URL_SAFE)
            val decodedString = String(decodedBytes, Charsets.UTF_8)

            Log.d("JWT_PAYLOAD_RAW", decodedString)

            JSONObject(decodedString)
        } catch (e: Exception) {
            Log.e("JWT_ERROR", "JWT decode failed", e)
            null
        }
    }



    //all data from token
    fun getPayload(): JSONObject? {
        val token = fetchAuthToken() ?: return null
        return decodeJWT(token)
    }

    //user id
    fun getUserId(): Int? {
        return try {
            val payload = getPayload() ?: return null
            payload.getString("sub").toInt()
        } catch (e: Exception) {
            null
        }
    }




    /** Example: get username from saved token */
    fun getUserName(): String? {
        val payload = getPayload() ?: return null

        return try {
            // Try both possible claim keys
            payload.optString("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", null)
                ?: payload.optString("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", null)
        } catch (e: Exception) {
            null
        }
    }

    fun logout(){
        clearAuthToken()
        movicase.clearAllCache()

    }

    fun getUserIdFromToken(): Int? {
        val token = fetchAuthToken() ?: return null

        return try {
            val parts = token.split(".")
            if (parts.size < 2) return null

            val payload = parts[1]
            val decodedBytes = Base64.decode(payload, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
            val decodedString = String(decodedBytes, Charsets.UTF_8)
            val json = JSONObject(decodedString)

            // adjust key depending on your token payload
            when {
                json.has("userId") -> json.getInt("userId")
                json.has("sub") -> json.getInt("sub")          // many JWTs store ID in "sub"
                else -> null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

}

