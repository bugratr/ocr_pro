import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📄</div>
            <div className="logo-text">
              <h1>OCR Pro</h1>
              <span>Metin Tanıma Uygulaması</span>
            </div>
          </div>
          
          <nav className="nav">
            <div className="nav-items">
              <div className="feature-badge">
                <span className="badge-icon">🔍</span>
                <span>Gelişmiş OCR</span>
              </div>
              <div className="feature-badge">
                <span className="badge-icon">🌍</span>
                <span>Çoklu Dil</span>
              </div>
              <div className="feature-badge">
                <span className="badge-icon">⚡</span>
                <span>Hızlı İşleme</span>
              </div>
            </div>
          </nav>
        </div>
        
        <div className="header-description">
          <p>
            ABBYY FineReader benzeri güçlü OCR teknolojisi ile görüntü ve PDF'lerden 
            yüksek doğrulukla metin çıkarın
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header; 