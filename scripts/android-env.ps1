$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = Join-Path $env:LOCALAPPDATA "Android\Sdk"

if (-not (Test-Path (Join-Path $javaHome "bin\java.exe"))) {
  Write-Error "Java not found at $javaHome. Install Android Studio or set JAVA_HOME manually."
  exit 1
}

if (-not (Test-Path $androidHome)) {
  Write-Error "Android SDK not found at $androidHome. Open Android Studio and install the SDK."
  exit 1
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome
$env:GRADLE_USER_HOME = "C:\gradle"

$pathParts = $env:Path -split ';' | Where-Object { $_ -ne '' }
$required = @(
  (Join-Path $javaHome "bin"),
  (Join-Path $androidHome "platform-tools"),
  (Join-Path $androidHome "emulator")
)

foreach ($entry in $required) {
  if ($pathParts -notcontains $entry) {
    $pathParts = @($entry) + $pathParts
  }
}

$env:Path = ($pathParts -join ';')

$localProps = Join-Path $PSScriptRoot "..\android\local.properties"
if (Test-Path (Split-Path $localProps -Parent)) {
  $sdkDir = $androidHome -replace '\\', '/'
  Set-Content -Path $localProps -Value "sdk.dir=$sdkDir`n" -Encoding ascii
}

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
