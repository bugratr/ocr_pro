import React, { useState } from 'react';
import { downloadFile } from '../services/api';
import './OCRResults.css';

const OCRResults = ({ results, onClear, processing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('filename');
  const [filterBy, setFilterBy] = useState('all');

  // Filtreleme ve sıralama
  const filteredResults = results
    .filter(result => {
      if (filterBy === 'success') return !result.error;
      if (filterBy === 'error') return result.error;
      return true;
    })
    .filter(result => 
      result.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.text && result.text.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'filename':
          return a.filename.localeCompare(b.filename);
        case 'confidence':
          return (b.confidence || 0) - (a.confidence || 0);
        case 'wordCount':
          return (b.wordCount || 0) - (a.wordCount || 0);
        default:
          return 0;
      }
    });

  const successCount = results.filter(r => !r.error).length;
  const errorCount = results.filter(r => r.error).length;

  const handleDownloadText = (result) => {
    if (result.text) {
      downloadFile(result.text, `${result.filename}_extracted.txt`, 'text/plain');
    }
  };

  const handleDownloadAll = () => {
    const successResults = results.filter(r => !r.error && r.text);
    if (successResults.length === 0) return;

    const combinedText = successResults.map(result => 
      `=== ${result.filename} ===\n${result.text}\n\n`
    ).join('');

    downloadFile(combinedText, 'all_extracted_texts.txt', 'text/plain');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Toast notification burada eklenebilir
    } catch (err) {
      console.error('Panoya kopyalanamadı:', err);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#28a745';
    if (confidence >= 70) return '#ffc107';
    return '#dc3545';
  };

  const getFileTypeIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg': return '📸';
      case 'png': return '🖼️';
      case 'gif': return '🎞️';
      default: return '📁';
    }
  };

  return (
    <div className="ocr-results card">
      <div className="results-header">
        <div className="header-left">
          <h3>📊 OCR Sonuçları</h3>
          <div className="results-summary">
            <span className="summary-item success">
              ✅ {successCount} başarılı
            </span>
            {errorCount > 0 && (
              <span className="summary-item error">
                ❌ {errorCount} hata
              </span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button
            onClick={handleDownloadAll}
            className="btn btn-success btn-sm"
            disabled={successCount === 0}
            title="Tüm metinleri indir"
          >
            📥 Tümünü İndir
          </button>
          <button
            onClick={onClear}
            className="btn btn-secondary btn-sm"
            disabled={processing}
            title="Sonuçları temizle"
          >
            🗑️ Temizle
          </button>
        </div>
      </div>

      <div className="results-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Dosya adı veya metin içeriğinde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="filename">📝 Dosya Adı</option>
            <option value="confidence">🎯 Güven Skoru</option>
            <option value="wordCount">📊 Kelime Sayısı</option>
          </select>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="control-select"
          >
            <option value="all">📋 Tümü</option>
            <option value="success">✅ Başarılı</option>
            <option value="error">❌ Hatalı</option>
          </select>
        </div>
      </div>

      <div className="results-list">
        {filteredResults.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p>Arama kriterlerine uygun sonuç bulunamadı</p>
          </div>
        ) : (
          filteredResults.map((result) => (
            <div key={result.id} className={`result-item ${result.error ? 'error' : 'success'}`}>
              <div className="result-header">
                <div className="file-info">
                  <span className="file-icon">{getFileTypeIcon(result.filename)}</span>
                  <span className="filename">{result.filename}</span>
                  {result.type && (
                    <span className="file-type">{result.type.toUpperCase()}</span>
                  )}
                </div>
                
                <div className="result-stats">
                  {!result.error && (
                    <>
                      <div className="confidence-badge">
                        <span 
                          className="confidence-value"
                          style={{ color: getConfidenceColor(result.confidence) }}
                        >
                          🎯 {result.confidence}%
                        </span>
                      </div>
                      {result.wordCount && (
                        <span className="word-count">📊 {result.wordCount} kelime</span>
                      )}
                      {result.pageCount && (
                        <span className="page-count">📄 {result.pageCount} sayfa</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {result.error ? (
                <div className="error-content">
                  <div className="error-message">
                    ❌ {result.error}
                  </div>
                </div>
              ) : (
                <div className="text-content">
                  <div className="text-preview">
                    {result.text ? (
                      <pre className="extracted-text">
                        {result.text.slice(0, 300)}
                        {result.text.length > 300 && '...'}
                      </pre>
                    ) : (
                      <span className="no-text">Metin çıkarılamadı</span>
                    )}
                  </div>
                  
                  {result.text && (
                    <div className="text-actions">
                      <button
                        onClick={() => copyToClipboard(result.text)}
                        className="btn btn-secondary btn-sm"
                        title="Panoya kopyala"
                      >
                        📋 Kopyala
                      </button>
                      <button
                        onClick={() => handleDownloadText(result)}
                        className="btn btn-primary btn-sm"
                        title="Metin dosyası olarak indir"
                      >
                        💾 İndir
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {filteredResults.length > 0 && (
        <div className="results-footer">
          <div className="results-count">
            Gösterilen: {filteredResults.length} / {results.length} sonuç
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRResults; 