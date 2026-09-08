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
  fun ensureChannels() {
    ensureChannel()
    // Also bump common OneSignal channel ids to HIGH so background pushes heads-up.
    ensureChannelWithId(
      "fcm_fallback_notification_channel",
      "Ayurmuni alerts",
    )
    ensureChannelWithId(
      "onesignal_default_channel_id",
      "Ayurmuni notifications",
    )
  }

  @ReactMethod
  fun show(payload: ReadableMap?) {
    val title = payload?.getString("title")?.takeIf { it.isNotBlank() } ?: "Ayurmuni"
    val message = payload?.getString("message")?.takeIf { it.isNotBlank() }
      ?: "You have a new notification"

    ensureChannels()

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
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_MESSAGE)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setDefaults(NotificationCompat.DEFAULT_ALL)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .build()

    val id = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
    NotificationManagerCompat.from(reactContext).notify(id, notification)
  }

  private fun ensureChannel() {
    ensureChannelWithId(CHANNEL_ID, "Messages & alerts")
  }

  private fun ensureChannelWithId(channelId: String, name: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = reactContext.getSystemService(NotificationManager::class.java) ?: return

    val existing = manager.getNotificationChannel(channelId)
    if (existing != null && existing.importance >= NotificationManager.IMPORTANCE_HIGH) {
      return
    }
    if (existing != null) {
      manager.deleteNotificationChannel(channelId)
    }

    val channel = NotificationChannel(
      channelId,
      name,
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "WhatsApp-style pop-up for new messages"
      enableVibration(true)
      enableLights(true)
      setShowBadge(true)
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      setBypassDnd(false)
    }
    manager.createNotificationChannel(channel)
  }

  companion object {
    const val CHANNEL_ID = "ayurmuni_heads_up"
  }
}
