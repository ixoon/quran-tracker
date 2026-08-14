$keytoolCandidates = @(
  "$env:JAVA_HOME\bin\keytool.exe",
  "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe",
  "C:\Program Files\Android\Android Studio\jre\bin\keytool.exe"
)

$keytool = $keytoolCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $keytool) {
  $cmd = Get-Command keytool -ErrorAction SilentlyContinue
  if ($cmd) { $keytool = $cmd.Source }
}

if (-not $keytool) {
  Write-Error "keytool not found. Install JDK or Android Studio."
  exit 1
}

$keystore = Join-Path $env:USERPROFILE ".android\debug.keystore"
if (-not (Test-Path $keystore)) {
  Write-Host "Creating debug keystore at $keystore"
  New-Item -ItemType Directory -Force -Path (Split-Path $keystore) | Out-Null
  & $keytool -genkeypair -v -keystore $keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

Write-Host "`nDebug keystore fingerprints (for Google Cloud Android OAuth client):`n"
& $keytool -list -v -keystore $keystore -alias androiddebugkey -storepass android -keypass android | Select-String -Pattern "SHA1:|SHA256:"
