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
      prompt: `Create a visual-only infographic with these elements:
        - Clean white background with professional blue and gray accents
        - Top section: Business-related icons representing key concepts from "${sentimentText}"
        - Middle section: Simple arrow flow or connection between icons showing progression
        - Bottom section: A large, prominent gesture icon (thumbs up if positive sentiment, thumbs down if negative, or horizontal hand for neutral)
        - Use simple, flat design icons in a consistent style
        - The bottom gesture should be larger and highlighted with a colored circle background
        - Include visual elements like arrows, charts, or graphs without any text
        Style: minimal flat icons, material design style, clean vector graphics, corporate aesthetic, high contrast symbols`,
      negative_prompt:
        "text, words, letters, realistic hands, photographic elements, complex patterns, cluttered design, sketchy lines, low quality graphics",
      width: 1024,
      height: 1024,
      sampler: "DPM++ 2M Karras",
      steps: 30,
      cfg_scale: 7.5,
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
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    try {
      imageUrl = await generateImage(sentimentText);
      console.log(`Image generated: ${imageUrl}`);
    } catch (error) {
      console.error("Error generating image:", error);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 },
      );
    }

    // Only try to generate video if we have an image
    if (imageUrl) {
      try {
        videoUrl = await generateVideo(imageUrl);
        console.log(`Video generated: ${videoUrl}`);
      } catch (error) {
        console.error("Error generating video:", error);
        // Return just the image if video generation fails
        return NextResponse.json(
          {
            imageUrl,
            message:
              "Video generation failed, but image was generated successfully",
          },
          { status: 206 }, // Partial Content
        );
      }
    }

    // Return both URLs if everything succeeded
    return NextResponse.json(
      { imageUrl, videoUrl },
      { status: videoUrl ? 200 : 206 },
    );
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
