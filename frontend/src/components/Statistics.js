import React from 'react';
import './Statistics.css';

const Statistics = ({ statistics }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const getSuccessRate = () => {
    if (statistics.totalFiles === 0) return 0;
    return Math.round((statistics.successfulFiles / statistics.totalFiles) * 100);
  };

  const getAverageWordsPerFile = () => {
    if (statistics.successfulFiles === 0) return 0;
    return Math.round(statistics.totalWords / statistics.successfulFiles);
  };

  return (
    <div className="statistics card">
      <h3>📈 İstatistikler</h3>
      
      <div className="stats-grid">
        <div className="stat-item files">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(statistics.totalFiles)}</div>
            <div className="stat-label">Toplam Dosya</div>
          </div>
        </div>

        <div className="stat-item success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(statistics.successfulFiles)}</div>
            <div className="stat-label">Başarılı</div>
          </div>
        </div>

        <div className="stat-item words">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(statistics.totalWords)}</div>
            <div className="stat-label">Toplam Kelime</div>
          </div>
        </div>

        <div className="stat-item chars">
          <div className="stat-icon">🔤</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(statistics.totalChars)}</div>
            <div className="stat-label">Toplam Karakter</div>
          </div>
        </div>
      </div>

      <div className="detailed-stats">
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Başarı Oranı</span>
            <span className="progress-value">{getSuccessRate()}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getSuccessRate()}%` }}
            ></div>
          </div>
        </div>

        <div className="additional-stats">
          <div className="additional-stat">
            <span className="additional-label">Ortalama Kelime/Dosya:</span>
            <span className="additional-value">{formatNumber(getAverageWordsPerFile())}</span>
          </div>
          
          {statistics.totalFiles > 0 && (
            <div className="additional-stat">
              <span className="additional-label">Hata Oranı:</span>
              <span className="additional-value error">
                {Math.round(((statistics.totalFiles - statistics.successfulFiles) / statistics.totalFiles) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="stats-footer">
        <div className="achievement-badges">
          {statistics.totalFiles >= 10 && (
            <div className="badge" title="10+ dosya işlendi">
              🏆 Aktif Kullanıcı
            </div>
          )}
          {statistics.totalWords >= 1000 && (
            <div className="badge" title="1000+ kelime çıkarıldı">
              📚 Metin Ustası
            </div>
          )}
          {getSuccessRate() >= 95 && statistics.totalFiles >= 5 && (
            <div className="badge" title="95%+ başarı oranı">
              🎯 Mükemmellik
            </div>
          )}
        </div>
        
        <div className="reset-stats">
          <button 
            className="btn-link"
            onClick={() => {
              if (window.confirm('İstatistikleri sıfırlamak istediğinizden emin misiniz?')) {
                // Bu fonksiyon parent'tan gelmelidir
                console.log('İstatistikler sıfırlandı');
              }
            }}
            title="İstatistikleri sıfırla"
          >
            🔄 Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 