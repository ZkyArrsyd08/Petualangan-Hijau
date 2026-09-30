param([string]$Source = 'C:\Users\user\Downloads\ChatGPT Image Sep 8, 2026, 11_04_27 AM.png')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$destination = Join-Path $PSScriptRoot 'assets\level5\extracted'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$entries = @(
 @('bg_kota_kotor',9,111,643,270),@('bg_kota_bersih',663,112,640,269),
 @('city_trash_plastic',16,471,96,86),@('city_trash_bottle',127,474,104,83),@('city_trash_food_wrapper',243,480,110,77),@('city_trash_can',367,475,101,82),@('city_trash_paper',482,475,102,82),
 @('city_drain_blocked',610,465,124,92),@('drain_plastic',748,474,87,83),@('drain_bottle',850,475,85,82),@('drain_leaves',950,475,92,82),@('drain_mud',1056,475,94,82),@('drain_debris_bundle',1170,465,125,92),
 @('city_car_smoke',17,644,153,102),@('city_burning_trash',182,644,115,102),@('city_dirty_machine',311,644,113,102),@('city_pollution_marker',441,644,158,102),
 @('city_dead_tree',626,646,109,100),@('city_empty_park',750,651,161,95),@('city_planting_spot',928,657,111,89),@('city_tree_seedling',1054,648,114,98),@('city_tree_restored',1181,641,115,105),
 @('city_building_small',17,837,124,90),@('city_car',153,839,121,88),@('city_bus',286,832,148,95),@('city_street_light',450,835,106,92),@('city_bench',571,838,139,89),@('city_billboard',727,823,163,104),@('city_traffic_sign',906,839,116,88),@('city_recycling_bins',1046,815,250,112),
 @('fx_city_clean_transition',17,1019,103,118),@('fx_clean_air',132,1024,144,113),@('fx_green_growth',291,1022,119,115),@('fx_water_restore',428,1023,119,114),
 @('city_bird',572,1033,104,104),@('city_people_happy',692,1016,104,121),@('city_children_playing',813,1027,108,110),
 @('mc_clean_city',949,1026,102,111),@('mc_fix_drain',1064,1031,105,106),@('mc_plant_city_tree',1188,1028,110,109)
)
$sheet = [System.Drawing.Bitmap]::FromFile($Source)
$manifest = @()
try {
 foreach ($entry in $entries) {
  $filename = $entry[0] + '.png'
  $rect = [System.Drawing.Rectangle]::new($entry[1],$entry[2],$entry[3],$entry[4])
  $crop = $sheet.Clone($rect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try { $crop.Save((Join-Path $destination $filename),[System.Drawing.Imaging.ImageFormat]::Png) } finally { $crop.Dispose() }
  $manifest += [pscustomobject]@{file=$filename;x=$entry[1];y=$entry[2];width=$entry[3];height=$entry[4];transparent=$false}
 }
} finally { $sheet.Dispose() }
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'manifest.json') -Encoding UTF8
@'
# Level 5 city assets
40 crops including the unnumbered recycling bins. Original resolution; dark backgrounds remain opaque. Two city backgrounds included. Manifest records crop coordinates.
'@ | Set-Content -LiteralPath (Join-Path $destination 'README.md') -Encoding UTF8
$preview = [System.Drawing.Bitmap]::new(1000,1600)
$graphics = [System.Drawing.Graphics]::FromImage($preview)
$font = [System.Drawing.Font]::new('Arial',9)
try {
 $graphics.Clear([System.Drawing.Color]::FromArgb(42,47,44))
 for ($i=0; $i -lt $manifest.Count; $i++) {
  $item=$manifest[$i];$asset=[System.Drawing.Image]::FromFile((Join-Path $destination $item.file))
  try {
   $x=($i%5)*200;$y=[math]::Floor($i/5)*200
   $scale=[math]::Min(184.0/$asset.Width,155.0/$asset.Height)
   $w=[int]($asset.Width*$scale);$h=[int]($asset.Height*$scale)
   $graphics.DrawImage($asset,[int]($x+(200-$w)/2),[int]($y+8+(155-$h)/2),$w,$h)
   $graphics.DrawString(($item.file -replace '_',' '),$font,[System.Drawing.Brushes]::White,[System.Drawing.RectangleF]::new([single]($x+7),[single]($y+167),188,32))
  } finally { $asset.Dispose() }
 }
 $preview.Save((Join-Path $destination 'preview.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
} finally { $font.Dispose();$graphics.Dispose();$preview.Dispose() }
Compress-Archive -Path (Join-Path $destination '*') -DestinationPath (Join-Path $PSScriptRoot 'assets\level5\city-assets.zip') -Force
Write-Output "Extracted $($manifest.Count) assets. City backgrounds included."
