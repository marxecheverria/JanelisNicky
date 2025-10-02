# Script para optimizar imágenes del álbum
# Requisito: Instalar ImageMagick desde https://imagemagick.org/script/download.php

Write-Host "🎨 Optimizador de Imágenes para Álbum Fotográfico" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ImageMagick está instalado
try {
    $magickVersion = magick -version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "ImageMagick no encontrado"
    }
    Write-Host "✅ ImageMagick encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala ImageMagick desde:" -ForegroundColor Yellow
    Write-Host "https://imagemagick.org/script/download.php" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Alternativamente, usa las herramientas online:" -ForegroundColor Yellow
    Write-Host "- https://tinypng.com" -ForegroundColor Cyan
    Write-Host "- https://squoosh.app" -ForegroundColor Cyan
    exit 1
}

# Crear carpeta de respaldo
$backupFolder = "images_original_backup"
if (-not (Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
    Write-Host "📁 Carpeta de respaldo creada: $backupFolder" -ForegroundColor Green
}

# Crear carpeta para imágenes optimizadas
$outputFolder = "images_optimized"
if (-not (Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
    Write-Host "📁 Carpeta de salida creada: $outputFolder" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 Procesando imágenes..." -ForegroundColor Yellow
Write-Host ""

$images = Get-ChildItem -Path "images" -Filter "*.jpg"
$totalImages = $images.Count
$currentImage = 0
$totalSavings = 0

foreach ($image in $images) {
    $currentImage++
    $percent = [math]::Round(($currentImage / $totalImages) * 100)
    
    Write-Host "[$currentImage/$totalImages] Procesando: $($image.Name)" -ForegroundColor Cyan
    
    $inputPath = $image.FullName
    $outputPath = Join-Path $outputFolder $image.Name
    $backupPath = Join-Path $backupFolder $image.Name
    
    # Hacer backup del original
    if (-not (Test-Path $backupPath)) {
        Copy-Item $inputPath $backupPath
    }
    
    # Optimizar imagen
    # Configuración:
    # - Redimensionar a máximo 1920px de ancho (mantiene proporción)
    # - Calidad 85% (excelente calidad, buen tamaño)
    # - Quitar metadatos EXIF (reduce peso)
    # - Progressive JPEG (carga progresiva)
    
    $originalSize = (Get-Item $inputPath).Length
    
    magick convert "$inputPath" `
        -resize "1920x1920>" `
        -quality 85 `
        -strip `
        -interlace Plane `
        "$outputPath" 2>&1 | Out-Null
    
    if (Test-Path $outputPath) {
        $optimizedSize = (Get-Item $outputPath).Length
        $savings = $originalSize - $optimizedSize
        $savingsPercent = [math]::Round(($savings / $originalSize) * 100, 1)
        $totalSavings += $savings
        
        Write-Host "  ✅ Original: $([math]::Round($originalSize/1KB, 1)) KB" -ForegroundColor Gray
        Write-Host "  ✅ Optimizada: $([math]::Round($optimizedSize/1KB, 1)) KB" -ForegroundColor Green
        Write-Host "  💾 Ahorro: $savingsPercent%" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ Error al procesar" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✨ Optimización completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "  - Imágenes procesadas: $totalImages" -ForegroundColor White
Write-Host "  - Espacio ahorrado: $([math]::Round($totalSavings/1MB, 2)) MB" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Las imágenes optimizadas están en: $outputFolder" -ForegroundColor Yellow
Write-Host "💾 Los originales están respaldados en: $backupFolder" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 Próximo paso:" -ForegroundColor Cyan
Write-Host "  1. Revisa las imágenes en 'images_optimized'" -ForegroundColor White
Write-Host "  2. Si te gustan, reemplaza las de 'images/' con estas" -ForegroundColor White
Write-Host "  3. Elimina 'images_optimized' después de reemplazar" -ForegroundColor White
Write-Host ""
Write-Host "✅ ¡Listo para subir a GitHub!" -ForegroundColor Green


