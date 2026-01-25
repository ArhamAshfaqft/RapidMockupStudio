Add-Type -AssemblyName System.Drawing

$sourcePath = "d:\Bulk Mockup\assets\icon.png"
$destPath = "d:\Bulk Mockup\assets\icon_clean.png"

try {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    
    # Create high-quality 256x256
    $resized = new-object System.Drawing.Bitmap 256, 256
    $graph = [System.Drawing.Graphics]::FromImage($resized)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graph.DrawImage($img, 0, 0, 256, 256)
    
    $resized.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $img.Dispose()
    $resized.Dispose()
    $graph.Dispose()
    
    Write-Host "Created icon_clean.png (256x256)"
} catch {
    Write-Error $_.Exception.Message
}
