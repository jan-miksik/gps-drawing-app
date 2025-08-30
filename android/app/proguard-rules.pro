# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor specific rules
-keep class com.getcapacitor.** { *; }
-keep class gps.pen.app.** { *; }

# Keep JavaScript interface classes for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Capacitor plugins
-keep class com.getcapacitor.plugin.** { *; }
-keep class com.getcapacitor.cordova.** { *; }

# Keep GPS and location related classes
-keep class * implements android.location.LocationListener { *; }
-keep class * extends android.location.LocationManager { *; }

# Keep notification related classes
-keep class * extends android.app.Notification { *; }
-keep class * extends android.app.NotificationManager { *; }

# Keep file system related classes
-keep class * extends java.io.File { *; }
-keep class * extends java.io.FileInputStream { *; }
-keep class * extends java.io.FileOutputStream { *; }

# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep WebView JavaScript interface
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}
