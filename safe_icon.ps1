Add-Type -AssemblyName System.Drawing

$sourcePath = "d:\Bulk Mockup\assets\icon.png"
$destPath = "d:\Bulk Mockup\assets\icon_safe.png"

try {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    
    # Target size
    $targetW = 256
    $targetH = 256
    
    # Calculate aspect-ratio safe dimensions with PADDING (Safe Zone)
    # Target content size = 200 (approx 80% of 256)
    $safeSize = 200
    
    $ratio = $img.Width / $img.Height
    $newW = $safeSize
    $newH = $safeSize
    
    if ($img.Width -gt $img.Height) {
        $newH = [Math]::Floor($newW / $ratio)
    } else {
        $newW = [Math]::Floor($newH * $ratio)
    }
    
    # Centering positions
    $x = [Math]::Floor(($targetW - $newW) / 2)
    $y = [Math]::Floor(($targetH - $newH) / 2)
    
    # Create canvas
    $bmp = new-object System.Drawing.Bitmap $targetW, $targetH
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Clear with transparent
    $graph.Clear([System.Drawing.Color]::Transparent)
    
    # High Quality settings
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw centered
    $graph.DrawImage($img, $x, $y, $newW, $newH)
    
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $img.Dispose()
    $bmp.Dispose()
    $graph.Dispose()
    
    Write-Host "Created icon_safe.png (Scaled to fit 256x256)"
} catch {
    Write-Error $_.Exception.Message
}
