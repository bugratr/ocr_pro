import React from 'react';
import './ProcessingQueue.css';

const ProcessingQueue = ({ queue, onRemoveItem, processing }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'processing': return '🔄';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Bekliyor';
      case 'processing': return 'İşleniyor';
      case 'completed': return 'Tamamlandı';
      case 'error': return 'Hata';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="processing-queue card">
      <h3>⚡ İşlem Kuyruğu</h3>
      
      <div className="queue-list">
        {queue.map((item) => (
          <div key={item.id} className={`queue-item ${item.status}`}>
            <div className="item-info">
              <span className="status-icon">{getStatusIcon(item.status)}</span>
              <div className="file-details">
                <span className="file-name">{item.file.name}</span>
                <span className="file-size">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            
            <div className="item-status">
              <span className="status-text">{getStatusText(item.status)}</span>
              {item.status === 'processing' && (
                <div className="progress-indicator">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{item.progress}%</span>
                </div>
              )}
            </div>
            
            {!processing && item.status !== 'processing' && (
              <button
                onClick={() => onRemoveItem(item.id)}
                className="remove-btn"
                title="Kuyruktan kaldır"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingQueue; 