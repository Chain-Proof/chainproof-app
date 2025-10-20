import './App.css';
import Main from './component/main';
import TokenPage from './component/TokenPage';
import { RegisterToken } from './component/registertoken';
import { VerifiedTokenDetails } from './component/VerifiedTokenDetails';
import Send from './examples/send';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChainProofWalletProvider } from './chainproofconnect/walletProvider';

function App() {
  return (
    <ChainProofWalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/token/:address" element={<TokenPage />} />
          <Route path="/register-token" element={<RegisterToken />} />
          <Route path="/verified-token/:mint" element={<VerifiedTokenDetails />} />
          <Route path="/send" element={<Send />} />
        </Routes>
      </Router>
    </ChainProofWalletProvider>
  );
}

export default App;