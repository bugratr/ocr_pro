import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ languages, selectedLanguage, onLanguageChange, disabled }) => {
  const handleLanguageChange = (event) => {
    onLanguageChange(event.target.value);
  };

  const getLanguageDisplay = (langCode) => {
    const lang = languages.find(l => l.code === langCode);
    return lang ? `${lang.flag} ${lang.name}` : langCode;
  };

  return (
    <div className="language-selector card">
      <h3>🌍 Dil Seçimi</h3>
      
      <div className="selector-content">
        <label htmlFor="language-select" className="selector-label">
          OCR işlemi için dil seçin:
        </label>
        
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={handleLanguageChange}
          disabled={disabled}
          className="language-select"
        >
          <option value="tur+eng">🇹🇷 Türkçe + 🇺🇸 English</option>
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.name}
            </option>
          ))}
          <option value="auto">🤖 Otomatik Tespit</option>
        </select>
        
        <div className="selected-language-display">
          <span className="display-label">Seçili:</span>
          <span className="display-value">
            {selectedLanguage === 'auto' 
              ? '🤖 Otomatik Tespit' 
              : selectedLanguage === 'tur+eng' 
                ? '🇹🇷 Türkçe + 🇺🇸 English'
                : getLanguageDisplay(selectedLanguage)
            }
          </span>
        </div>
      </div>
      
      <div className="language-info">
        <div className="info-section">
          <h4>💡 İpuçları:</h4>
          <ul>
            <li>Doğru dil seçimi OCR doğruluğunu artırır</li>
            <li>Karma metinler için çoklu dil seçeneği kullanın</li>
            <li>Otomatik tespit belirsiz durumlarda kullanışlıdır</li>
          </ul>
        </div>
        
        <div className="popular-languages">
          <h4>🔥 Popüler Diller:</h4>
          <div className="quick-select">
            <button
              onClick={() => onLanguageChange('tur')}
              className={`quick-btn ${selectedLanguage === 'tur' ? 'active' : ''}`}
              disabled={disabled}
            >
              🇹🇷 Türkçe
            </button>
            <button
              onClick={() => onLanguageChange('eng')}
              className={`quick-btn ${selectedLanguage === 'eng' ? 'active' : ''}`}
              disabled={disabled}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => onLanguageChange('deu')}
              className={`quick-btn ${selectedLanguage === 'deu' ? 'active' : ''}`}
              disabled={disabled}
            >
              🇩🇪 Deutsch
            </button>
            <button
              onClick={() => onLanguageChange('fra')}
              className={`quick-btn ${selectedLanguage === 'fra' ? 'active' : ''}`}
              disabled={disabled}
            >
              🇫🇷 Français
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector; 