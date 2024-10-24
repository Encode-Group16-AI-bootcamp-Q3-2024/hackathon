"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import TokenInfoCard from "@/components/ui/tokenInfoCard";
import TradingViewChart from "@/components/ui/TradingViewChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ReactPlayer from "react-player";
import Image from "next/image";

interface GenerationResponse {
  imageUrl: string;
  videoUrl?: string;
}

export default function CryptoSentimentAnalysis() {
  const [projectName, setProjectName] = useState("");
  const [extractedSymbol, setExtractedSymbol] = useState("");
  const [mediaUrls, setMediaUrls] = useState<GenerationResponse | null>(null);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const { messages, append, isLoading, setMessages } = useChat();

  const generateMediaContent = async (
    sentimentText: string,
    projectName: string,
  ): Promise<GenerationResponse> => {
    try {
      setIsGeneratingMedia(true);
      const response = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentimentText,
          projectName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.imageUrl) {
          return { imageUrl: data.imageUrl };
        }
        throw new Error(data.message || "Error generating media content");
      }

      return {
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
      };
    } catch (error) {
      console.error("Error generating media content:", error);
      throw error;
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  const handleMediaGeneration = async () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !projectName) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "No analysis data available for media generation.",
          id: "",
        },
      ]);
      return;
    }

    try {
      const urls = await generateMediaContent(lastMessage.content, projectName);
      setMediaUrls(urls);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: urls.videoUrl
            ? "Media content has been generated successfully!"
            : "Image generated successfully, but video generation failed. You can still view the image analysis.",
          id: "",
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Failed to generate media content: ${error.message}`,
            id: "",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "An unexpected error occurred during media generation.",
            id: "",
          },
        ]);
      }
    }
  };

  const handleShowTokenInfo = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      const lines = lastMessage.content.split("\n");
      const symbolLine = lines.find((line) =>
        line.trim().startsWith("SYMBOL:"),
      );

      if (symbolLine) {
        const symbol = symbolLine.replace("SYMBOL:", "").trim();
        const cleanSymbol = symbol.replace(/[\[\]]/g, "").trim();
        setExtractedSymbol(cleanSymbol);
        setShowTokenInfo(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() === "") {
      setMessages([
        {
          role: "assistant",
          content: "Please enter a valid project name.",
          id: "",
        },
      ]);
      return;
    }

    // Clear previous states
    setMessages([]);
    setExtractedSymbol("");
    setMediaUrls(null);
    setShowTokenInfo(false);

    try {
      await append({
        role: "user",
        content: `Analyze ${projectName} in the following format:

SYMBOL: [Trading Symbol]

Market Position:
- Brief overview of current market position (2-3 sentences)
- Key competitive advantages/challenges

Sentiment Analysis:
- Current market sentiment (bullish/bearish/neutral)
- Key factors influencing sentiment
- Risk assessment (Low/Medium/High)

Recommendation:
- Clear investment stance (Buy/Sell/Hold)
- Brief justification for recommendation`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during analysis:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `An error occurred during analysis: ${error.message}`,
            id: "",
          },
        ]);
      }
    }
  };

  const canGenerateMedia =
    messages.length > 0 &&
    !isGeneratingMedia &&
    messages[messages.length - 1]?.role === "assistant";
  const canShowTokenInfo =
    messages.length > 0 && messages[messages.length - 1]?.role === "assistant";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-7xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Crypto Sentiment Analysis
        </h1>
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          {/* Left Column */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-lg font-medium">
                  Project Name
                </Label>
                <Input
                  id="projectName"
                  type="text"
                  placeholder="Enter crypto project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
            </form>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              {canShowTokenInfo && (
                <Button onClick={handleShowTokenInfo} className="flex-1">
                  Show Token Information
                </Button>
              )}

              {canGenerateMedia && showTokenInfo && (
                <Button
                  onClick={handleMediaGeneration}
                  className="flex-1"
                  disabled={isGeneratingMedia}
                >
                  {isGeneratingMedia
                    ? "Generating Content..."
                    : "Generate Visual Analysis"}
                </Button>
              )}
            </div>

            {/* Analysis Messages */}
            <div className="mt-6 space-y-4">
              {messages
                .filter((message) => message.role === "assistant")
                .map((message, index) => (
                  <div key={index} className="p-4 rounded-md bg-blue-100">
                    <p className="font-semibold">Analysis:</p>
                    <div className="mt-2 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-6">
            {showTokenInfo && extractedSymbol && (
              <>
                <div className="mb-6">
                  <TokenInfoCard projectName={extractedSymbol} />
                </div>
                <div className="mt-6">
                  <TradingViewChart symbol={extractedSymbol} />
                </div>
              </>
            )}

            {/* Media Content Section */}
            {mediaUrls && (
              <div className="space-y-6">
                {/* Generated Image */}
                <div>
                  <h2 className="text-lg font-medium mb-2">
                    Sentiment Visualization
                  </h2>
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={mediaUrls.imageUrl}
                      alt="Sentiment Analysis Visualization"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Video Player - only show if videoUrl exists */}
                {mediaUrls.videoUrl && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">
                      Animated Analysis
                    </h2>
                    <ReactPlayer
                      url={mediaUrls.videoUrl}
                      controls
                      width="100%"
                      height="400px"
                      className="rounded-lg overflow-hidden"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
