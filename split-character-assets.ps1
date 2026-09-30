param(
  [string]$SourceDirectory = 'C:\Users\user\Downloads\Character',
  [string]$OutputDirectory = (Join-Path $PSScriptRoot 'assets\player')
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.dll -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class CharacterSpriteSplitter {
    private static bool IsConnectedBackground(Color color) {
        if (color.A == 0) return true;
        int min = Math.Min(color.R, Math.Min(color.G, color.B));
        int max = Math.Max(color.R, Math.Max(color.G, color.B));
        return min >= 238 || (min >= 218 && max - min <= 18);
    }

    private static void RemoveConnectedBackground(Bitmap bitmap) {
        int width = bitmap.Width;
        int height = bitmap.Height;
        bool[] clear = new bool[width * height];
        Queue<int> queue = new Queue<int>();
        Action<int,int> enqueue = (x, y) => {
            if (x < 0 || y < 0 || x >= width || y >= height) return;
            int index = y * width + x;
            if (clear[index] || !IsConnectedBackground(bitmap.GetPixel(x, y))) return;
            clear[index] = true;
            queue.Enqueue(index);
        };

        for (int x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
        for (int y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }
        while (queue.Count > 0) {
            int index = queue.Dequeue();
            int x = index % width;
            int y = index / width;
            enqueue(x - 1, y); enqueue(x + 1, y); enqueue(x, y - 1); enqueue(x, y + 1);
        }

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (clear[y * width + x]) bitmap.SetPixel(x, y, Color.Transparent);
            }
        }
    }

    public static void Split(string sourcePath, string outputDirectory, string direction) {
        const int frameCount = 8;
        const int canvasWidth = 135;
        const int canvasHeight = 254;
        Directory.CreateDirectory(outputDirectory);
        using (Bitmap source = new Bitmap(sourcePath)) {
            for (int index = 0; index < frameCount; index++) {
                int sourceX = index * source.Width / frameCount;
                int nextX = (index + 1) * source.Width / frameCount;
                int sourceWidth = nextX - sourceX;
                using (Bitmap frame = new Bitmap(canvasWidth, canvasHeight, PixelFormat.Format32bppArgb)) {
                    using (Graphics graphics = Graphics.FromImage(frame)) {
                        graphics.Clear(Color.Transparent);
                        graphics.CompositingMode = CompositingMode.SourceCopy;
                        graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
                        int targetX = (canvasWidth - sourceWidth) / 2;
                        int targetY = canvasHeight - source.Height;
                        graphics.DrawImage(source,
                            new Rectangle(targetX, targetY, sourceWidth, source.Height),
                            new Rectangle(sourceX, 0, sourceWidth, source.Height),
                            GraphicsUnit.Pixel);
                    }
                    RemoveConnectedBackground(frame);
                    string outputPath = Path.Combine(outputDirectory, String.Format("frame-{0:00}.png", index + 1));
                    frame.Save(outputPath, ImageFormat.Png);
                }
            }
        }
    }
}
"@

$sets = [ordered]@{
  right = 'karakter ke kanan.png'
  left  = 'karakter ke kiri.png'
  up    = 'karakter ke atas.png'
  down  = 'Karakter ke bawah.png'
}

foreach ($entry in $sets.GetEnumerator()) {
  $source = Join-Path $SourceDirectory $entry.Value
  if (-not (Test-Path -LiteralPath $source)) { throw "Sprite sheet tidak ditemukan: $source" }
  $target = Join-Path $OutputDirectory $entry.Key
  [CharacterSpriteSplitter]::Split($source, $target, $entry.Key)
}

$frames = Get-ChildItem -LiteralPath $OutputDirectory -Recurse -Filter 'frame-*.png'
if ($frames.Count -ne 32) { throw "Jumlah frame hasil tidak sesuai: $($frames.Count)" }
Write-Output "Berhasil membuat $($frames.Count) frame di $OutputDirectory"
