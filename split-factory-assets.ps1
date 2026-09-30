param([string]$Source = 'C:\Users\user\Downloads\ChatGPT Image Sep 8, 2026, 11_08_05 AM.png')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$destination = Join-Path $PSScriptRoot 'assets\level4\extracted'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
# Only items 3-33. Exterior backgrounds 1-2 intentionally excluded.
# Item 5 repeats the pipe label on the source; give the waste pile a unique name.
$entries = @(
 @('pollution_smokestack',14,465,128,125),
 @('pollution_waste_pipe',157,467,140,123),
 @('pollution_waste_pile',312,467,158,123),
 @('factory_filter_machine',494,468,169,122),
 @('filter_component_a',677,468,106,122),
 @('filter_component_b',797,468,101,122),
 @('filter_component_c',913,468,109,122),
 @('waste_valve_closed',1042,468,122,122),
 @('waste_valve_open',1179,468,121,122),
 @('industrial_waste_container',14,686,166,102),
 @('industrial_waste_barrel',194,683,128,105),
 @('industrial_waste_box',337,685,132,103),
 @('factory_scrap_metal',496,686,127,102),
 @('factory_pipe_scrap',637,687,150,101),
 @('factory_oil_container',802,686,148,102),
 @('factory_plastic_waste',966,686,153,102),
 @('factory_waste_bundle',1134,686,165,102),
 @('fx_factory_smoke',14,880,114,107),
 @('fx_factory_smoke_clean',143,880,114,107),
 @('fx_waste_water',272,880,126,107),
 @('fx_clean_water_flow',414,880,136,107),
 @('factory_machine_large',577,880,126,107),
 @('factory_pipe_large',719,882,125,105),
 @('factory_warning_sign',860,882,125,105),
 @('factory_crate',1002,884,122,103),
 @('factory_conveyor',1140,884,160,103),
 @('factory_green_area',14,1075,181,108),
 @('factory_clean_marker',212,1075,195,108),
 @('mc_check_machine',435,1074,153,109),
 @('mc_fix_machine',603,1075,159,108),
 @('mc_move_waste',778,1075,184,108)
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
# Level 4 factory assets

31 PNG crops from source items 3-33, at their original resolution.
Exterior backgrounds 1-2 are deliberately excluded: the intended level takes place inside a factory.
Headings, filenames and panel borders are excluded. Dark object backgrounds remain opaque.
These are static illustrations, including the three character poses, not animation sprite sheets.
Item 5 has a duplicate pipe label in the source; its crop is named pollution_waste_pile.png.
No gameplay or background references were changed. manifest.json records all crop coordinates.
'@ | Set-Content -LiteralPath (Join-Path $destination 'README.md') -Encoding UTF8
$preview = [System.Drawing.Bitmap]::new(1000,1400)
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
Compress-Archive -Path (Join-Path $destination '*') -DestinationPath (Join-Path $PSScriptRoot 'assets\level4\factory-assets.zip') -Force
Write-Output "Extracted $($manifest.Count) assets. Exterior backgrounds excluded."
