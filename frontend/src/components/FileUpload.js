import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateFile, formatFileSize } from '../services/api';
import './FileUpload.css';

const FileUpload = ({ onFilesSelected, processing, selectedLanguage }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);
    
    // Hatalı dosyaları kontrol et
    if (rejectedFiles.length > 0) {
      console.warn('Reddedilen dosyalar:', rejectedFiles);
    }

    // Dosyaları validate et
    const validFiles = [];
    const errors = [];

    acceptedFiles.forEach(file => {
      try {
        validateFile(file);
        validFiles.push(file);
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      alert('Dosya hataları:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: processing
  });

  const handleProcessFiles = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="file-upload card">
      <h3>📂 Dosya Yükleme</h3>
      
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive || dragActive ? 'active' : ''} ${processing ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="dropzone-content">
          <div className="upload-icon">
            {processing ? '⏳' : isDragActive ? '📥' : '📁'}
          </div>
          
          <div className="upload-text">
            {processing ? (
              <>
                <h4>İşleniyor...</h4>
                <p>Lütfen bekleyin</p>
              </>
            ) : isDragActive ? (
              <>
                <h4>Dosyaları buraya bırakın</h4>
                <p>Dosyalar yüklenecek</p>
              </>
            ) : (
              <>
                <h4>Dosya yüklemek için tıklayın veya sürükleyin</h4>
                <p>Görüntü (JPG, PNG, GIF, BMP, TIFF) ve PDF dosyalarını destekliyoruz</p>
              </>
            )}
          </div>
          
          <div className="upload-limits">
            <span>Maksimum 10 dosya • En fazla 50MB/dosya</span>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <div className="files-header">
            <h4>Seçili Dosyalar ({selectedFiles.length})</h4>
            <button 
              onClick={clearFiles}
              className="btn btn-secondary btn-sm"
              disabled={processing}
            >
              Temizle
            </button>
          </div>
          
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <div className="file-icon">
                    {file.type.startsWith('image/') ? '🖼️' : '📄'}
                  </div>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="remove-file"
                  disabled={processing}
                  title="Dosyayı kaldır"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <div className="process-section">
            <div className="language-info">
              <span className="language-label">Seçili Dil:</span>
              <span className="language-value">{selectedLanguage}</span>
            </div>
            
            <button
              onClick={handleProcessFiles}
              className="btn btn-primary"
              disabled={processing || selectedFiles.length === 0}
            >
              {processing ? (
                <>
                  <div className="loading"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  🚀 OCR İşlemini Başlat
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="upload-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon">✅</span>
            <span>Yüksek Doğruluk OCR</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🌍</span>
            <span>Çoklu Dil Desteği</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔒</span>
            <span>Güvenli İşleme</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <span>Hızlı Sonuçlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 