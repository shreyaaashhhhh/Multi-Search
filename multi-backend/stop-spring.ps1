$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'CoureservicesApplication|mvnw|org.springframework.boot|spring-boot' }
if ($procs) {
  $procs | ForEach-Object {
    Write-Output "Killing PID:$($_.ProcessId) cmd:$($_.CommandLine)"
    Stop-Process -Id $_.ProcessId -Force
  }
} else {
  Write-Output 'No Spring Boot processes found'
}
