$gradlew = Join-Path $PSScriptRoot "..\android\gradlew.bat"
$marker = "Android Studio bundled JDK"
$insert = @"
@rem Use Android Studio bundled JDK when JAVA_HOME is not configured.
if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"

"@

if (-not (Test-Path $gradlew)) {
  Write-Host "android/gradlew.bat not found — run npx expo prebuild first."
  exit 0
}

$content = Get-Content $gradlew -Raw
if ($content -like "*$marker*") {
  exit 0
}

$content = $content -replace (
  '@rem Add default JVM options here\. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script\.',
  ($insert + '@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.')
)

Set-Content -Path $gradlew -Value $content -Encoding ascii
Write-Host "Patched android/gradlew.bat with Android Studio JAVA_HOME fallback."

$gradleProps = Join-Path $PSScriptRoot "..\android\gradle.properties"
$javaHomeLine = 'org.gradle.java.home=C\:\\Program Files\\Android\\Android Studio\\jbr'
if (Test-Path $gradleProps) {
  $props = Get-Content $gradleProps -Raw
  if ($props -notmatch 'org\.gradle\.java\.home=') {
    $props = $props -replace '(org\.gradle\.jvmargs=.*)', "`$1`n$javaHomeLine"
    Set-Content -Path $gradleProps -Value $props -Encoding ascii
    Write-Host "Added org.gradle.java.home to android/gradle.properties."
  }
}
