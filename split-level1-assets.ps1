param(
    [string]$DownloadsPath = "$env:USERPROFILE\Downloads",
    [string]$OutputPath = "$PSScriptRoot\assets\level1\new"
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not ('SpriteSheetCutter' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing.dll -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class SpriteSheetCutter
{
    private static bool IsBackground(Color c)
    {
        int min = Math.Min(c.R, Math.Min(c.G, c.B));
        int max = Math.Max(c.R, Math.Max(c.G, c.B));
        return c.A > 0 && min >= 238 && max - min <= 22;
    }

    public static void Cut(string sourcePath, string outputPath, Rectangle sourceRect, int padding)
    {
        using (var source = new Bitmap(sourcePath))
        using (var crop = new Bitmap(sourceRect.Width, sourceRect.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(crop))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.DrawImage(source, new Rectangle(0, 0, crop.Width, crop.Height), sourceRect, GraphicsUnit.Pixel);
            }

            var visited = new bool[crop.Width * crop.Height];
            var queue = new Queue<Point>();
            Action<int, int> enqueue = (x, y) => {
                if (x < 0 || y < 0 || x >= crop.Width || y >= crop.Height) return;
                int index = y * crop.Width + x;
                if (visited[index] || !IsBackground(crop.GetPixel(x, y))) return;
                visited[index] = true;
                queue.Enqueue(new Point(x, y));
            };

            for (int x = 0; x < crop.Width; x++) { enqueue(x, 0); enqueue(x, crop.Height - 1); }
            for (int y = 0; y < crop.Height; y++) { enqueue(0, y); enqueue(crop.Width - 1, y); }

            while (queue.Count > 0)
            {
                Point point = queue.Dequeue();
                Color pixel = crop.GetPixel(point.X, point.Y);
                int whiteness = Math.Min(pixel.R, Math.Min(pixel.G, pixel.B));
                int alpha = whiteness >= 250 ? 0 : Math.Max(0, Math.Min(255, (250 - whiteness) * 21));
                crop.SetPixel(point.X, point.Y, Color.FromArgb(alpha, pixel.R, pixel.G, pixel.B));
                enqueue(point.X - 1, point.Y); enqueue(point.X + 1, point.Y);
                enqueue(point.X, point.Y - 1); enqueue(point.X, point.Y + 1);
            }

            int left = crop.Width, top = crop.Height, right = -1, bottom = -1;
            for (int y = 0; y < crop.Height; y++)
            for (int x = 0; x < crop.Width; x++)
            {
                if (crop.GetPixel(x, y).A <= 8) continue;
                left = Math.Min(left, x); top = Math.Min(top, y);
                right = Math.Max(right, x); bottom = Math.Max(bottom, y);
            }
            if (right < left || bottom < top) throw new InvalidOperationException("No visible sprite in " + sourceRect);

            int width = right - left + 1;
            int height = bottom - top + 1;
            using (var result = new Bitmap(width + padding * 2, height + padding * 2, PixelFormat.Format32bppArgb))
            using (var graphics = Graphics.FromImage(result))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.DrawImage(crop, new Rectangle(padding, padding, width, height), new Rectangle(left, top, width, height), GraphicsUnit.Pixel);
                Directory.CreateDirectory(Path.GetDirectoryName(outputPath));
                result.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
'@
}

function Export-Row {
    param(
        [string]$Source,
        [int]$Top,
        [int]$Bottom,
        [string[]]$Names,
        [string]$Folder,
        [int[]]$Boundaries
    )
    $bitmap = [System.Drawing.Bitmap]::new($Source)
    try {
        if (-not $Boundaries) {
            $Boundaries = 0..$Names.Count | ForEach-Object { [int][Math]::Round($_ * $bitmap.Width / $Names.Count) }
        }
        if ($Boundaries.Count -ne $Names.Count + 1) { throw 'Boundaries must contain one more entry than Names.' }
        for ($i = 0; $i -lt $Names.Count; $i++) {
            $left = $Boundaries[$i]
            $right = $Boundaries[$i + 1]
            $rect = [System.Drawing.Rectangle]::new($left, $Top, $right - $left, $Bottom - $Top)
            $destination = Join-Path (Join-Path $OutputPath $Folder) ($Names[$i] + '.png')
            [SpriteSheetCutter]::Cut($Source, $destination, $rect, 8)
            Write-Host "Created $destination"
        }
    } finally {
        $bitmap.Dispose()
    }
}

$trashSheet = Join-Path $DownloadsPath 'Motion Graphic Element Breakdown (1).png'
$binSheet = Join-Path $DownloadsPath 'Motion Graphic Element Breakdown (2).png'
$repairSheet = Join-Path $DownloadsPath 'Motion Graphic Element Breakdown (3).png'
$keySheet = Join-Path $DownloadsPath 'Motion Graphic Element Breakdown (4).png'

foreach ($path in @($trashSheet, $binSheet, $repairSheet, $keySheet)) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Source asset not found: $path" }
}

Export-Row -Source $trashSheet -Top 0 -Bottom 194 -Folder 'trash\organic' -Names @('apple-core','banana-peel','leaf-pile','rotten-fruit','branch') -Boundaries @(0,165,348,538,743,941)
Export-Row -Source $trashSheet -Top 194 -Bottom 438 -Folder 'trash\inorganic' -Names @('plastic-bottle','red-can','plastic-bag','snack-wrapper','glass-bottle','tin-can','foam-box') -Boundaries @(0,140,270,420,560,677,790,941)
Export-Row -Source $trashSheet -Top 438 -Bottom 633 -Folder 'trash\paper' -Names @('crumpled-paper','newspaper','cardboard','drink-carton','brown-paper','paper-stack') -Boundaries @(0,125,333,478,609,768,941)
Export-Row -Source $binSheet -Top 0 -Bottom 380 -Folder 'bins' -Names @('organic','inorganic','paper')
Export-Row -Source $repairSheet -Top 0 -Bottom 233 -Folder 'repair' -Names @('debris','tools','sparkles')

$keyBitmap = [System.Drawing.Bitmap]::new($keySheet)
try {
    $keyRect = [System.Drawing.Rectangle]::new(0, 0, $keyBitmap.Width, $keyBitmap.Height)
    [SpriteSheetCutter]::Cut($keySheet, (Join-Path $OutputPath 'ui\interact-e.png'), $keyRect, 4)
    Write-Host "Created $(Join-Path $OutputPath 'ui\interact-e.png')"
} finally {
    $keyBitmap.Dispose()
}
