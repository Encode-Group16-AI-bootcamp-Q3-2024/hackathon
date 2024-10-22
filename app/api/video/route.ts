import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export const runtime = "nodejs";

const GATEWAY_IP = process.env.GATEWAY_IP || "your-gateway-ip";

async function generateImage(sentimentText: string): Promise<string> {
  try {
    console.log(`Generating image with text: ${sentimentText}`);
    console.log(`Using Gateway IP: ${GATEWAY_IP}`);

    const response = await axios.post(`https://${GATEWAY_IP}/text-to-image`, {
      model_id: "SG161222/RealVisXL_V4.0_Lightning",
      prompt: `take the final recomendation in ${sentimentText} and generate an image that represents it`,
      width: 1024,
      height: 1024,
    });

    console.log("Image generation response:", response.data);
    const imageUrl = response.data.images[0].url;
    return imageUrl;
  } catch (error) {
    console.error("Detailed error in generateImage:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
    }
    throw error;
  }
}

async function generateVideo(imageUrl: string): Promise<string> {
  try {
    console.log(`Generating video from image: ${imageUrl}`);

    const formData = new FormData();
    formData.append(
      "model_id",
      "stabilityai/stable-video-diffusion-img2vid-xt-1-1",
    );
    formData.append(
      "image",
      (await axios.get(imageUrl, { responseType: "stream" })).data,
    );

    const response = await axios.post(
      `https://${GATEWAY_IP}/image-to-video`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    console.log("Video generation response:", response.data);
    const videoUrl = response.data.images[0].url;
    return videoUrl;
  } catch (error) {
    console.error("Detailed error in generateVideo:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sentimentText, projectName } = await req.json();

    if (!sentimentText || !projectName) {
      return NextResponse.json(
        { error: "Missing sentiment text or project name" },
        { status: 400 },
      );
    }

    console.log(`Processing request for project: ${projectName}`);

    // Generate image from sentiment text
    const imageUrl = await generateImage(sentimentText);
    console.log(`Image generated: ${imageUrl}`);

    // Generate video from the image
    const videoUrl = await generateVideo(imageUrl);
    console.log(`Video generated: ${videoUrl}`);

    // Here you would add the code to upload to Livepeer
    // For now, we'll just return the video URL
    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (error) {
    console.error("Detailed error in POST handler:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 },
      );
    }
  }
}
