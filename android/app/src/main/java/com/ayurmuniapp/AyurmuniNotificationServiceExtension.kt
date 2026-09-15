package com.ayurmuniapp

import androidx.core.app.NotificationCompat
import com.onesignal.notifications.INotificationReceivedEvent
import com.onesignal.notifications.INotificationServiceExtension

/**
 * Runs even when the app is killed so a delivered push can heads-up
 * instead of landing silently in the tray.
 */
class AyurmuniNotificationServiceExtension : INotificationServiceExtension {
  override fun onNotificationReceived(event: INotificationReceivedEvent) {
    val context = event.context
    HeadsUpNotificationModule.ensureChannels(context)
    event.notification.setExtender { builder ->
      builder
        .setChannelId(HeadsUpNotificationModule.CHANNEL_ID)
        .setPriority(NotificationCompat.PRIORITY_MAX)
        .setCategory(NotificationCompat.CATEGORY_MESSAGE)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setDefaults(NotificationCompat.DEFAULT_ALL)
        .setSmallIcon(R.drawable.ic_stat_notify)
    }
  }
}
