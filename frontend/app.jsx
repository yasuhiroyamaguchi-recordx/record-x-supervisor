// 記録庁ダッシュボード — エントリ
// 案A（機関ダッシュボード正統）採用版

const { useState, useEffect } = React;

function App() {
  const [activeTab, setActiveTab] = useState('top');
  const [todos, setTodos] = useState(TODOS);
  const [alerts, setAlerts] = useState(ALERTS.map(a => ({ ...a, acked: false })));
  const [divisionPreset, setDivisionPreset] = useState('current');
  const [focusAlert, setFocusAlert] = useState(null);

  // 文脈閾値リンクなどから「設定タブへ飛ばす」イベントを受領
  useEffect(() => {
    const h = (e) => setActiveTab(e.detail || 'settings');
    window.addEventListener('app:jump-tab', h);
    return () => window.removeEventListener('app:jump-tab', h);
  }, []);

  return (
    <VariantA
      activeTab={activeTab} setActiveTab={setActiveTab}
      todos={todos} setTodos={setTodos}
      alerts={alerts} setAlerts={setAlerts}
      divisionPreset={divisionPreset} setDivisionPreset={setDivisionPreset}
      focusAlert={focusAlert} setFocusAlert={setFocusAlert}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
