import { useState, useEffect } from 'react';
import Popup from './popup/Popup';
import Sidebar from './sidebar/Sidebar';
import './App.css';

function App() {
  const [isSidebar, setIsSidebar] = useState(false);

  useEffect(() => {
    // 判断当前是弹出页面还是侧边栏
    const urlParams = new URLSearchParams(window.location.search);
    setIsSidebar(urlParams.get('sidebar') === 'true');
  }, []);

  if (isSidebar) {
    return <Sidebar />;
  } else {
    return <Popup />;
  }
}

export default App;
