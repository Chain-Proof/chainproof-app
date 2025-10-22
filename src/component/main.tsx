import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import tokens from './tokens/token.json';
import { useNavigate, Link } from 'react-router-dom';
import { getProgram } from '../chainproofconnect/useProgram';
import { FaCheckCircle, FaSearch, FaPlus } from 'react-icons/fa';

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
  jupiterData?: {
    usdPrice?: number;
    holderCount?: number;
    liquidity?: number;
    mcap?: number;
  };
}

function Main() {
  const [tokenData, setTokenData] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleSearchSelect = (address: string) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    navigate(`/token/${address}`);
  };

  // Filter tokens from token.json based on search term
  const searchResults = tokens.filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const filteredTokens = tokenData;

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#0e0d13' }}>
      <Navbar />

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-2xl">
            <div className="rounded-lg p-3 sm:p-4" style={{ backgroundColor: '#181824', borderColor: '#181824', borderWidth: '1px' }}>
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  placeholder="Search token name or enter address..."
                  className="flex-1 bg-transparent p-2 sm:p-3 text-sm sm:text-base text-white outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-white text-xs sm:text-sm ml-2 sm:ml-4"
                >
                  ESC
                </button>
              </div>

              {/* Search Results */}
              {searchTerm && (
                <div className="mt-3 sm:mt-4 space-y-2 max-h-60 sm:max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((token) => (
                      <div
                        key={token.address}
                        onClick={() => handleSearchSelect(token.address)}
                        className="p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-opacity-80 transition"
                        style={{ backgroundColor: '#11111bff' }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm sm:text-base font-medium">{token.name}</div>
                            <div className="text-gray-400 text-xs sm:text-sm">{token.symbol}</div>
                          </div>
                          <div className="text-gray-500 text-xs">{token.address.slice(0, 6)}...</div>
                        </div>
                      </div>
                    ))
                  ) : searchTerm.length > 30 ? (
                    // If search term looks like an address (long string), allow direct navigation
                    <div
                      onClick={() => handleSearchSelect(searchTerm)}
                      className="p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-opacity-80 transition"
                      style={{ backgroundColor: '#181824' }}
                    >
                      <div className="text-white text-sm sm:text-base">Search for address: {searchTerm.slice(0, 15)}...</div>
                    </div>
                  ) : (
                    <div className="p-2 sm:p-3 text-gray-400 text-xs sm:text-sm">No tokens found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow w-full mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl">
        <div className="space-y-4 flex flex-col flex-grow py-4">
          {/* Search Bar */}
          <div
            className="p-2 sm:p-3 rounded-lg cursor-pointer flex items-center gap-2 sm:gap-3"
            style={{ backgroundColor: '#181824' }}
            onClick={() => setIsSearchOpen(true)}
          >
            <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
            <input
              type="text"
              placeholder="Search token name or enter address..."
              className="w-full bg-transparent p-2 text-sm sm:text-base text-white outline-none cursor-pointer"
              readOnly
              value=""
            />
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: '#181824', borderColor: '#181824', borderWidth: '1px' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Risk Score</h2>
                <FaCheckCircle className="text-green-500 text-sm" />
              </div>
              <Link to="/register-token" className="flex items-center gap-2 text-sm font-medium transition hover:opacity-80" style={{ color: '#35da9a' }}>
                <FaPlus className="text-xs" />
                <span className="hidden sm:inline">Register Token</span>
                <span className="sm:hidden">Register</span>
              </Link>
            </div>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Comprehensive risk analysis with market data and holder metrics</p>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/3"></div>
                    </div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : filteredTokens.length === 0 ? (
              <p className="text-sm text-gray-400">No tokens found</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Token</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Risk Level</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Price</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Holders</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Liquidity</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map(token => (
                      <tr
                        key={token.tokenAddress}
                        onClick={() => handleTokenClick(token.tokenAddress)}
                        className="cursor-pointer hover:bg-opacity-80"
                      >
                        <td className="p-2">
                          <div className="flex items-center">
                            <img
                              src={token.tokenInfo?.logoURI}
                              alt={token.tokenInfo?.name}
                              className="w-6 h-6 sm:w-8 sm:h-8 mr-2 rounded-full flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Token';
                              }}
                            />
                            <span className="text-xs sm:text-sm whitespace-nowrap">{token.tokenInfo?.name}</span>
                          </div>
                        </td>
                        <td className="p-2 text-xs sm:text-sm font-medium whitespace-nowrap">{token.riskAssessment?.riskLevel || 'N/A'}</td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">
                          {token.jupiterData?.usdPrice
                            ? `$${token.jupiterData.usdPrice.toFixed(6)}`
                            : 'N/A'}
                        </td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">
                          {token.jupiterData?.holderCount
                            ? token.jupiterData.holderCount.toLocaleString()
                            : 'N/A'}
                        </td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">
                          {token.jupiterData?.liquidity
                            ? `$${token.jupiterData.liquidity.toLocaleString()}`
                            : 'N/A'}
                        </td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">
                          {token.jupiterData?.mcap
                            ? `$${token.jupiterData.mcap.toLocaleString()}`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: '#181824', borderColor: '#181824', borderWidth: '1px' }}>
            <h2 className="text-lg font-bold mb-1">Categorizing Data</h2>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Token classification with utility and meme score breakdown</p>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/4"></div>
                      </div>
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTokens.length === 0 ? (
                <p className="text-sm text-gray-400">No tokens found</p>
              ) : (
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Token</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Classification</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Utility Score</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Meme Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map(token => (
                      <tr
                        key={token.tokenAddress}
                        onClick={() => handleTokenClick(token.tokenAddress)}
                        className="cursor-pointer hover:bg-opacity-80"
                      >
                        <td className="p-2">
                          <div className="flex items-center">
                            <img
                              src={token.tokenInfo?.logoURI}
                              alt={token.tokenInfo?.name}
                              className="w-6 h-6 sm:w-8 sm:h-8 mr-2 rounded-full flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Token';
                              }}
                            />
                            <span className="text-xs sm:text-sm whitespace-nowrap">{token.tokenInfo?.name}</span>
                          </div>
                        </td>
                        <td className="p-2 text-xs sm:text-sm font-medium whitespace-nowrap">{token.classification?.type || 'N/A'}</td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{token.classification?.utilityScore || 0}%</td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{token.classification?.memeScore || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: '#181824', borderColor: '#181824', borderWidth: '1px' }}>
            <h2 className="text-lg font-bold mb-1">Recently Verified Tokens</h2>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Blockchain-verified tokens registered on ChainProof protocol</p>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              {verifiedLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-700 rounded w-2/5"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : verifiedTokens.length === 0 ? (
                <p className="text-sm text-gray-400">No verified tokens yet</p>
              ) : (
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr style={{ borderBottomColor: '#252538ff', borderBottomWidth: '1px' }}>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Icon</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Name</th>
                      <th className="text-left p-2 text-xs sm:text-sm font-bold whitespace-nowrap">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedTokens.map(token => (
                      <tr
                        key={token.publicKey.toString()}
                        className="cursor-pointer hover:bg-opacity-80"
                        onClick={() => handleVerifiedTokenClick(token)}
                      >
                        <td className="p-2">
                          {token.ipfsData?.tokenInfo?.icon ? (
                            <img
                              src={token.ipfsData.tokenInfo.icon}
                              alt={token.account.name}
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Token';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700" />
                          )}
                        </td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{token.account.name}</td>
                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{new Date(token.account.timestamp * 1000).toLocaleString()}</td>
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