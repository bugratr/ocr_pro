const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Görüntü döndürme endpoint'i
router.post('/rotate', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Görüntü dosyası yüklenmedi' });
    }

    const { angle = 90 } = req.body;
    const outputPath = path.join(path.dirname(req.file.path), `rotated_${path.basename(req.file.path)}`);

    await sharp(req.file.path)
      .rotate(parseInt(angle))
      .toFile(outputPath);

    // Orijinal dosyayı sil
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      message: `Görüntü ${angle}° döndürüldü`,
      outputPath: `/uploads/${path.basename(outputPath)}`
    });

  } catch (error) {
    console.error('Görüntü döndürme hatası:', error);
    res.status(500).json({ 
      error: 'Görüntü döndürme işlemi başarısız',
      message: error.message 
    });
  }
});

// Görüntü kırpma endpoint'i
router.post('/crop', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Görüntü dosyası yüklenmedi' });
    }

    const { x = 0, y = 0, width, height } = req.body;
    
    if (!width || !height) {
      return res.status(400).json({ error: 'Kırpma boyutları belirtilmedi' });
    }

    const outputPath = path.join(path.dirname(req.file.path), `cropped_${path.basename(req.file.path)}`);

    await sharp(req.file.path)
      .extract({ 
        left: parseInt(x), 
        top: parseInt(y), 
        width: parseInt(width), 
        height: parseInt(height) 
      })
      .toFile(outputPath);

    // Orijinal dosyayı sil
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      message: 'Görüntü kırpıldı',
      outputPath: `/uploads/${path.basename(outputPath)}`
    });

  } catch (error) {
    console.error('Görüntü kırpma hatası:', error);
    res.status(500).json({ 
      error: 'Görüntü kırpma işlemi başarısız',
      message: error.message 
    });
  }
});

// Görüntü iyileştirme endpoint'i
router.post('/enhance', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Görüntü dosyası yüklenmedi' });
    }

    const { 
      brightness = 1, 
      contrast = 1, 
      sharpen = false,
      grayscale = false,
      normalize = false 
    } = req.body;

    const outputPath = path.join(path.dirname(req.file.path), `enhanced_${path.basename(req.file.path)}`);

    let pipeline = sharp(req.file.path);

    // Parlaklık ve kontrast
    if (brightness !== 1 || contrast !== 1) {
      pipeline = pipeline.modulate({
        brightness: parseFloat(brightness),
        lightness: parseFloat(contrast)
      });
    }

    // Gri tonlama
    if (grayscale === 'true') {
      pipeline = pipeline.greyscale();
    }

    // Normalize
    if (normalize === 'true') {
      pipeline = pipeline.normalize();
    }

    // Keskinleştirme
    if (sharpen === 'true') {
      pipeline = pipeline.sharpen();
    }

    await pipeline.toFile(outputPath);

    // Orijinal dosyayı sil
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      message: 'Görüntü iyileştirildi',
      outputPath: `/uploads/${path.basename(outputPath)}`,
      enhancements: {
        brightness: parseFloat(brightness),
        contrast: parseFloat(contrast),
        sharpen: sharpen === 'true',
        grayscale: grayscale === 'true',
        normalize: normalize === 'true'
      }
    });

  } catch (error) {
    console.error('Görüntü iyileştirme hatası:', error);
    res.status(500).json({ 
      error: 'Görüntü iyileştirme işlemi başarısız',
      message: error.message 
    });
  }
});

// Görüntü bilgilerini alma endpoint'i
router.post('/info', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Görüntü dosyası yüklenmedi' });
    }

    const metadata = await sharp(req.file.path).metadata();

    // Dosyayı sil
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: req.file.size,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation
      }
    });

  } catch (error) {
    console.error('Görüntü bilgi alma hatası:', error);
    res.status(500).json({ 
      error: 'Görüntü bilgileri alınamadı',
      message: error.message 
    });
  }
});

module.exports = router; 