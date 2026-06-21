# Extract every frame of a character's 8-directional animation GIFs into PNG frames
# (alpha preserved), plus an _index.json describing anim -> dir -> frameCount.
# Usage: powershell -ExecutionPolicy Bypass -File tools/extract-gif-frames.ps1 -Src "<charFolder>" -Out "<tempOut>"
param(
  [string]$Src = "C:\Users\herra\Desktop\denemeler",
  [string]$Out = "$env:TEMP\emi_frames\efe"
)
Add-Type -AssemblyName System.Drawing

# folder name -> engine anim key
$map = [ordered]@{
  'BreathingIdle'   = 'idle'
  'Walking'         = 'walk'
  'Running'         = 'run'
  'Throwing'        = 'throw'
  'Dash'            = 'dash'
  'Hurt'            = 'hurt'
  'CarryingIdle'    = 'carryIdle'
  'CarryingWalking' = 'carryWalk'
  'Defeat'          = 'lose'
  'Win'             = 'win'
}
# longest-first so 'northeast' matches before 'north'
$dirs = @('northeast','northwest','southeast','southwest','north','south','east','west')

if (Test-Path $Out) { Remove-Item $Out -Recurse -Force }
New-Item -ItemType Directory -Force $Out | Out-Null
$index = [ordered]@{}

foreach ($folder in $map.Keys) {
  $anim = $map[$folder]
  $fpath = Join-Path $Src $folder
  if (-not (Test-Path $fpath)) { continue }
  $index[$anim] = [ordered]@{}
  Get-ChildItem $fpath -Filter *.gif | ForEach-Object {
    $name = $_.BaseName.ToLower()
    $dir = $dirs | Where-Object { $name.EndsWith("_$_") } | Select-Object -First 1
    if (-not $dir) { $dir = 'south' }   # singles: defeat_sad, win_arm_up
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $fd  = New-Object System.Drawing.Imaging.FrameDimension $img.FrameDimensionsList[0]
    $n   = $img.GetFrameCount($fd); $w = $img.Width; $h = $img.Height
    for ($i = 0; $i -lt $n; $i++) {
      $img.SelectActiveFrame($fd, $i) | Out-Null
      $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.Clear([System.Drawing.Color]::Transparent)
      $g.DrawImage($img, 0, 0, $w, $h)
      $bmp.Save((Join-Path $Out ("{0}__{1}__{2}.png" -f $anim, $dir, $i)), [System.Drawing.Imaging.ImageFormat]::Png)
      $g.Dispose(); $bmp.Dispose()
    }
    $index[$anim][$dir] = $n
    $img.Dispose()
  }
}
$index | ConvertTo-Json -Depth 5 | Out-File (Join-Path $Out '_index.json') -Encoding utf8
Write-Output ("extracted frames for {0} anims -> {1}" -f $index.Count, $Out)
