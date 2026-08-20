export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[đĐ]/g, 'd')
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

export function optimizeImageUrl(url: string | null | undefined, width: number = 1920, height: number = 1080): string {
  if (!url) return '';
  
  // Google Street View Thumbnails
  if (url.includes('streetviewpixels-pa.googleapis.com')) {
    return url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
  }
  
  // Google Places Photos
  if (url.includes('googleapis.com/v1/places') && url.includes('/media')) {
    return url.replace(/maxHeightPx=\d+/, `maxHeightPx=${height}`).replace(/maxWidthPx=\d+/, `maxWidthPx=${width}`);
  }

  // Google User Content (Avatars or images)
  if (url.includes('googleusercontent.com') && url.includes('=s')) {
    return url.replace(/=s\d+/, `=s${width}`);
  }

  // Unsplash
  if (url.includes('images.unsplash.com')) {
    return url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
  }
  
  return url;
}
