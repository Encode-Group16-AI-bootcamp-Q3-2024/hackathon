# Crypto Vibe Check 🚀

Real-time cryptocurrency sentiment analysis with AI-powered visual insights, powered by Livepeer's Dream Gateway.

![Crypto Vibe Check](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-13%2B-black)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green)
![Livepeer](https://img.shields.io/badge/Livepeer-Dream%20Gateway-purple)

## Overview

Crypto Vibe Check is an innovative platform that provides comprehensive sentiment analysis for cryptocurrency projects, combining advanced AI analysis with dynamic visual representations. Our platform leverages Livepeer's Dream Gateway to transform sentiment data into engaging visuals and animations.

## ✨ Features

### 🤖 AI-Powered Sentiment Analysis

- Real-time analysis using GPT-4
- Multi-source data aggregation (Twitter, Reddit, Coinbase)
- Detailed sentiment breakdowns and recommendations

### 🎨 Dynamic Visual Generation via Livepeer

- AI-generated infographics using Livepeer's Dream Gateway
- Animated visualizations using Stable Video Diffusion
- Professional, clean design aesthetic
- Scalable media processing infrastructure

### ⚡ High-Performance Architecture

- Edge computing for faster response times
- Streaming responses for real-time updates
- Graceful degradation for reliable service

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+, TypeScript
- **AI Models**:
  - OpenAI GPT-4
  - Livepeer Dream Gateway
    - RealVisXL V4.0 Lightning for images
    - Stable Video Diffusion for animations
- **Infrastructure**: Edge Runtime, Node.js
- **APIs**: OpenAI, Livepeer Dream Gateway

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+
npm or yarn
Livepeer Dream Gateway access
```

### Environment Variables

Create a `.env.local` file with:

```env
OPENAI_API_KEY=your_openai_key
GATEWAY_IP=dream-gateway.livepeer.cloud
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/crypto-vibe-check.git

# Install dependencies
cd crypto-vibe-check
npm install

# Run development server
npm run dev
```

## 📖 Usage

1. Enter a cryptocurrency project name
2. Receive comprehensive sentiment analysis
3. View Livepeer-generated visual insights
4. Get actionable recommendations

## 🔌 API Endpoints

### Sentiment Analysis

```typescript
POST /api/sentiment
Body: { messages: Message[] }
Response: StreamingTextResponse
```

### Visual Generation (Livepeer Dream Gateway)

```typescript
POST /api/media
Body: { sentimentText: string, projectName: string }
Response: { imageUrl: string, videoUrl: string }
```

## 🎥 Livepeer Integration

Our project leverages Livepeer's Dream Gateway for:

- Text-to-image generation using RealVisXL V4.0 Lightning
- Image-to-video conversion using Stable Video Diffusion
- Scalable media processing
- Reliable content delivery

### Example Usage

```typescript
const generateImage = async (prompt: string) => {
  const response = await axios.post(`https://dream-gateway.livepeer.cloud/text-to-image`, {
    model_id: "SG161222/RealVisXL_V4.0_Lightning",
    prompt: prompt
  });
  return response.data.images[0].url;
};
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Livepeer for Dream Gateway infrastructure
- Stability AI for diffusion models
- Group16 Productions team

## 💡 Future Roadmap

- [ ] Live streaming market analysis integration
- [ ] Customizable visual alert systems
- [ ] Portfolio tracking with automated reports
- [ ] Mobile app development
- [ ] Advanced technical analysis features

## ⚠️ Known Issues

Please check the [Issues](https://github.com/your-username/crypto-vibe-check/issues) page for current known issues and feature requests.

## 📫 Support

For support:

- Create an issue in the repository

## 🌟 Show your support

Give a ⭐️ if this project helped you!
