# OCR Pro - Gelişmiş Metin Tanıma Uygulaması

Bu proje, görüntü ve PDF dosyalarından yüksek doğrulukla metin çıkaran modern bir OCR (Optik Karakter Tanıma) web uygulamasıdır.

## Özellikler

- 📄 **Gelişmiş OCR**: Görüntülerden yüksek doğrulukla metin çıkarma
- 📋 **PDF İşleme**: PDF dosyalarından metin çıkarma
- 🌍 **Çoklu Dil Desteği**: Türkçe, İngilizce, Almanca ve daha fazlası
- 🖼️ **Görüntü İşleme**: Döndürme, kırpma, kontrast ayarları
- 📤 **Çoklu Çıktı Formatı**: TXT, PDF, DOCX
- 📦 **Toplu İşleme**: Birden fazla dosyayı aynı anda işleme
- 🎨 **Modern UI**: Kullanıcı dostu ve responsive arayüz
- 📊 **İstatistikler**: Detaylı işlem takibi ve başarı oranları

## Teknolojiler

### Backend
- Node.js + Express
- Tesseract.js (OCR)
- PDF-Parse (PDF işleme)
- Sharp (Görüntü işleme)
- Multer (Dosya yükleme)

### Frontend
- React 18
- Modern CSS
- Axios (API iletişimi)
- React Dropzone
- Lucide Icons

## Kurulum

1. Bütün bağımlılıkları kurun:
```bash
npm run install:all
```

2. Geliştirme modunda çalıştırın:
```bash
npm run dev
```

3. Tarayıcınızda `http://localhost:3000` adresini açın

## Kullanım

1. **Dil Seçimi**: Sol panelde OCR işlemi için uygun dili seçin
2. **Dosya Yükleme**: Görüntü veya PDF dosyalarını sürükleyip bırakın
3. **OCR İşlemi**: "OCR İşlemini Başlat" butonuna tıklayın
4. **Sonuçları Kaydet**: Çıkarılan metinleri istediğiniz formatta indirin

## Desteklenen Dosya Formatları

### Görüntü Formatları
- JPEG/JPG
- PNG
- GIF
- BMP
- TIFF

### Doküman Formatları
- PDF

## API Endpoints

- `POST /api/ocr/image` - Görüntüden metin çıkarma
- `POST /api/ocr/pdf` - PDF'den metin çıkarma
- `POST /api/ocr/batch` - Toplu dosya işleme
- `GET /api/languages` - Desteklenen diller
- `GET /api/health` - Sistem durumu

## Desteklenen Diller

- 🇹🇷 Türkçe
- 🇺🇸 İngilizce
- 🇩🇪 Almanca
- 🇫🇷 Fransızca
- 🇪🇸 İspanyolca
- 🇮🇹 İtalyanca
- 🇵🇹 Portekizce
- 🇷🇺 Rusça
- 🇸🇦 Arapça
- 🇨🇳 Çince (Basitleştirilmiş)
- 🇯🇵 Japonca

## Geliştirme

### Proje Yapısı
```
ocr-pro/
├── backend/          # Express API sunucusu
│   ├── routes/       # API route'ları
│   ├── uploads/      # Geçici dosya depolama
│   └── server.js     # Ana sunucu dosyası
├── frontend/         # React uygulaması
│   ├── src/
│   │   ├── components/  # React bileşenleri
│   │   ├── services/    # API servisleri
│   │   └── App.js       # Ana uygulama
│   └── public/       # Statik dosyalar
└── package.json      # Ana proje konfigürasyonu
```

### Özellikler

- **Otomatik Dil Tespit**: Belirsiz durumlarda otomatik dil tanıma
- **Görüntü İyileştirme**: OCR öncesi görüntü optimizasyonu
- **Toplu İşleme**: Aynı anda birden fazla dosya işleme
- **Progress Tracking**: Gerçek zamanlı işlem takibi
- **Responsive Design**: Mobil ve tablet uyumlu tasarım

## Performans

- Ortalama işlem süresi: 5-15 saniye (dosya boyutuna göre)
- Desteklenen maksimum dosya boyutu: 50MB
- Eşzamanlı dosya işleme: 10 dosyaya kadar
- OCR doğruluk oranı: %85-95 (görüntü kalitesine göre)

## Lisans

MIT

## Katkıda Bulunma

1. Projeyi fork edin
2. Yeni özellik dalı oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Dalınızı push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## Destek

Herhangi bir sorun yaşarsanız lütfen GitHub Issues bölümünde konu açın. 