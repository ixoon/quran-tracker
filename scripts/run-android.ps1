Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')
. (Join-Path $PSScriptRoot 'android-env.ps1')

npx expo run:android @args
