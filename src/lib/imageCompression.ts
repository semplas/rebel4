// Temporary fallback until browser-image-compression is installed
export async function compressImage(file: File): Promise<File> {
  try {
    // Dynamic import to avoid build errors
    const imageCompressionModule = await import('browser-image-compression');
    const imageCompression = imageCompressionModule.default;
    
    const options = {
      maxSizeMB: 1, // Compress to 1MB max
      maxWidthOrHeight: 1200, // Resize to max 1200px width/height
      useWebWorker: true, // Use web worker for better performance
      initialQuality: 0.8, // Initial quality setting
    };
    
    const compressedFile = await imageCompression(file, options);
    console.log('Compression ratio:', compressedFile.size / file.size);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original file if compression fails or module not available
    return file;
  }
}
