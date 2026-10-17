# React Native core
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep @com.facebook.proguard.annotations.DoNotStripAny class * {
    *;
}
-keep @com.facebook.jni.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.jni.annotations.DoNotStrip *;
}
-keep @com.facebook.jni.annotations.DoNotStripAny class * {
    *;
}

-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

-dontwarn com.facebook.react.**
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }
-keep,includedescriptorclasses class com.facebook.react.turbomodule.core.** { *; }
-keep,includedescriptorclasses class com.facebook.react.internal.turbomodule.core.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# App package
-keep class com.ayurmuniecosystem.** { *; }

# Networking
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class sun.misc.Unsafe { *; }

# Agora
-keep class io.agora.** { *; }
-dontwarn io.agora.**

# Razorpay
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn com.razorpay.**

# PayPhi / ICICI Customer SDK
-keep class com.payphi.sdk.** { *; }
-dontwarn com.payphi.sdk.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class androidx.appcompat.** { *; }
-dontwarn androidx.appcompat.**
-keep class androidx.core.** { *; }
-dontwarn androidx.core.**
-keep class androidx.lifecycle.** { *; }
-dontwarn androidx.lifecycle.**

# Reanimated / Worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }

# Fresco
-keep public class com.facebook.imageutils.** { public *; }

-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
