package com.lovoctech.yakshanaada

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PlaybackServiceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "PlaybackService"

  @ReactMethod
  fun start() {
    val intent = Intent(reactContext, PlaybackKeepAliveService::class.java)
    ContextCompat.startForegroundService(reactContext, intent)
  }

  @ReactMethod
  fun stop() {
    val intent = Intent(reactContext, PlaybackKeepAliveService::class.java)
    reactContext.stopService(intent)
  }
}
