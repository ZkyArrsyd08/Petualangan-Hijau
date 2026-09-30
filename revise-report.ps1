param(
  [Parameter(Mandatory=$true)][string]$Source,
  [Parameter(Mandatory=$true)][string]$Output
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
Copy-Item -LiteralPath $Source -Destination $Output -Force

$replacements = [ordered]@{
  'Rahmadina jogi siregar (1024012339)' = 'Rahmadina Jogi Siregar (1024012339)'
  'Game edukasi Petualangan Hijau hadir sebagai media pembelajaran interaktif yang menggabungkan unsur hiburan dan edukasi. Pemain diajak menjelajahi berbagai wilayah yang mengalami permasalahan lingkungan dan menyelesaikan berbagai tantangan, seperti memilah sampah, membersihkan sungai, menanam pohon, menyelamatkan satwa, serta mengurangi sumber polusi. Setiap level memberikan materi edukasi yang berbeda mengenai pengelolaan sampah, pencemaran air, reboisasi, polusi udara, dan pelestarian lingkungan.' = 'Game edukasi Petualangan Hijau hadir sebagai media pembelajaran interaktif berbasis web yang menggabungkan petualangan dan edukasi. Pemain menjelajahi lima wilayah: taman, sungai, hutan, pabrik, dan kota. Tantangannya meliputi memilah sampah, memperbaiki fasilitas taman, membersihkan sungai, membuka sumbatan, melakukan reboisasi, mengendalikan sumber pencemaran pabrik, serta memulihkan lingkungan kota.'
  'Softwere:' = 'Software dan Teknologi:'
  'Game Petualangan Hijau ini dibuat menggunakan Roblox Studio.' = 'Game Petualangan Hijau dibuat sebagai gim web menggunakan HTML, CSS, dan JavaScript. Gim dijalankan melalui browser dan menggunakan Local Storage untuk menyimpan progres pemain, level yang terbuka, serta checkpoint terakhir.'
  'Dalam game ini, pemain diajak menjadi “Pahlawan Hijau, Selamatkan Alam” yang bertugas memulihkan lingkungan dari berbagai ancaman pencemaran. Setiap level menggambarkan wilayah dengan permasalahan lingkungan yang berbeda, mulai dari desa yang dipenuhi sampah, sungai yang tercemar, hutan yang rusak, hingga kota yang mengalami polusi udara. Pemain harus menyelesaikan berbagai misi edukatif seperti mengambil dan memilah sampah, membersihkan sungai, menanam pohon, serta mengurangi sumber polusi.' = 'Dalam gim ini, pemain menjadi seorang anak yang memulai perubahan dari tindakan sederhana. Setiap level menampilkan masalah lingkungan yang berbeda: taman kotor dan fasilitas rusak, sungai tercemar, hutan kehilangan vegetasi, pabrik dengan sistem pengendalian pencemaran yang bermasalah, serta kota yang menghadapi gabungan seluruh masalah tersebut.'
  'Design Pilalrs:  ' = 'Design Pillars:'
  'Setiap level memiliki satu permasalahan lingkungan utama yang menjadi fokus pemain, seperti memilah sampah, membersihkan sungai, melakukan reboisasi, atau mengurangi polusi udara.' = 'Setiap level memiliki masalah dan mekanik utama yang berbeda. Level taman berfokus pada pemilahan sampah dan perbaikan fasilitas; level sungai pada pembersihan tepi, mini-game jaring, dan sumbatan; level hutan pada identifikasi, pembersihan area, dan penanaman; level pabrik pada pengendalian tiga sistem; sedangkan level kota menggabungkan seluruh pembelajaran sebelumnya.'
  'Setiap tindakan positif yang dilakukan pemain mendapatkan apresiasi berupa item, serta perubahan visual pada lingkungan. Lingkungan yang awalnya kotor dan rusak secara bertahap menjadi lebih bersih, hijau, dan hidup. Pesan edukatif singkat juga diberikan setelah pemain menyelesaikan aktivitas sebagai bentuk penghargaan sekaligus penguatan terhadap pengetahuan lingkungan.' = 'Setiap tindakan yang benar memberikan umpan balik visual dan suara, menambah progres objective, serta mengubah kondisi lingkungan. Setelah level selesai, pemain menerima dialog penutup dan pesan edukatif yang menguatkan hubungan antara tindakan kecil dan dampaknya terhadap lingkungan.'
  'Materi edukasi disampaikan melalui aktivitas yang dilakukan secara langsung oleh pemain. Pemain dapat belajar memilah sampah, memahami pencemaran air melalui kegiatan membersihkan sungai, serta mengenal reboisasi dengan menanam pohon.' = 'Materi edukasi disampaikan melalui aksi langsung. Pemain belajar memilah sampah, memahami dampak sampah terhadap aliran air, mengenal proses pemulihan vegetasi, serta mengetahui tindakan sederhana untuk mengurangi polusi dan mengelola limbah.'
  'Game menggabungkan eksplorasi, interaksi dengan NPC, misi, puzzle, dan kuis edukatif dalam gameplay yang sederhana. Perpaduan tersebut membuat pemain dapat memperoleh pengetahuan tentang lingkungan melalui pengalaman bermain yang menarik dan tidak terasa seperti pembelajaran formal.' = 'Gim menggabungkan eksplorasi, interaksi berbasis tombol, mini-game drag-and-drop, tantangan ketepatan, dan objective bertahap dengan batas waktu. Mekanik yang berbeda pada setiap wilayah membuat pembelajaran terasa seperti bagian alami dari petualangan.'
  'Di sebuah desa yang dulunya hijau dan asri, lingkungan mulai mengalami kerusakan akibat berbagai masalah pencemaran. Sampah menumpuk, sungai tercemar, hutan rusak, dan polusi udara mulai mengganggu kehidupan masyarakat serta ekosistem di sekitarnya. Dalam kondisi tersebut, pemain berperan sebagai seorang anak yang peduli terhadap lingkungan dan memiliki tugas untuk membantu memulihkan alam.' = 'Cerita mengikuti seorang anak yang melihat kerusakan lingkungan menyebar dari taman hingga pusat kota. Sampah menumpuk, sungai tersumbat, vegetasi hutan berkurang, dan kegiatan industri menimbulkan pencemaran. Pemain kemudian memulai perjalanan untuk memulihkan setiap wilayah secara bertahap.'
  'Pemain akan menjelajahi berbagai wilayah yang mengalami permasalahan lingkungan dan menyelesaikan misi edukatif, seperti mengambil dan memilah sampah, membersihkan sungai, menanam pohon, menyelamatkan satwa, serta mengurangi sumber polusi. Setiap misi memberikan pengetahuan mengenai pentingnya menjaga lingkungan sekaligus memberikan dampak nyata terhadap kondisi dunia dalam game.' = 'Genre gim adalah petualangan edukatif dengan puzzle ringan dan mini-game. Pemain bergerak menggunakan WASD atau tombol arah, berinteraksi dengan E, memilih atau menyeret objek pada mini-game, serta menyelesaikan objective sebelum timer habis. Setiap level membuka level berikutnya dan berakhir dengan perubahan visual lingkungan.'
  'Visual Cerah & Ramah Lingkungan.' = 'Visual ilustratif dengan perubahan kondisi lingkungan kotor menjadi lebih bersih.'
  'Musik & Efek Suara Edukatif ' = 'Musik latar, suara langkah, efek berhasil, dan efek gagal.'
  'Efek Kemenangan Tiap Level' = 'Dialog pembuka dan penutup serta efek kemenangan pada setiap level.'
  'Penunjuk Kemajuan Lingkungan' = 'HUD objective, timer, progress level, pause, restart level, save, dan autosave.'
  'Game “Petualangan Hijau” dirancang dengan antarmuka yang sederhana, interaktif, dan mudah digunakan. Pemain dapat menggerakkan karakter, berinteraksi dengan NPC, mengambil sampah dan item, serta menyelesaikan berbagai misi melalui kontrol yang mudah dipahami. Informasi seperti misi, poin, item, dan progress level ditampilkan melalui elemen UI yang jelas.' = 'Gim Petualangan Hijau menggunakan antarmuka yang sederhana dan mudah dipahami. Pemain menggerakkan karakter dengan WASD atau tombol arah dan berinteraksi menggunakan tombol E. HUD menampilkan objective, jumlah progres, timer, status mini-game, dan tombol pause. Kontrol sentuh juga tersedia untuk layar berukuran kecil.'
  'Navigasi antar level dilakukan setelah pemain menyelesaikan misi utama di setiap wilayah. Setiap misi yang berhasil diselesaikan akan memberikan reward berupa item perlengkapan, sekaligus mengubah kondisi lingkungan menjadi lebih bersih dan hijau. Perubahan tersebut menjadi indikator visual atas kemajuan pemain dalam memulihkan alam.' = 'Navigasi level dilakukan melalui peta perjalanan. Level berikutnya terbuka setelah level sebelumnya selesai. Progres tersimpan otomatis di Local Storage dan dapat dilanjutkan melalui tombol Load. Menu pause menyediakan opsi melanjutkan permainan, restart level, pengaturan, memilih level, dan kembali ke menu utama.'
  'Sendative : BackSound awal yang menyenangkan' = 'Musik menu dan prolog: bernuansa hangat serta optimistis.'
  'Horror dark majesty : BackSound Konflik' = 'Musik level konflik: bernuansa lebih gelap untuk menggambarkan kerusakan lingkungan.'
  'Platform: Roblox.                                                 Audience: Age 10+/Gender All' = 'Platform: Web Browser (Desktop dan perangkat layar sentuh).        Audience: Usia 10+ / Semua gender.'
}

$artStyle = 'Gaya visual menggunakan ilustrasi digital dua dimensi dengan sudut pandang atas/isometrik, warna kusam untuk kondisi tercemar, serta warna lebih cerah dan hijau setelah lingkungan dipulihkan. Karakter dan objek interaksi memakai sprite PNG agar mudah dikenali di atas background.'
$storyboard = @(
  'Alur umum: Main Menu -> Prolog -> Peta Perjalanan -> Level 1 sampai Level 5 -> Epilog -> kembali ke Main Menu.',
  'Level 1 - Taman (04:00): pilah 10 sampah ke tempat Organik, Kertas, dan Anorganik, lalu perbaiki tiga fasilitas taman.',
  'Level 2 - Sungai (03:30): bersihkan lima sampah tepi sungai, tangkap 10 sampah dengan jaring sambil menghindari ikan dengan tiga HP, lalu bersihkan enam objek penyumbat.',
  'Level 3 - Hutan (03:15): identifikasi empat titik kerusakan, bersihkan empat area tanam, lalu tahan E untuk menanam empat bibit.',
  'Level 4 - Pabrik (03:00): identifikasi dan kendalikan tiga sumber pencemaran melalui mini-game filter, katup limbah, dan pengelolaan limbah.',
  'Level 5 - Kota (03:00): bersihkan lima sampah, pulihkan drainase, kurangi tiga sumber polusi, dan pulihkan tiga ruang hijau.',
  'Ending: tampilkan kondisi taman, sungai, hutan, pabrik, kota, dan dunia setelah dipulihkan, lalu tampilkan pesan akhir dan judul Petualangan Hijau.'
)

$file = [IO.File]::Open($Output,[IO.FileMode]::Open,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
$archive = [IO.Compression.ZipArchive]::new($file,[IO.Compression.ZipArchiveMode]::Update,$false)
try {
  $entry = $archive.GetEntry('word/document.xml')
  $reader = [IO.StreamReader]::new($entry.Open())
  [xml]$xml = $reader.ReadToEnd()
  $reader.Dispose()
  $ns = [Xml.XmlNamespaceManager]::new($xml.NameTable)
  $w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
  $ns.AddNamespace('w',$w)

  function Get-Text($paragraph) { (($paragraph.SelectNodes('.//w:t',$ns) | ForEach-Object { $_.InnerText }) -join '') }
  function Set-Text($paragraph,[string]$text) {
    $texts = @($paragraph.SelectNodes('.//w:t',$ns))
    if($texts.Count -eq 0) {
      $run = $xml.CreateElement('w','r',$w)
      $node = $xml.CreateElement('w','t',$w)
      [void]$run.AppendChild($node); [void]$paragraph.AppendChild($run)
      $texts = @($node)
    }
    $texts[0].InnerText = $text
    for($i=1;$i -lt $texts.Count;$i++){ $texts[$i].InnerText = '' }
  }

  $paragraphs = @($xml.SelectNodes('//w:p',$ns))
  foreach($paragraph in $paragraphs) {
    $text = Get-Text $paragraph
    if($replacements.Contains($text)){ Set-Text $paragraph $replacements[$text] }
    elseif($text -like 'Dalam game ini, pemain diajak menjadi*Pahlawan Hijau*') {
      Set-Text $paragraph 'Dalam gim ini, pemain menjadi seorang anak yang memulai perubahan dari tindakan sederhana. Setiap level menampilkan masalah lingkungan yang berbeda: taman kotor dan fasilitas rusak, sungai tercemar, hutan kehilangan vegetasi, pabrik dengan sistem pengendalian pencemaran yang bermasalah, serta kota yang menghadapi gabungan seluruh masalah tersebut.'
    }
    elseif($text -like 'Game*dirancang dengan antarmuka yang sederhana*') {
      Set-Text $paragraph 'Gim Petualangan Hijau menggunakan antarmuka yang sederhana dan mudah dipahami. Pemain menggerakkan karakter dengan WASD atau tombol arah dan berinteraksi menggunakan tombol E. HUD menampilkan objective, jumlah progres, timer, status mini-game, dan tombol pause. Kontrol sentuh juga tersedia untuk layar berukuran kecil.'
    }
  }

  $bodyParagraphs = @($xml.SelectNodes('//w:body/w:p',$ns))
  for($i=0;$i -lt $bodyParagraphs.Count;$i++) {
    $text = Get-Text $bodyParagraphs[$i]
    if($text -eq 'Art Style:' -or $text -eq 'Art Style:  ') {
      $next = $bodyParagraphs[$i+1]
      if((Get-Text $next).Trim().Length -eq 0){ Set-Text $next $artStyle }
    }
    if($text -eq 'Storyboard:' -or $text -eq 'Storyboard: ') {
      $anchor = $bodyParagraphs[$i+1]
      Set-Text $anchor $storyboard[0]
      $current = $anchor
      for($s=1;$s -lt $storyboard.Count;$s++) {
        $clone = $anchor.CloneNode($true)
        Set-Text $clone $storyboard[$s]
        [void]$current.ParentNode.InsertAfter($clone,$current)
        $current = $clone
      }
    }
  }

  $entry.Delete()
  $newEntry = $archive.CreateEntry('word/document.xml',[IO.Compression.CompressionLevel]::Optimal)
  $writer = [IO.StreamWriter]::new($newEntry.Open(),[Text.UTF8Encoding]::new($false))
  $xml.Save($writer)
  $writer.Dispose()
}
finally { $archive.Dispose(); $file.Dispose() }
