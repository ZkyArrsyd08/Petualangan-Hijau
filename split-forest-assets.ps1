param([string]$Source = 'C:\Users\user\Downloads\ChatGPT Image Sep 8, 2026, 11_05_53 AM.png')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$destination = Join-Path $PSScriptRoot 'assets\level3\extracted'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
# Coordinates exclude the contact sheet's headings, filenames and panel borders.
$entries = @(
  @('damage_tree_stump',14,462,143,123),
  @('damage_dead_tree',171,460,139,125),
  @('damage_bare_ground',322,468,155,117),
  @('damage_destroyed_habitat',490,468,155,117),
  @('forest_branch_large',669,476,116,109),
  @('forest_branch_small',800,480,113,105),
  @('forest_trash_plastic',927,480,114,105),
  @('forest_rock_debris',1054,480,114,105),
  @('forest_debris_bundle',1181,480,119,105),
  @('planting_spot',15,679,117,99),
  @('tree_seedling',145,676,118,102),
  @('tree_growth_stage1',278,662,119,116),
  @('tree_growth_stage2',410,662,135,116),
  @('tree_restored_small',561,658,151,120),
  @('forest_grass_patch',735,674,136,104),
  @('forest_flower_small',883,674,129,104),
  @('forest_bush_green',1024,674,134,104),
  @('forest_moss_patch',1174,674,125,104),
  @('forest_bird',17,852,116,121),
  @('forest_butterfly',148,856,123,117),
  @('forest_deer_small',284,848,155,125),
  @('fx_plant_growth',465,851,146,123),
  @('fx_leaf_particle',626,851,143,123),
  @('fx_forest_light',785,850,146,124),
  @('forest_planting_area',958,845,341,139),
  @('mc_check_tree',18,1043,155,126),
  @('mc_clean_forest',189,1043,159,126),
  @('mc_plant_tree',362,1043,158,126)
)
$sheet = [System.Drawing.Bitmap]::FromFile($Source)
$manifest = @()
try {
  foreach ($entry in $entries) {
    $filename = $entry[0] + '.png'
    $rectangle = New-Object System.Drawing.Rectangle($entry[1],$entry[2],$entry[3],$entry[4])
    $crop = $sheet.Clone($rectangle, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try { $crop.Save((Join-Path $destination $filename),[System.Drawing.Imaging.ImageFormat]::Png) } finally { $crop.Dispose() }
    $manifest += [pscustomobject]@{file=$filename;x=$entry[1];y=$entry[2];width=$entry[3];height=$entry[4];transparent=$false}
  }
} finally { $sheet.Dispose() }
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'manifest.json') -Encoding UTF8
@'
# Aset Level 3 — Hutan

30 PNG dipotong langsung dari lembar aset sumber, tanpa menggambar ulang atau memperbesar gambar.
Judul, nama file, dan bingkai panel dikeluarkan dari area crop.

Background objek masih gelap (bukan transparan). Resolusi mengikuti gambar sumber;
dua background berukuran 644 × 360. Aset kecil belum berupa sprite animasi.
Efek cahaya masih menyatu dengan background gelap pada sumber.

manifest.json mencatat koordinat dan ukuran setiap potongan.
File ini belum dihubungkan ke gameplay Level 3.
'@ | Set-Content -LiteralPath (Join-Path $destination 'README.md') -Encoding UTF8
# Contact sheet for reviewing all extracted files, with neutral spacing.
$preview = New-Object System.Drawing.Bitmap(1000,1200)
$graphics = [System.Drawing.Graphics]::FromImage($preview)
$font = New-Object System.Drawing.Font('Arial',9)
try {
  $graphics.Clear([System.Drawing.Color]::FromArgb(42,47,44))
  for ($i=0; $i -lt $manifest.Count; $i++) {
    $item = $manifest[$i]
    $asset = [System.Drawing.Image]::FromFile((Join-Path $destination $item.file))
    try {
      $x = ($i % 5)*200
      $y = [math]::Floor($i/5)*200
      $scale = [math]::Min(184.0/$asset.Width,155.0/$asset.Height)
      $w = [int]($asset.Width*$scale); $h = [int]($asset.Height*$scale)
      $graphics.DrawImage($asset,[int]($x+(200-$w)/2),[int]($y+8+(155-$h)/2),$w,$h)
      $labelRect = [System.Drawing.RectangleF]::new([single]($x+7),[single]($y+167),188,32)
      $graphics.DrawString(($item.file -replace '_', ' '),$font,[System.Drawing.Brushes]::White,$labelRect)
    } finally { $asset.Dispose() }
  }
  $preview.Save((Join-Path $destination 'preview.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
} finally { $font.Dispose(); $graphics.Dispose(); $preview.Dispose() }
Compress-Archive -Path (Join-Path $destination '*') -DestinationPath (Join-Path $PSScriptRoot 'assets\level3\forest-assets.zip') -Force
Write-Output "Extracted $($manifest.Count) PNG assets to $destination"
