import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';

// Set the runtime to 'nodejs' for this route
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { sentimentText, projectName } = await req.json();

    if (!sentimentText || !projectName) {
      console.error('Missing sentiment text or project name');
      return NextResponse.json({ error: 'Missing sentiment text or project name' }, { status: 400 });
    }

    console.log('LIVEPEER_API_KEY:', process.env.LIVEPEER_API_KEY);

    const videoFileName = `sentiment-${projectName}.mp4`;
    const publicDir = path.join(process.cwd(), 'public');

    // Ensure the public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const videoPath = path.join(publicDir, videoFileName);

    // Step 1: Generate video with sentiment analysis text
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input('color=c=blue:s=1280x720:d=5') // 5-second blue screen
        .inputFormat('lavfi')
        .complexFilter([
          {
            filter: 'drawtext',
            options: {
              fontfile: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', // Update this path based on your system
              text: sentimentText,
              fontsize: 50,
              fontcolor: 'white',
              x: '(w-text_w)/2',
              y: '(h-text_h)/2',
              box: 1,
              boxcolor: 'black@0.5',
            },
          },
        ])
        .output(videoPath)
        .on('end', () => {
          console.log(`Video created successfully at ${videoPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error('FFMPEG Error:', err);
          reject(err);
        })
        .run();
    });

    const apiKey = process.env.LIVEPEER_API_KEY;
    if (!apiKey) {
      console.error('Missing Livepeer API key');
      return NextResponse.json({ error: 'Missing Livepeer API key' }, { status: 500 });
    }

    // Step 2: Create asset request on Livepeer
    let assetResponse;
    try {
      assetResponse = await axios.post(
        'https://livepeer.com/api/asset/request-upload',
        { name: videoFileName },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      console.log('Asset created successfully on Livepeer:', assetResponse.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // AxiosError type guard
        console.error('Error creating asset on Livepeer:', error.response?.data || error.message);
      } else {
        // Fallback for non-Axios errors
        console.error('Unknown error creating asset on Livepeer:', error);
      }
      return NextResponse.json({ error: 'Failed to create asset on Livepeer' }, { status: 500 });
    }

    const uploadUrl = assetResponse.data.url;
    console.log('Upload URL:', uploadUrl);

    if (!uploadUrl) {
      console.error('Upload URL is missing or invalid');
      return NextResponse.json({ error: 'Failed to get upload URL from Livepeer' }, { status: 500 });
    }

    // Step 3: Upload the video file to Livepeer's direct URL
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(videoPath));

      // Direct upload to Livepeer
      const uploadResponse = await axios.post(uploadUrl, form, {
        headers: {
          ...form.getHeaders(), // Set correct multipart/form-data headers
        },
      });

      console.log('Video uploaded successfully to Livepeer:', uploadResponse.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error uploading video to Livepeer:', error.response?.data || error.message);
      } else {
        console.error('Unknown error uploading video to Livepeer:', error);
      }
      return NextResponse.json({ error: 'Failed to upload video to Livepeer' }, { status: 500 });
    }

    // Get the playback URL or ID
    const playbackId = assetResponse.data.asset.playbackId;
    const videoUrl = `https://livepeer.com/stream/${playbackId}/play.m3u8`;

    // Clean up the local video file after successful upload
    fs.unlink(videoPath, (err) => {
      if (err) {
        console.error('Failed to delete local video file:', err);
      }
    });

    // Return the playback URL in the response
    return NextResponse.json({ videoUrl }, { status: 200 });

  } catch (error) {
    console.error('Error during video generation or upload:', error);
    return NextResponse.json({ error: 'Error generating or uploading video' }, { status: 500 });
  }
}
