import React, { useState } from 'react';
import { useTokenRegistry } from '../chainproofconnect/useTokenRegistry';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Navbar from './Navbar';

interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  icon: string;
  ipfsHash: string;
  gatewayUrl: string;
  riskLevel: string;
  riskScore: number;
  classification: string;
}

export const RegisterToken: React.FC = () => {
  const { registerToken } = useTokenRegistry();

  // Step 1: Enter mint address
  const [mint, setMint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Step 2: Preview token data
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsAnalyzing(true);
    setMessage('');
    setError('');

    try {
      console.log('🔍 Analyzing token:', mint);

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/mu-checker/prepare-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAddress: mint,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze token');
      }

      console.log('✅ Token analyzed:', data.tokenData);
      setTokenData(data.tokenData);
      setMessage('Token analyzed successfully! Review the details below.');

    } catch (err: any) {
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Failed to analyze token');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegister = async () => {
    if (!tokenData) return;

    setIsRegistering(true);
    setMessage('');
    setError('');

    try {
      console.log('📝 Registering token on blockchain...');

      const tx = await registerToken(
        tokenData.mint,
        tokenData.name,
        tokenData.symbol,
        tokenData.ipfsHash
      );

      setMessage(`✅ Token registered successfully! Transaction: ${tx}`);

      // Reset form after 5 seconds
      setTimeout(() => {
        setMint('');
        setTokenData(null);
        setMessage('');
      }, 5000);

    } catch (err: any) {
      console.error('❌ Registration error:', err);

      // Handle specific error cases
      let errorMessage = 'Failed to register token';

      if (err.message?.includes('already been processed') ||
          err.message?.includes('already exists') ||
          err.message?.includes('custom program error: 0x0')) {
        errorMessage = '⚠️ This token is already registered on the blockchain. You can only register each token once.';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL for transaction fees. Please add some SOL to your wallet.';
      } else if (err.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected. Please try again.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'SAFE':
        return 'text-green-400 border-green-400';
      case 'MODERATE':
        return 'text-yellow-400 border-yellow-400';
      case 'DANGER':
        return 'text-red-400 border-red-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'UTILITY':
        return 'text-blue-400 border-blue-400';
      case 'MEME':
        return 'text-purple-400 border-purple-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl p-8 space-y-8 border border-white rounded-lg">
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>

          <h2 className="text-3xl font-bold text-center">Register a New Token</h2>

          {/* Step 1: Enter Mint Address */}
          {!tokenData && (
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label htmlFor="mint" className="block text-sm font-medium mb-2">
                  Token Mint Address
                </label>
                <input
                  id="mint"
                  type="text"
                  value={mint}
                  onChange={(e) => setMint(e.target.value)}
                  required
                  placeholder="Enter Solana token mint address..."
                  className="w-full px-4 py-3 text-white bg-transparent border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-400">
                  We'll analyze this token and generate metadata automatically
                </p>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !mint}
                className="w-full px-4 py-3 font-bold text-white border border-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Token...
                  </span>
                ) : (
                  'Proceed'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Preview Token Data */}
          {tokenData && (
            <div className="space-y-6">
              <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
                <h3 className="text-xl font-bold mb-4 text-center">Token Information</h3>

                <div className="flex items-center justify-center mb-6">
                  {tokenData.icon ? (
                    <img
                      src={tokenData.icon}
                      alt={tokenData.symbol}
                      className="w-16 h-16 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center bg-gray-800">
                      <span className="text-2xl font-bold">{tokenData.symbol.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Name:</span>
                    <span className="font-semibold">{tokenData.name}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="font-semibold">{tokenData.symbol}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Mint:</span>
                    <span className="font-mono text-xs">{tokenData.mint.slice(0, 8)}...{tokenData.mint.slice(-8)}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Risk Level:</span>
                    <span className={`font-semibold px-3 py-1 rounded border ${getRiskColor(tokenData.riskLevel)}`}>
                      {tokenData.riskLevel}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Risk Score:</span>
                    <span className="font-semibold">{tokenData.riskScore}/100</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Classification:</span>
                    <span className={`font-semibold px-3 py-1 rounded border ${getClassificationColor(tokenData.classification)}`}>
                      {tokenData.classification}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400">IPFS Hash:</span>
                    <a
                      href={tokenData.gatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-blue-400 hover:underline"
                    >
                      {tokenData.ipfsHash.slice(0, 8)}...{tokenData.ipfsHash.slice(-8)}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setTokenData(null);
                    setMessage('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 font-bold text-white border border-gray-600 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="flex-1 px-4 py-3 font-bold text-white bg-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRegistering ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    'Register on Blockchain'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {message && (
            <div className="p-4 border border-green-500 bg-green-900/20 rounded-md">
              <p className="text-green-400 text-center">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-500 bg-red-900/20 rounded-md">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
