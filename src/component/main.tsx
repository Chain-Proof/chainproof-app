import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import tokens from './tokens/token.json';
import { useNavigate } from 'react-router-dom';
import { getProgram } from '../chainproofconnect/useProgram';

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
  };
  tokenInfo?: {
    name: string;
    symbol: string;
    logoURI: string;
    isVerified: boolean;
  };
}

function Main() {
  const [tokenData, setTokenData] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, ] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [analysisType, setAnalysisType] = useState('full-analysis');
  const navigate = useNavigate();
  const [verifiedTokens, setVerifiedTokens] = useState<any[]>([]);
  const [verifiedLoading, setVerifiedLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiedTokens = async () => {
      setVerifiedLoading(true);
      try {
        const program = getProgram();
        if (!program) {
          console.warn('Program not initialized');
          setVerifiedLoading(false);
          return;
        }

        const tokens = await (program.account as any).tokenEntry.all();
        console.log('Fetched verified tokens:', tokens);
        
        const tokensWithIpfsData = await Promise.all(
          tokens.map(async (token: any) => {
            try {
              let fetchUrl = token.account.ipfsHash;
              if (fetchUrl && !fetchUrl.startsWith('http')) {
                // Use Pinata gateway instead of public gateway to avoid CORS
                fetchUrl = `https://maroon-solid-leech-193.mypinata.cloud/ipfs/${fetchUrl.replace(/^ipfs:\/\//, '')}`;
              }

              if (!fetchUrl) {
                return { ...token, ipfsData: null };
              }

              const response = await fetch(fetchUrl);
              const ipfsData = await response.json();
              return { ...token, ipfsData };
            } catch (e) {
              console.error(`Failed to fetch IPFS data for ${token.account.name}`, e);
              return { ...token, ipfsData: null };
            }
          })
        );
        
        setVerifiedTokens(tokensWithIpfsData);
      } catch (error) {
        console.error('Error fetching verified tokens:', error);
        setVerifiedTokens([]);
      } finally {
        setVerifiedLoading(false);
      }
    };

    fetchVerifiedTokens();
  }, []);

  const handleSearch = async () => {
    if (!searchAddress) return;
    navigate(`/token/${searchAddress}`);
  };

  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/mu-checker/batch-full-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tokenAddresses: tokens.map(t => t.address) }),
        });
        const data = await response.json();
        if (data.success) {
          setTokenData(data.results);
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, []);

  const handleTokenClick = (address: string) => {
    navigate(`/token/${address}`);
  };

  const handleVerifiedTokenClick = (token: any) => {
    const serializableToken = {
      ...token,
      account: {
        ...token.account,
        mint: token.account.mint.toString(),
        authority: token.account.authority.toString(),
        timestamp: token.account.timestamp.toString(),
      },
      publicKey: token.publicKey.toString(),
    };
    navigate(`/verified-token/${serializableToken.account.mint}`, { state: { token: serializableToken } });
  };

  const filteredTokens = tokenData.filter(token => 
    token.tokenInfo?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollableClasses = filteredTokens.length > 3 ? 'overflow-y-auto max-h-96 custom-scrollbar' : '';

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-6 flex flex-col flex-grow py-6">
          <div className="p-6 border border-white rounded-xl">
            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="Enter token address..."
                className="w-full bg-gray-800 p-4 rounded-lg text-lg text-white"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
              <select 
                className="bg-gray-800 p-4 rounded-lg text-lg text-white"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <option value="full-analysis">Analyse</option>
                <option value="risk-score">Risk Score</option>
              </select>
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-2/3 border border-white p-6 rounded-xl flex flex-col">
              <h2 className="text-xl font-bold mb-4">Risk Score</h2>
              {loading ? (
                <p className="text-lg">Loading...</p>
              ) : filteredTokens.length === 0 ? (
                <p className="text-lg text-gray-400">No tokens found</p>
              ) : (
                <ul className={`divide-y divide-gray-800 flex-grow ${scrollableClasses}`}>
                  {filteredTokens.map(token => (
                    <li 
                      key={token.tokenAddress} 
                      onClick={() => handleTokenClick(token.tokenAddress)} 
                      className="cursor-pointer hover:bg-gray-800 p-2 rounded-lg flex items-center"
                    >
                      <img 
                        src={token.tokenInfo?.logoURI} 
                        alt={token.tokenInfo?.name} 
                        className="w-10 h-10 mr-3 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Token';
                        }}
                      />
                      <span className="text-base">{token.tokenInfo?.name}</span>
                      {token.tokenInfo?.isVerified && <span className="ml-3 text-green-500 text-base">✓ Verified</span>}
                      <span className="ml-auto text-base font-medium">{token.riskAssessment?.riskLevel}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="w-1/3 border border-white p-6 rounded-xl flex flex-col">
              <h2 className="text-xl font-bold mb-4">Categorizing Data</h2>
              {loading ? (
                <p className="text-lg">Loading...</p>
              ) : filteredTokens.length === 0 ? (
                <p className="text-lg text-gray-400">No tokens found</p>
              ) : (
                <ul className={`divide-y divide-gray-800 flex-grow ${scrollableClasses}`}>
                  {filteredTokens.map(token => (
                    <li key={token.tokenAddress} className="p-2 flex items-center">
                      <img 
                        src={token.tokenInfo?.logoURI} 
                        alt={token.tokenInfo?.name} 
                        className="w-10 h-10 mr-3 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Token';
                        }}
                      />
                      <span className="text-base">{token.tokenInfo?.name}</span>
                      <span className="ml-auto text-base font-medium">{token.classification?.type || 'N/A'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="p-6 border border-white rounded-xl flex flex-col flex-grow">
            <h2 className="text-xl font-bold mb-4">Token List</h2>
            <div className={`overflow-y-auto flex-grow ${scrollableClasses}`}>
              {loading ? (
                <p className="text-lg">Loading...</p>
              ) : filteredTokens.length === 0 ? (
                <p className="text-lg text-gray-400">No tokens found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2 text-base font-bold">Token</th>
                      <th className="text-left p-2 text-base font-bold">Classification</th>
                      <th className="text-left p-2 text-base font-bold">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredTokens.map(token => (
                      <tr key={token.tokenAddress} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer">
                        <td className="p-2 flex items-center">
                          <img 
                            src={token.tokenInfo?.logoURI} 
                            alt={token.tokenInfo?.name} 
                            className="w-10 h-10 mr-3 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Token';
                            }}
                          />
                          <span className="text-base">{token.tokenInfo?.name}</span>
                        </td>
                        <td className="p-2 text-base">{token.classification?.type || 'N/A'}</td>
                        <td className="p-2 text-base font-medium">{token.riskAssessment?.riskLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="p-6 border border-white rounded-xl flex flex-col flex-grow mt-6">
            <h2 className="text-xl font-bold mb-4">Recently Verified Tokens</h2>
            <div className="overflow-y-auto flex-grow">
              {verifiedLoading ? (
                <p className="text-lg">Loading verified tokens...</p>
              ) : verifiedTokens.length === 0 ? (
                <p className="text-lg text-gray-400">No verified tokens yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2 text-base font-bold">Icon</th>
                      <th className="text-left p-2 text-base font-bold">Name</th>
                      <th className="text-left p-2 text-base font-bold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {verifiedTokens.map(token => (
                      <tr 
                        key={token.publicKey.toString()} 
                        className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleVerifiedTokenClick(token)}
                      >
                        <td className="p-2">
                          {token.ipfsData?.tokenInfo?.icon ? (
                            <img 
                              src={token.ipfsData.tokenInfo.icon} 
                              alt={token.account.name} 
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Token';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700" />
                          )}
                        </td>
                        <td className="p-2 text-base">{token.account.name}</td>
                        <td className="p-2 text-base">{new Date(token.account.timestamp * 1000).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;