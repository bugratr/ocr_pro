import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axios instance oluştur
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 dakika timeout (OCR işlemleri uzun sürebilir)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Hatası:', error);
    
    if (error.response) {
      // Sunucudan gelen hata mesajı
      throw new Error(error.response.data.error || error.response.data.message || 'Sunucu hatası');
    } else if (error.request) {
      // Network hatası
      throw new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
    } else {
      // Diğer hatalar
      throw new Error('Beklenmeyen bir hata oluştu');
    }
  }
);

// API fonksiyonları
export const getLanguages = async () => {
  return await api.get('/api/languages');
};

export const checkHealth = async () => {
  return await api.get('/api/health');
};

export const processFiles = async (endpoint, formData, onProgress = null) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  // Progress callback ekle
  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    };
  }

  return await api.post(`/api/ocr/${endpoint}`, formData, config);
};

export const processImage = async (formData, onProgress = null) => {
  return await processFiles('image', formData, onProgress);
};

export const processPDF = async (formData, onProgress = null) => {
  return await processFiles('pdf', formData, onProgress);
};

export const processBatch = async (formData, onProgress = null) => {
  return await processFiles('batch', formData, onProgress);
};

// Görüntü işleme fonksiyonları
export const rotateImage = async (file, angle = 90) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('angle', angle);

  return await api.post('/api/image/rotate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const cropImage = async (file, cropData) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('x', cropData.x);
  formData.append('y', cropData.y);
  formData.append('width', cropData.width);
  formData.append('height', cropData.height);

  return await api.post('/api/image/crop', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const enhanceImage = async (file, enhancements = {}) => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Enhancement parametreleri
  Object.keys(enhancements).forEach(key => {
    formData.append(key, enhancements[key]);
  });

  return await api.post('/api/image/enhance', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getImageInfo = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  return await api.post('/api/image/info', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Dosya yardımcı fonksiyonları
export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'application/pdf'
  ];

  if (file.size > maxSize) {
    throw new Error(`Dosya boyutu çok büyük. Maksimum ${formatFileSize(maxSize)} olmalı.`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Desteklenmeyen dosya türü. Lütfen görüntü veya PDF dosyası seçin.');
  }

  return true;
};

export default api; 