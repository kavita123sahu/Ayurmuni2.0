package com.ayurmuniapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class HeadsUpNotificationModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "HeadsUpNotification"

  @ReactMethod
  fun show(payload: ReadableMap?) {
    val title = payload?.getString("title")?.takeIf { it.isNotBlank() } ?: "Ayurmuni"
    val message = payload?.getString("message")?.takeIf { it.isNotBlank() }
      ?: "You have a new notification"

    ensureChannel()

    val intent = Intent(reactContext, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    val pendingIntent = PendingIntent.getActivity(
      reactContext,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(reactContext, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_stat_notify)
      .setContentTitle(title)
      .setContentText(message)
      .setStyle(NotificationCompat.BigTextStyle().bigText(message))
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_MESSAGE)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setDefaults(NotificationCompat.DEFAULT_ALL)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      // Stay in the tray until the user swipes / taps — never auto-expire.
      .build()

    val id = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
    NotificationManagerCompat.from(reactContext).notify(id, notification)
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = reactContext.getSystemService(NotificationManager::class.java) ?: return
    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      "Messages & alerts",
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "WhatsApp-style pop-up for new messages"
      enableVibration(true)
      enableLights(true)
      setShowBadge(true)
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
    }
    manager.createNotificationChannel(channel)
  }

  companion object {
    const val CHANNEL_ID = "ayurmuni_heads_up"
  }
}
