package com.ayurmuniapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream

class DeviceDownloadModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "DeviceDownload"

  @ReactMethod
  fun notifyDownloadComplete(fileName: String, filePath: String) {
    showDownloadCompleteNotification(fileName, filePath, null)
  }

  @ReactMethod
  fun saveFileToDownloads(
    sourcePath: String,
    fileName: String,
    mimeType: String,
    showNotification: Boolean,
    promise: Promise,
  ) {
    try {
      val normalizedPath = sourcePath.removePrefix("file://")
      val sourceFile = File(normalizedPath)
      if (!sourceFile.exists()) {
        promise.reject("ENOENT", "Source file not found")
        return
      }

      val publicTarget = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        saveWithMediaStore(sourceFile, fileName, mimeType)
      } else {
        saveLegacy(sourceFile, fileName)
      }

      if (showNotification) {
        showDownloadCompleteNotification(fileName, normalizedPath, publicTarget)
      }

      promise.resolve(publicTarget)
    } catch (e: Exception) {
      promise.reject("SAVE_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun openLocalPdf(filePath: String, promise: Promise) {
    try {
      val normalizedPath = filePath.removePrefix("file://")
      val file = File(normalizedPath)
      if (!file.exists()) {
        promise.reject("ENOENT", "PDF file not found")
        return
      }

      val authority = reactContext.packageName + ".fileprovider"
      val uri = FileProvider.getUriForFile(reactContext, authority, file)

      val openIntent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uri, "application/pdf")
        clipData = android.content.ClipData.newRawUri("", uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      reactContext.startActivity(
        Intent.createChooser(openIntent, "Open PDF").apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        },
      )
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("OPEN_FAILED", e.message, e)
    }
  }

  private fun saveWithMediaStore(
    sourceFile: File,
    fileName: String,
    mimeType: String,
  ): String {
    val resolver = reactContext.contentResolver
    val values = ContentValues().apply {
      put(MediaStore.Downloads.DISPLAY_NAME, fileName)
      put(MediaStore.Downloads.MIME_TYPE, mimeType)
      put(MediaStore.Downloads.IS_PENDING, 1)
    }

    val collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
    val uri = resolver.insert(collection, values)
      ?: throw IllegalStateException("Could not create download entry")

    resolver.openOutputStream(uri)?.use { output ->
      FileInputStream(sourceFile).use { input ->
        input.copyTo(output)
      }
    } ?: throw IllegalStateException("Could not write download file")

    values.clear()
    values.put(MediaStore.Downloads.IS_PENDING, 0)
    resolver.update(uri, values, null, null)
    return uri.toString()
  }

  @Suppress("DEPRECATION")
  private fun saveLegacy(
    sourceFile: File,
    fileName: String,
  ): String {
    val downloadsDir = Environment.getExternalStoragePublicDirectory(
      Environment.DIRECTORY_DOWNLOADS,
    )
    if (!downloadsDir.exists()) {
      downloadsDir.mkdirs()
    }

    val targetFile = File(downloadsDir, fileName)
    sourceFile.copyTo(targetFile, overwrite = true)
    return targetFile.absolutePath
  }

  private fun ensureDownloadChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = reactContext.getSystemService(NotificationManager::class.java) ?: return
    if (manager.getNotificationChannel(DOWNLOAD_CHANNEL_ID) != null) return

    val channel = NotificationChannel(
      DOWNLOAD_CHANNEL_ID,
      "Downloads",
      NotificationManager.IMPORTANCE_DEFAULT,
    ).apply {
      description = "File download notifications"
      setShowBadge(true)
    }
    manager.createNotificationChannel(channel)
  }

  private fun buildOpenPdfPendingIntent(
    fileName: String,
    filePath: String,
    contentUri: String?,
  ): PendingIntent {
    val normalizedPath = filePath.removePrefix("file://")
    val file = File(normalizedPath)
    val authority = reactContext.packageName + ".fileprovider"

    val openIntent = when {
      contentUri != null && contentUri.startsWith("content://") -> {
        val uri = Uri.parse(contentUri)
        Intent(Intent.ACTION_VIEW).apply {
          setDataAndType(uri, "application/pdf")
          clipData = android.content.ClipData.newRawUri("", uri)
          addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      }
      file.exists() -> {
        val uri = FileProvider.getUriForFile(reactContext, authority, file)
        Intent(Intent.ACTION_VIEW).apply {
          setDataAndType(uri, "application/pdf")
          clipData = android.content.ClipData.newRawUri("", uri)
          addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      }
      else -> {
        Intent(reactContext, MainActivity::class.java).apply {
          flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
      }
    }

    return PendingIntent.getActivity(
      reactContext,
      fileName.hashCode(),
      openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun showDownloadCompleteNotification(
    fileName: String,
    filePath: String,
    contentUri: String? = null,
  ) {
    ensureDownloadChannel()

    val contentIntent = buildOpenPdfPendingIntent(fileName, filePath, contentUri)

    val notification = NotificationCompat.Builder(reactContext, DOWNLOAD_CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_stat_notify)
      .setContentTitle("Download complete")
      .setContentText(fileName)
      .setStyle(
        NotificationCompat.BigTextStyle()
          .bigText("$fileName saved to Downloads. Tap to open."),
      )
      .setPriority(NotificationCompat.PRIORITY_DEFAULT)
      .setCategory(NotificationCompat.CATEGORY_STATUS)
      .setAutoCancel(true)
      .setContentIntent(contentIntent)
      .build()

    val id = fileName.hashCode()
    NotificationManagerCompat.from(reactContext).notify(id, notification)
  }

  companion object {
    const val DOWNLOAD_CHANNEL_ID = "ayurmuni_downloads"
  }
}
