Add-Type -AssemblyName System.Drawing

$path = "d:\Bulk Mockup\assets\icon.png"
if (Test-Path $path) {
    try {
        $img = [System.Drawing.Image]::FromFile($path)
        Write-Host "Width: $($img.Width)"
        Write-Host "Height: $($img.Height)"
        $img.Dispose()
    } catch {
        Write-Error "Failed to load image: $_"
    }
} else {
    Write-Error "File not found."
}
