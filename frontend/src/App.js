import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import FileUpload from './components/FileUpload';
import OCRResults from './components/OCRResults';
import LanguageSelector from './components/LanguageSelector';
import ProcessingQueue from './components/ProcessingQueue';
import Statistics from './components/Statistics';

import { getLanguages, processFiles } from './services/api';
import './App.css';

function App() {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('tur+eng');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [statistics, setStatistics] = useState({
    totalFiles: 0,
    successfulFiles: 0,
    totalWords: 0,
    totalChars: 0
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const data = await getLanguages();
      setLanguages(data);
    } catch (error) {
      toast.error('Diller yüklenirken hata oluştu');
    }
  };

  const handleFilesSelected = async (files) => {
    if (files.length === 0) return;

    setProcessing(true);
    const newQueueItems = files.map((file, index) => ({
      id: Date.now() + index,
      file,
      status: 'waiting', // waiting, processing, completed, error
      progress: 0,
      result: null
    }));

    setQueue(newQueueItems);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('language', selectedLanguage);

      // Dosya türüne göre endpoint seç
      const hasImages = files.some(file => file.type.startsWith('image/'));
      const hasPDFs = files.some(file => file.type === 'application/pdf');
      
      let endpoint;
      if (hasImages && hasPDFs) {
        endpoint = 'batch';
      } else if (hasPDFs) {
        endpoint = 'pdf';
      } else {
        endpoint = 'image';
      }

      const response = await processFiles(endpoint, formData, (progress) => {
        // Progress update - bu gerçek implementasyonda WebSocket ile yapılabilir
        console.log('İlerleme:', progress);
      });

      if (response.success) {
        setResults(response.results);
        updateStatistics(response.results);
        toast.success(response.message);
        
        // Queue'yu tamamlanmış olarak işaretle
        setQueue(prev => prev.map(item => ({
          ...item,
          status: 'completed',
          progress: 100
        })));
      } else {
        toast.error('İşlem başarısız oldu');
      }

    } catch (error) {
      console.error('Dosya işleme hatası:', error);
      toast.error('Dosyalar işlenirken hata oluştu: ' + error.message);
      
      // Queue'yu hata olarak işaretle
      setQueue(prev => prev.map(item => ({
        ...item,
        status: 'error',
        progress: 0
      })));
    } finally {
      setProcessing(false);
    }
  };

  const updateStatistics = (newResults) => {
    const successfulResults = newResults.filter(r => !r.error);
    const totalWords = successfulResults.reduce((sum, r) => sum + (r.wordCount || 0), 0);
    const totalChars = successfulResults.reduce((sum, r) => sum + (r.charCount || 0), 0);

    setStatistics(prev => ({
      totalFiles: prev.totalFiles + newResults.length,
      successfulFiles: prev.successfulFiles + successfulResults.length,
      totalWords: prev.totalWords + totalWords,
      totalChars: prev.totalChars + totalChars
    }));
  };

  const clearResults = () => {
    setResults([]);
    setQueue([]);
  };

  const removeQueueItem = (id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="App">
      <Header />
      
      <main className="container">
        <div className="app-grid">
          {/* Sol Panel - Kontroller */}
          <div className="control-panel">
            <LanguageSelector
              languages={languages}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              disabled={processing}
            />
            
            <FileUpload
              onFilesSelected={handleFilesSelected}
              processing={processing}
              selectedLanguage={selectedLanguage}
            />
            
            <Statistics statistics={statistics} />
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="results-panel">
            {queue.length > 0 && (
              <ProcessingQueue
                queue={queue}
                onRemoveItem={removeQueueItem}
                processing={processing}
              />
            )}
            
            {results.length > 0 && (
              <OCRResults
                results={results}
                onClear={clearResults}
                processing={processing}
              />
            )}
            
            {queue.length === 0 && results.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>Dosya Yükleyin</h3>
                <p>OCR işlemi başlatmak için görüntü veya PDF dosyalarınızı yükleyin</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App; 