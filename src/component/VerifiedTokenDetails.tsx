import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { FaTwitter, FaGlobe, FaArrowLeft } from 'react-icons/fa';

export const VerifiedTokenDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = location.state || {};

  if (!token) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="p-8 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition">
            <FaArrowLeft />
            Back
          </button>
          <h2 className="text-2xl font-bold">Token not found</h2>
        </div>
      </div>
    );
  }

  const { account, ipfsData } = token;

  const riskLevel = ipfsData?.riskAssessment?.riskLevel?.toUpperCase();
  const riskColor = riskLevel === 'GOOD' || riskLevel === 'SAFE'
    ? 'text-green-400'
    : riskLevel === 'AVERAGE'
    ? 'text-yellow-400'
    : riskLevel === 'BAD' || riskLevel === 'DANGER'
    ? 'text-red-400'
    : 'text-gray-400';

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="p-8 max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition">
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="flex items-center mb-8">
          <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center overflow-hidden mr-6">
            {ipfsData?.tokenInfo?.icon ? (
              <img
                src={ipfsData.tokenInfo.icon}
                alt={account.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">No Icon</span>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold">{ipfsData?.tokenInfo?.name || account.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-400">
              {ipfsData?.tokenInfo?.website && (
                <a href={ipfsData.tokenInfo.website} target="_blank" rel="noreferrer" className="flex items-center hover:text-white transition">
                  <FaGlobe className="mr-1" /> Website
                </a>
              )}
              {ipfsData?.tokenInfo?.twitter && (
                <a href={ipfsData.tokenInfo.twitter} target="_blank" rel="noreferrer" className="flex items-center hover:text-white transition">
                  <FaTwitter className="mr-1" /> Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Box: Risk Score & Classification */}
          <div className="space-y-8">
            <div className="border border-white rounded-2xl p-6 text-center shadow-lg">
              <div className="flex justify-between text-gray-300 text-sm mb-3">
                <span>Risk Score</span>
                <span>{ipfsData?.riskAssessment?.riskScore ?? '--'}/100</span>
              </div>
              <p className={`text-5xl font-bold ${riskColor}`}>
                {riskLevel || 'N/A'}
              </p>
            </div>
            <div className="border border-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Classification</h3>
              <div className="text-2xl font-bold text-white">{ipfsData?.classification?.type || 'N/A'}</div>
              <div className="text-sm text-gray-300">Utility: {ipfsData?.classification?.utilityScore ?? '--'}%</div>
              <div className="text-sm text-gray-300">Meme: {ipfsData?.classification?.memeScore ?? '--'}%</div>
            </div>
          </div>

          {/* Right Box: On-Chain Info */}
          <div className="border border-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">On-Chain Information</h3>
            <div className="space-y-3 text-sm break-words">
              <p><strong>Mint Address:</strong> <span className="text-gray-300">{account.mint}</span></p>
              <p><strong>Update Authority:</strong> <span className="text-gray-300">{account.authority}</span></p>
              <p><strong>On-Chain Name:</strong> <span className="text-gray-300">{account.name}</span></p>
              <p><strong>On-Chain Symbol:</strong> <span className="text-gray-300">{account.symbol}</span></p>
              <p><strong>IPFS Hash:</strong> <span className="text-gray-300">{account.ipfsHash}</span></p>
              <p><strong>Registered On:</strong> <span className="text-gray-300">{new Date(parseInt(account.timestamp) * 1000).toLocaleString()}</span></p>
            </div>
          </div>
        </div>

        {/* Full IPFS Metadata */}
        {ipfsData && (
          <div className="mt-8 border border-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Full IPFS Metadata</h3>
            <pre className="bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(ipfsData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};