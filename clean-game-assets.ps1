param(
    [string[]]$Folders = @(
        "assets/level3/extracted",
        "assets/level4/extracted",
        "assets/level5/extracted"
    )
)

Add-Type -AssemblyName System.Drawing

function Get-Median([int[]]$Values) {
    $sorted = $Values | Sort-Object
    return [int]$sorted[[int][Math]::Floor($sorted.Count / 2)]
}

function Get-EdgeColor([System.Drawing.Bitmap]$Bitmap) {
    $red = [System.Collections.Generic.List[int]]::new()
    $green = [System.Collections.Generic.List[int]]::new()
    $blue = [System.Collections.Generic.List[int]]::new()

    $lastX = [int]$Bitmap.Width - 1
    $lastY = [int]$Bitmap.Height - 1
    $nearLastX = [Math]::Max(0, $lastX - 1)
    $nearLastY = [Math]::Max(0, $lastY - 1)
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
        foreach ($y in @(0, [Math]::Min(1, $lastY), $nearLastY, $lastY)) {
            $pixel = $Bitmap.GetPixel($x, $y)
            $red.Add($pixel.R); $green.Add($pixel.G); $blue.Add($pixel.B)
        }
    }
    for ($y = 2; $y -lt $nearLastY; $y++) {
        foreach ($x in @(0, [Math]::Min(1, $lastX), $nearLastX, $lastX)) {
            $pixel = $Bitmap.GetPixel($x, $y)
            $red.Add($pixel.R); $green.Add($pixel.G); $blue.Add($pixel.B)
        }
    }

    return [System.Drawing.Color]::FromArgb(255, (Get-Median $red), (Get-Median $green), (Get-Median $blue))
}

function Remove-AssetMatte([string]$Path) {
    $fileBitmap = [System.Drawing.Bitmap]::FromFile($Path)
    $source = [System.Drawing.Bitmap]::new($fileBitmap)
    $fileBitmap.Dispose()
    try {
        $sourceLastX = [int]$source.Width - 1
        $sourceLastY = [int]$source.Height - 1
        $cornerAlpha = @(
            $source.GetPixel(0, 0).A,
            $source.GetPixel($sourceLastX, 0).A,
            $source.GetPixel(0, $sourceLastY).A,
            $source.GetPixel($sourceLastX, $sourceLastY).A
        )
        if (($cornerAlpha | Where-Object { $_ -lt 32 }).Count -ge 3) {
            Write-Host "SKIPPED (already transparent) $Path"
            return
        }
        $background = Get-EdgeColor $source
        $result = [System.Drawing.Bitmap]::new($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $pixelCount = $source.Width * $source.Height
        $width = [int]$source.Width
        $lastX = [int]$source.Width - 1
        $lastY = [int]$source.Height - 1
        $distances = [double[]]::new($pixelCount)
        $backgroundMask = [bool[]]::new($pixelCount)
        $queued = [bool[]]::new($pixelCount)
        $queue = [System.Collections.Generic.Queue[int]]::new()
        $minX = $source.Width; $minY = $source.Height; $maxX = -1; $maxY = -1

        for ($y = 0; $y -lt $source.Height; $y++) {
            for ($x = 0; $x -lt $source.Width; $x++) {
                $pixel = $source.GetPixel($x, $y)
                $dr = [double]$pixel.R - $background.R
                $dg = [double]$pixel.G - $background.G
                $db = [double]$pixel.B - $background.B
                $distances[$y * $source.Width + $x] = [Math]::Sqrt($dr * $dr + $dg * $dg + $db * $db)
            }
        }

        # Flood only from the outside edge. This removes the sheet matte while
        # retaining dark details enclosed by the actual object.
        for ($x = 0; $x -lt $source.Width; $x++) {
            foreach ($y in @(0, $lastY)) {
                $index = $y * $source.Width + $x
                if ($distances[$index] -le 82 -and -not $queued[$index]) { $queued[$index] = $true; $queue.Enqueue($index) }
            }
        }
        for ($y = 1; $y -lt $lastY; $y++) {
            foreach ($x in @(0, $lastX)) {
                $index = $y * $source.Width + $x
                if ($distances[$index] -le 82 -and -not $queued[$index]) { $queued[$index] = $true; $queue.Enqueue($index) }
            }
        }
        while ($queue.Count -gt 0) {
            $index = $queue.Dequeue()
            $backgroundMask[$index] = $true
            $x = $index % $source.Width
            $y = [int][Math]::Floor($index / $source.Width)
            foreach ($neighbor in @(($index - 1), ($index + 1), ($index - $width), ($index + $width))) {
                if ($neighbor -lt 0 -or $neighbor -ge $pixelCount -or $queued[$neighbor]) { continue }
                $nx = $neighbor % $source.Width
                $ny = [int][Math]::Floor($neighbor / $source.Width)
                if ([Math]::Abs($nx - $x) + [Math]::Abs($ny - $y) -ne 1) { continue }
                if ($distances[$neighbor] -le 82) { $queued[$neighbor] = $true; $queue.Enqueue($neighbor) }
            }
        }

        for ($y = 0; $y -lt $source.Height; $y++) {
            for ($x = 0; $x -lt $source.Width; $x++) {
                $index = $y * $source.Width + $x
                $pixel = $source.GetPixel($x, $y)
                if ($backgroundMask[$index]) {
                    $matteAlpha = 0
                } else {
                    $touchesBackground = $false
                    foreach ($neighbor in @(($index - 1), ($index + 1), ($index - $width), ($index + $width))) {
                        if ($neighbor -ge 0 -and $neighbor -lt $pixelCount -and $backgroundMask[$neighbor]) { $touchesBackground = $true; break }
                    }
                    if ($touchesBackground -and $distances[$index] -lt 112) {
                        $t = [Math]::Max(0, [Math]::Min(1, ($distances[$index] - 70) / 42))
                        $matteAlpha = [int][Math]::Round(255 * $t * $t * (3 - 2 * $t))
                    } else {
                        $matteAlpha = 255
                    }
                }

                $alpha = [int][Math]::Round($pixel.A * $matteAlpha / 255)
                if ($alpha -lt 5) { $alpha = 0 }
                $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))

                if ($alpha -ge 12) {
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }

        if ($maxX -lt 0) {
            Write-Warning "Tidak ada objek yang terdeteksi: $Path"
            $result.Dispose()
            return
        }

        $padding = 2
        $minX = [Math]::Max(0, $minX - $padding)
        $minY = [Math]::Max(0, $minY - $padding)
        $maxX = [Math]::Min($result.Width - 1, $maxX + $padding)
        $maxY = [Math]::Min($result.Height - 1, $maxY + $padding)
        $rect = [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
        $cropped = $result.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $result.Dispose()

        $temporary = "$Path.cleaning.png"
        $cropped.Save($temporary, [System.Drawing.Imaging.ImageFormat]::Png)
        $cropped.Dispose()
        Remove-Item -LiteralPath $Path -Force
        Move-Item -LiteralPath $temporary -Destination $Path
        Write-Host "CLEANED $Path -> $($rect.Width)x$($rect.Height) bg=$($background.R),$($background.G),$($background.B)"
    } finally {
        $source.Dispose()
    }
}

foreach ($folder in $Folders) {
    Get-ChildItem -LiteralPath $folder -File -Filter "*.png" |
        Where-Object { $_.Name -notlike "*.cleaning.png" } | ForEach-Object {
        Remove-AssetMatte $_.FullName
    }
}
