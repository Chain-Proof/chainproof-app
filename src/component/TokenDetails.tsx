import { FaCheckCircle, FaTwitter, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

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
  const riskLevel = token.riskAssessment?.riskLevel?.toUpperCase();
  const riskColor = riskLevel === 'GOOD' || riskLevel === 'SAFE'
    ? 'text-green-400'
    : riskLevel === 'AVERAGE'
    ? 'text-yellow-400'
    : riskLevel === 'BAD' || riskLevel === 'DANGER'
    ? 'text-red-400'
    : 'text-gray-400';

  return (
    <div className="text-white bg-transparent">
      <Navbar />
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition">
        <FaArrowLeft />
        Back
      </button>
      {/* Header Section */}
      <div className="flex items-center mb-8">
        {/* Token Logo */}
        <div className="w-16 h-16 rounded-full border border-white flex items-center justify-center overflow-hidden mr-4">
          {token.tokenInfo?.logoURI ? (
            <img
              src={token.tokenInfo.logoURI}
              alt={token.tokenInfo.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-400">Logo</span>
          )}
        </div>

        {/* Token Name + Socials */}
        <div>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">{token.tokenInfo?.name || 'Token Name'}</h1>
            {token.tokenInfo?.isVerified && (
              <FaCheckCircle className="ml-2 text-green-400 text-xl" />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
            <span>socials:</span>
            {token.jupiterData?.website && (
              <a
                href={token.jupiterData.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center hover:text-white transition"
              >
                <FaGlobe className="mr-1" /> Website
              </a>
            )}
            {token.jupiterData?.twitter && (
              <a
                href={token.jupiterData.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center hover:text-white transition"
              >
                <FaTwitter className="mr-1" /> Twitter
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Section */}
      <div className="flex gap-8">
        {/* Left Box: Risk Score */}
        <div className="flex-1 border border-white rounded-2xl p-6 relative text-center shadow-sm">
            <div className="flex justify-between text-gray-300 text-sm mb-3">
            <span>Risk Score</span>
            <span>{token.riskAssessment?.riskScore ?? '--'}/100</span>
            </div>
            <p className={`text-5xl font-bold ${riskColor}`}>
            {token.riskAssessment?.riskLevel || 'N/A'}
            </p>
        </div>

        {/* Right Box: Token Info (Jupiter API) */}
        <div className="flex-1 border border-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Token Info (Jupiter API)</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div>
              <h4 className="uppercase text-xs mb-1">Price (USD)</h4>
              <p className="text-2xl font-bold text-white">
                {token.jupiterData?.usdPrice
                  ? `$${token.jupiterData.usdPrice.toFixed(6)}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="uppercase text-xs mb-1">Holders</h4>
              <p className="text-2xl font-bold text-white">
                {token.jupiterData?.holderCount
                  ? token.jupiterData.holderCount.toLocaleString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="uppercase text-xs mb-1">Liquidity</h4>
              <p className="text-2xl font-bold text-white">
                {token.jupiterData?.liquidity
                  ? `$${token.jupiterData.liquidity.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="uppercase text-xs mb-1">Market Cap</h4>
              <p className="text-2xl font-bold text-white">
                {token.jupiterData?.mcap
                  ? `$${token.jupiterData.mcap.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Classification Card */}
      <div className="mt-10 border border-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Classification</h3>
        <div className="text-2xl font-bold text-white">{token.classification?.type || 'N/A'}</div>
        <div className="text-sm text-gray-300">Utility: {token.classification?.utilityScore}%</div>
        <div className="text-sm text-gray-300">Meme: {token.classification?.memeScore}%</div>
      </div>

      {/* Bottom Section: Score Breakdown */}
      <div className="mt-10 border border-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>

        {token.riskAssessment?.detailedScores ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            {Object.entries(token.riskAssessment.detailedScores).map(
              ([key, value]: [string, any]) => (
                <div
                  key={key}
                  className="flex justify-between items-center border-b border-white/20 pb-2"
                >
                  <span className="capitalize">{key}</span>
                  <span className="font-semibold text-white">{value.score}</span>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500">No detailed scores available.</p>
        )}
      </div>
    </div>
  );
}

export default TokenDetails;
