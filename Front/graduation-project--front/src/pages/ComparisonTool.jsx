import React, { useState } from 'react';
import '../styles/ComparisonTool.css';

const TRANSLATIONS = {
  en: {
    title: "Career Comparison Tool",
    subtitle: "Compare learning tracks side by side",
    tracksLabel: "Enter tracks to compare",
    tracksPlaceholder: "e.g. Graphic Design, Interior Design",
    locationLabel: "Location",
    locationPlaceholder: "e.g. Egypt",
    currencyLabel: "Currency",
    currencyPlaceholder: "e.g. EGP",
    yearLabel: "Year",
    yearPlaceholder: "e.g. 2026",
    criteriaLabel: "Criteria",
    criteriaOptions: {
      "1": "Salary",
      "2": "Duration",
      "3": "Skills",
      "4": "All"
    },
    compareBtn: "Compare",
    loading: "Analyzing tracks...",
    resultTitle: "Comparison Results",
    placeholder: "Enter tracks above and click Compare",
    error: "Something went wrong. Please try again.",
  },
  ar: {
    title: "أداة مقارنة المسارات",
    subtitle: "قارن المسارات التعليمية جنب لجنب",
    tracksLabel: "أدخل المسارات للمقارنة",
    tracksPlaceholder: "مثال: تصميم جرافيك، تصميم داخلي",
    locationLabel: "الموقع",
    locationPlaceholder: "مثال: مصر",
    currencyLabel: "العملة",
    currencyPlaceholder: "مثال: EGP",
    yearLabel: "السنة",
    yearPlaceholder: "مثال: 2026",
    criteriaLabel: "المعايير",
    criteriaOptions: {
      "1": "الدخل",
      "2": "المدة",
      "3": "المهارات",
      "4": "الكل"
    },
    compareBtn: "قارن",
    loading: "جارى تحليل المسارات...",
    resultTitle: "نتيجة المقارنة",
    placeholder: "أدخل المسارات واضغط قارن",
    error: "حصل خطأ، حاول تاني.",
  }
};

const CareerComparisonTool = () => {
  // ===================================================
  // State
  // ===================================================
  const [lang, setLang] = useState('en');           
  const [tracks, setTracks] = useState('');        
  const [location, setLocation] = useState('');    
  const [currency, setCurrency] = useState('');    
  const [year, setYear] = useState('');           
  const [criteria, setCriteria] = useState([]);    
  const [result, setResult] = useState(null);       
  const [loading, setLoading] = useState(false);    
  const [error, setError] = useState(null);       

  const t = TRANSLATIONS[lang]; 

  // ===================================================
  // اختيار المعايير (multi-select)
  // ===================================================
  const toggleCriteria = (key) => {
    if (key === "4") {
      // لو اختار "الكل" يشيل كل التاني ويختار 4 بس
      setCriteria(criteria.includes("4") ? [] : ["4"]);
    } else {
      setCriteria(prev =>
        prev.includes(key)
          ? prev.filter(k => k !== key)
          : [...prev.filter(k => k !== "4"), key]
      );
    }
  };

  // ===================================================
  // الباك اند محتاج endpoint: POST /compare
  // بيستقبل:
  // {
  //   lang: 'ar' أو 'en',
  //   tracks: 'تصميم داخلي, تصميم جرافيك',
  //   location: 'مصر',
  //   currency: 'EGP',
  //   year: '2026',
  //   criteria: '1,2,3'
  // }
  // وبيرجع:
  // { result: '| المسار | الدخل...' }  ← جدول Markdown
  // ===================================================
  const handleCompare = async () => {
    if (!tracks.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,                                   
          tracks,                                
          location: location || (lang === 'ar' ? 'مصر' : 'Global'),
          currency: currency.toUpperCase() || 'USD',
          year: year || '2026',
          criteria: criteria.join(',') || '4',   
        }),
      });

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      setResult(data.result);

    } catch (err) {
      console.error('Comparison error:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // تحويل الجدول Markdown لـ HTML
  // لأن الباك اند بيرجع Markdown مش JSON
  // ===================================================
  const renderMarkdownTable = (markdown) => {
    if (!markdown) return null;
    const lines = markdown.trim().split('\n').filter(l => l.trim());
    const rows = lines.filter(l => l.startsWith('|'));
    if (rows.length < 2) return <pre className="raw-result">{markdown}</pre>;

    return (
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              {rows[0].split('|').filter(c => c.trim()).map((cell, i) => (
                <th key={i}>{cell.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(2).map((row, i) => (
              <tr key={i}>
                {row.split('|').filter(c => c.trim()).map((cell, j) => (
                  <td key={j}>{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ===================================================
  // الـ UI
  // ===================================================
  return (
    <div className={`career-comparison-container ${lang === 'ar' ? 'rtl' : 'ltr'}`}>

      {/* Header */}
      <header className="tool-header">
        <div className="header-top">
          <h1>{t.title}</h1>

          {/* ====================================
              زرار اللغة EN | AR
              مش عنده علاقة بالباك اند —
              بس بيغير الـ lang اللي بيتبعت معاه
              ==================================== */}
          <div className="lang-toggle">
            <button
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >EN</button>
            <button
              className={lang === 'ar' ? 'active' : ''}
              onClick={() => setLang('ar')}
            >AR</button>
          </div>
        </div>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <div className="tool-content">

        {/* Left Panel — الـ inputs */}
        <div className="selection-panel">

          {/* المسارات */}
          <div className="input-group">
            <label>{t.tracksLabel}</label>
            <input
              type="text"
              placeholder={t.tracksPlaceholder}
              value={tracks}
              onChange={e => setTracks(e.target.value)}
              // ↑ القيمة دي بتتبعت في tracks للباك اند
            />
          </div>

          {/* الموقع والعملة والسنة */}
          <div className="input-row">
            <div className="input-group">
              <label>{t.locationLabel}</label>
              <input
                type="text"
                placeholder={t.locationPlaceholder}
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>{t.currencyLabel}</label>
              <input
                type="text"
                placeholder={t.currencyPlaceholder}
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>{t.yearLabel}</label>
              <input
                type="text"
                placeholder={t.yearPlaceholder}
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </div>
          </div>

          {/* المعايير */}
          <div className="input-group">
            <label>{t.criteriaLabel}</label>
            <div className="criteria-buttons">
              {Object.entries(t.criteriaOptions).map(([key, label]) => (
                <button
                  key={key}
                  className={`criteria-btn ${criteria.includes(key) ? 'selected' : ''}`}
                  onClick={() => toggleCriteria(key)}
                  // ↑ الأرقام دي بتتبعت للباك اند في criteria
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* زرار المقارنة */}
          <button
            className="compare-btn"
            onClick={handleCompare}
            disabled={loading || !tracks.trim()}
            // ↑ لما يتضغط بيبعت كل البيانات للباك اند
          >
            {loading ? t.loading : t.compareBtn}
          </button>

        </div>

        {/* Right Panel — النتيجة الجاية من الباك اند */}
        <div className="comparison-panel">
          <h2>{t.resultTitle}</h2>

          {error && (
            <div className="api-warning">⚠️ {error}</div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t.loading}</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="comparison-placeholder">
              <div className="placeholder-icon">📊</div>
              <p>{t.placeholder}</p>
            </div>
          )}

          {/* النتيجة: جدول Markdown جاي من الباك اند */}
          {result && renderMarkdownTable(result)}

        </div>
      </div>
    </div>
  );
};

export default CareerComparisonTool;
