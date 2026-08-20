import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          fontSize: 480,
          color: '#FFD700', // Gold / Yellow
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          marginTop: -40, // Adjust for some fonts rendering F lower
        }}
      >
        F
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
