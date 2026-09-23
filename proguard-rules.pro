# Keep serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class **$$serializer { *; }
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# Keep service / receiver entry points referenced from the manifest
-keep class com.xtrora.liquidlauncher.service.** { *; }
