import React, { useEffect, useState } from "react";

interface TokenInfo {
  name: string;
  price: number;
  chartUrl: string;
}

const TokenInfoCard: React.FC<{ projectName: string }> = ({ projectName }) => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${projectName}`, {
          headers: {
            'Authorization': `Bearer YOUR_API_KEY_HERE` // Replace with actual API key if needed
          }
        });
        const data = await response.json();
        console.log("API Response:", data); // Log the response to check the structure
        setTokenInfo({
          name: data.name || "Unknown",
          price: data.price || 0,
          chartUrl: data.chartUrl || "", // Adjust based on actual response structure
        });
      } catch (error) {
        console.error("Error fetching token info:", error);
      }
    };

    if (projectName) {
      fetchTokenInfo();
    }
  }, [projectName]);

  if (!tokenInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-4">
      <h2 className="text-xl font-bold">{tokenInfo.name}</h2>
      <p>Price: ${tokenInfo.price}</p>
      <iframe src={tokenInfo.chartUrl} title="Token Chart" className="w-full h-64"></iframe>
    </div>
  );
};

export default TokenInfoCard;
