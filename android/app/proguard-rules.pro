# ✅ For RN 0.84+
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# ✅ Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# ✅ Keep React Native modules
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# ✅ Keep custom modules
-keep class com.ayurmuniapp.** { *; }

# ✅ Keep JavaScript interfaces
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature

# ✅ WebSocket
-keep class org.java_websocket.** { *; }
-keep class com.neovisionaries.ws.client.** { *; }

# ✅ OkHttp
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# ✅ AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# ✅ Agora
-keep class io.agora.** { *; }
-keep class com.agora.** { *; }
-dontwarn io.agora.**

# ✅ Keep all native libraries
-keep class **.R$* { *; }
-keep class **.BuildConfig { *; }

# ✅ Don't obfuscate for now (for debugging)
-dontobfuscate
-dontoptimize