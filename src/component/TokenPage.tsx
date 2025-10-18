import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TokenDetails from './TokenDetails';

interface AnalysisResult {
  success: boolean;
  tokenAddress: string;
  classification?: {
    type: string;
    utilityScore: number;
    memeScore: number;
  };
  riskAssessment?: {
    riskLevel: string;
    riskScore: number;
    detailedScores: any;
  };
  tokenInfo?: {
    name: string;
    symbol: string;
    logoURI: string;
    isVerified: boolean;
  };
  jupiterData?: {
    id: string;
    name: string;
    symbol: string;
    icon: string;
    decimals: number;
    twitter?: string;
    website?: string;
    usdPrice?: number;
    holderCount?: number;
    mcap?: number;
  }
}

function TokenPage() {
  const { address } = useParams<{ address: string }>();
  const [token, setToken] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/mu-checker/full-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tokenAddress: address }),
        });
        const data = await response.json();
        setToken(data);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
      setLoading(false);
    };

    if (address) {
      fetchTokenData();
    }
  }, [address]);

  return (
    <div className="bg-black min-h-screen text-white p-6">
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : token ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TokenDetails token={token} />
        </div>
      ) : (
        <p className="text-lg">Token not found.</p>
      )}
    </div>
  );
}

export default TokenPage;