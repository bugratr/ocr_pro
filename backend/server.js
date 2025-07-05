const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// Routes
const ocrRoutes = require('./routes/ocr');
const imageRoutes = require('./routes/image');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Maksimum 100 istek
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Desteklenen dosya türleri
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya türü. Lütfen görüntü veya PDF dosyası yükleyin.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Middleware'i app'e ekle
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/ocr', upload.array('files', 10), ocrRoutes);
app.use('/api/image', upload.single('image'), imageRoutes);

// Desteklenen diller endpoint'i
app.get('/api/languages', (req, res) => {
  const languages = [
    { code: 'tur', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'eng', name: 'English', flag: '🇺🇸' },
    { code: 'deu', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fra', name: 'Français', flag: '🇫🇷' },
    { code: 'spa', name: 'Español', flag: '🇪🇸' },
    { code: 'ita', name: 'Italiano', flag: '🇮🇹' },
    { code: 'por', name: 'Português', flag: '🇵🇹' },
    { code: 'rus', name: 'Русский', flag: '🇷🇺' },
    { code: 'ara', name: 'العربية', flag: '🇸🇦' },
    { code: 'chi_sim', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'jpn', name: '日本語', flag: '🇯🇵' }
  ];
  
  res.json(languages);
});

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OCR API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Sunucu hatası:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Dosya boyutu çok büyük. Maksimum 50MB yükleyebilirsiniz.' 
      });
    }
  }
  
  res.status(500).json({ 
    error: 'Sunucu hatası oluştu',
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

app.listen(PORT, () => {
  console.log(`🚀 OCR API sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`📁 Uploads klasörü: ${uploadsDir}`);
}); 