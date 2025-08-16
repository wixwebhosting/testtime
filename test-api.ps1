# PowerShell script to get error details from your Render API

$body = '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
$response = Invoke-WebRequest -Uri "https://yttomp3-1zux.onrender.com/api/download" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    Write-Host "Success! MP3 downloaded as output.mp3"
    $response.Content | Set-Content -Encoding Byte -Path output.mp3
} else {
    Write-Host "Error: $($response.StatusCode)"
    Write-Host "Response body: $($response.Content)"
}
