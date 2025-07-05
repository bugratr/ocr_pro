const express = require('express');
const router = express.Router();
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Görüntü OCR endpoint'i
router.post('/image', async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const { language = 'tur+eng' } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        console.log(`🔍 OCR işlemi başlatılıyor: ${file.originalname}`);
        
        // Görüntü işleme (opsiyonel)
        let processedImagePath = file.path;
        
        if (req.body.enhanceImage === 'true') {
          const enhancedPath = path.join(path.dirname(file.path), `enhanced_${path.basename(file.path)}`);
          await sharp(file.path)
            .greyscale()
            .normalize()
            .sharpen()
            .toFile(enhancedPath);
          processedImagePath = enhancedPath;
        }

        // Tesseract OCR
        const { data: { text, confidence } } = await Tesseract.recognize(
          processedImagePath,
          language,
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`📝 OCR İlerleme: ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );

        results.push({
          id: uuidv4(),
          filename: file.originalname,
          text: text.trim(),
          confidence: Math.round(confidence),
          language: language,
          wordCount: text.trim().split(/\s+/).filter(word => word.length > 0).length,
          charCount: text.length
        });

        // Geçici dosyaları temizle
        if (processedImagePath !== file.path && fs.existsSync(processedImagePath)) {
          fs.unlinkSync(processedImagePath);
        }
        
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        console.log(`✅ OCR tamamlandı: ${file.originalname} (Güven: ${confidence}%)`);

      } catch (fileError) {
        console.error(`❌ Dosya işleme hatası ${file.originalname}:`, fileError);
        results.push({
          id: uuidv4(),
          filename: file.originalname,
          error: `OCR işlemi başarısız: ${fileError.message}`,
          text: '',
          confidence: 0
        });
      }
    }

    res.json({
      success: true,
      message: `${results.length} dosya işlendi`,
      results: results,
      totalFiles: req.files.length,
      language: language
    });

  } catch (error) {
    console.error('OCR API hatası:', error);
    res.status(500).json({ 
      error: 'OCR işlemi sırasında hata oluştu',
      message: error.message 
    });
  }
});

// PDF OCR endpoint'i
router.post('/pdf', async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'PDF dosyası yüklenmedi' });
    }

    const results = [];

    for (const file of req.files) {
      try {
        console.log(`📖 PDF işlemi başlatılıyor: ${file.originalname}`);

        if (file.mimetype !== 'application/pdf') {
          results.push({
            id: uuidv4(),
            filename: file.originalname,
            error: 'Geçersiz PDF dosyası',
            text: '',
            confidence: 0
          });
          continue;
        }

        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);

        results.push({
          id: uuidv4(),
          filename: file.originalname,
          text: pdfData.text.trim(),
          confidence: 95, // PDF metni için sabit güven skoru
          pageCount: pdfData.numpages,
          wordCount: pdfData.text.trim().split(/\s+/).filter(word => word.length > 0).length,
          charCount: pdfData.text.length,
          metadata: pdfData.info
        });

        // Geçici dosyayı temizle
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        console.log(`✅ PDF işlendi: ${file.originalname} (${pdfData.numpages} sayfa)`);

      } catch (fileError) {
        console.error(`❌ PDF işleme hatası ${file.originalname}:`, fileError);
        results.push({
          id: uuidv4(),
          filename: file.originalname,
          error: `PDF işleme hatası: ${fileError.message}`,
          text: '',
          confidence: 0
        });
      }
    }

    res.json({
      success: true,
      message: `${results.length} PDF dosyası işlendi`,
      results: results,
      totalFiles: req.files.length
    });

  } catch (error) {
    console.error('PDF API hatası:', error);
    res.status(500).json({ 
      error: 'PDF işlemi sırasında hata oluştu',
      message: error.message 
    });
  }
});

// Toplu işleme endpoint'i
router.post('/batch', async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const { language = 'tur+eng' } = req.body;
    const results = [];
    
    // Dosyaları türe göre ayır
    const imageFiles = req.files.filter(file => file.mimetype.startsWith('image/'));
    const pdfFiles = req.files.filter(file => file.mimetype === 'application/pdf');

    console.log(`📦 Toplu işleme başlatılıyor: ${imageFiles.length} görüntü, ${pdfFiles.length} PDF`);

    // Görüntü dosyalarını işle
    for (const file of imageFiles) {
      try {
        const { data: { text, confidence } } = await Tesseract.recognize(
          file.path,
          language
        );

        results.push({
          id: uuidv4(),
          filename: file.originalname,
          type: 'image',
          text: text.trim(),
          confidence: Math.round(confidence),
          language: language,
          wordCount: text.trim().split(/\s+/).filter(word => word.length > 0).length
        });

        // Geçici dosyayı temizle
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

      } catch (error) {
        results.push({
          id: uuidv4(),
          filename: file.originalname,
          type: 'image',
          error: error.message,
          text: '',
          confidence: 0
        });
      }
    }

    // PDF dosyalarını işle
    for (const file of pdfFiles) {
      try {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);

        results.push({
          id: uuidv4(),
          filename: file.originalname,
          type: 'pdf',
          text: pdfData.text.trim(),
          confidence: 95,
          pageCount: pdfData.numpages,
          wordCount: pdfData.text.trim().split(/\s+/).filter(word => word.length > 0).length
        });

        // Geçici dosyayı temizle
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

      } catch (error) {
        results.push({
          id: uuidv4(),
          filename: file.originalname,
          type: 'pdf',
          error: error.message,
          text: '',
          confidence: 0
        });
      }
    }

    const successCount = results.filter(r => !r.error).length;
    const totalWords = results.reduce((sum, r) => sum + (r.wordCount || 0), 0);

    res.json({
      success: true,
      message: `Toplu işleme tamamlandı: ${successCount}/${results.length} dosya başarılı`,
      results: results,
      summary: {
        totalFiles: req.files.length,
        successfulFiles: successCount,
        failedFiles: results.length - successCount,
        totalWords: totalWords,
        imageFiles: imageFiles.length,
        pdfFiles: pdfFiles.length
      }
    });

  } catch (error) {
    console.error('Toplu işleme hatası:', error);
    res.status(500).json({ 
      error: 'Toplu işleme sırasında hata oluştu',
      message: error.message 
    });
  }
});

module.exports = router; 