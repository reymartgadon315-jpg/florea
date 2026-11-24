$javaHome = "C:\Users\THIS PC\AppData\Local\bubblewrap-jdk17"
$androidHome = "C:\Users\THIS PC\AppData\Local\Android\Sdk"
$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome
$env:FLOREA_ANDROID_KEYSTORE_PATH = "C:\Users\THIS PC\Documents\florea-android.keystore"

if (-not $env:FLOREA_ANDROID_KEYSTORE_PASSWORD) {
    throw "Set FLOREA_ANDROID_KEYSTORE_PASSWORD before building the APK."
}

Set-Location "$PSScriptRoot\..\android-twa"
& .\gradlew.bat assembleRelease
