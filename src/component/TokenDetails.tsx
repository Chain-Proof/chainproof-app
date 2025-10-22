import { FaCheckCircle, FaTwitter, FaGlobe, FaArrowLeft, FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useState } from 'react';

interface TokenDetailsProps {
  token: {
    tokenInfo?: {
      name: string;
      logoURI: string;
      isVerified: boolean;
    };
    riskAssessment?: {
      riskLevel: string;
      riskScore: number;
      detailedScores?: Record<string, { score: number }>;
    };
    classification?: {
        type: string;
        utilityScore: number;
        memeScore: number;
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
      liquidity?: number;
      mcap?: number;
    };
  };
}

function TokenDetails({ token }: TokenDetailsProps) {
  const navigate = useNavigate();
  const [swapAmount, setSwapAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  const riskLevel = token.riskAssessment?.riskLevel?.toUpperCase();
  const riskColor = riskLevel === 'GOOD' || riskLevel === 'SAFE'
    ? 'text-green-400'
    : riskLevel === 'AVERAGE'
    ? 'text-yellow-400'
    : riskLevel === 'BAD' || riskLevel === 'DANGER'
    ? 'text-red-400'
    : 'text-gray-400';

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0e0d13' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base text-gray-400 hover:text-white transition">
          <FaArrowLeft className="text-sm" />
          <span className="text-sm sm:text-base">Back</span>
        </button>

        {/* Header Section */}
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
            {token.tokenInfo?.logoURI ? (
              <img
                src={token.tokenInfo.logoURI}
                alt={token.tokenInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs sm:text-sm text-gray-400">Logo</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{token.tokenInfo?.name || 'Token Name'}</h1>
              {token.tokenInfo?.isVerified && (
                <FaCheckCircle className="ml-2 text-base sm:text-lg lg:text-xl flex-shrink-0" style={{ color: '#35da9a' }} />
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mt-2 text-xs sm:text-sm flex-wrap" style={{ color: '#6b7280' }}>
              <span>socials:</span>
              {token.jupiterData?.website && (
                <a
                  href={token.jupiterData.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-white transition"
                >
                  <FaGlobe className="mr-1 text-xs sm:text-sm" /> <span>Website</span>
                </a>
              )}
              {token.jupiterData?.twitter && (
                <a
                  href={token.jupiterData.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-white transition"
                >
                  <FaTwitter className="mr-1 text-xs sm:text-sm" /> <span>Twitter</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column Layout - 50/50 Split */}
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-4">
          {/* Left Column - Token Details Card */}
          <div className="rounded-lg p-3 sm:p-4" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
            {/* Risk Score Section */}
            <div className="pb-4" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
              <h3 className="text-sm font-bold mb-3">Risk Score</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-4xl font-bold ${riskColor}`}>
                    {token.riskAssessment?.riskLevel || 'N/A'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                    Score: {token.riskAssessment?.riskScore ?? '--'}/100
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ color: '#6b7280' }} className="text-xs">Price</p>
                    <p className="font-bold">
                      {token.jupiterData?.usdPrice
                        ? `$${token.jupiterData.usdPrice.toFixed(6)}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280' }} className="text-xs">Holders</p>
                    <p className="font-bold">
                      {token.jupiterData?.holderCount
                        ? token.jupiterData.holderCount.toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280' }} className="text-xs">Liquidity</p>
                    <p className="font-bold">
                      {token.jupiterData?.liquidity
                        ? `$${token.jupiterData.liquidity.toLocaleString()}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280' }} className="text-xs">Market Cap</p>
                    <p className="font-bold">
                      {token.jupiterData?.mcap
                        ? `$${token.jupiterData.mcap.toLocaleString()}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification Section */}
            <div className="py-4" style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
              <h3 className="text-sm font-bold mb-3">Classification</h3>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold">{token.classification?.type || 'N/A'}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span style={{ color: '#6b7280' }}>Utility: </span>
                    <span className="font-bold">{token.classification?.utilityScore}%</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Meme: </span>
                    <span className="font-bold">{token.classification?.memeScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown Section */}
            <div className="pt-4">
              <h3 className="text-sm font-bold mb-3">Score Breakdown</h3>
              {token.riskAssessment?.detailedScores ? (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(token.riskAssessment.detailedScores).map(
                    ([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="capitalize" style={{ color: '#6b7280' }}>{key}</span>
                        <span className="font-semibold">{value.score}</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#6b7280' }}>No detailed scores available.</p>
              )}
            </div>
          </div>

          {/* Right Column - Demo Swap */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#181824', borderColor: '#252538ff', borderWidth: '1px' }}>
            <h3 className="text-sm font-bold mb-3">Demo Swap</h3>
            <p className="text-xs mb-4" style={{ color: '#6b7280' }}>Simulate a token swap transaction</p>

            {/* From Token */}
            <div className="mb-3">
              <label className="text-xs mb-1 block" style={{ color: '#6b7280' }}>From</label>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#0e0d13' }}>
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="bg-transparent text-white text-lg outline-none w-full"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">SOL</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#6b7280' }}>Balance: 0.00</p>
              </div>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center my-2">
              <div className="rounded-full p-2" style={{ backgroundColor: '#0e0d13' }}>
                <FaExchangeAlt className="text-gray-400" />
              </div>
            </div>

            {/* To Token */}
            <div className="mb-4">
              <label className="text-xs mb-1 block" style={{ color: '#6b7280' }}>To</label>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#0e0d13' }}>
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    className="bg-transparent text-white text-lg outline-none w-full"
                  />
                  <div className="flex items-center gap-2">
                    {token.tokenInfo?.logoURI && (
                      <img src={token.tokenInfo.logoURI} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-sm font-bold">{token.tokenInfo?.name?.slice(0, 8) || 'TOKEN'}</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#6b7280' }}>Balance: 0.00</p>
              </div>
            </div>

            {/* Swap Button */}
            <button
              className="w-full py-3 rounded-lg font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: '#35da9a' }}
            >
              Swap (Demo)
            </button>

            <p className="text-xs text-center mt-2" style={{ color: '#6b7280' }}>
              This is a demo interface only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenDetails;
