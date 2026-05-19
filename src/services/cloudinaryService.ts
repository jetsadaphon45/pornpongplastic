
export const uploadToCloudinary = async (file: File): Promise<string> => {
  // Validate file size (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('ขนาดไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 10MB)');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('ไม่รองรับประเภทไฟล์นี้ (รองรับเฉพาะ JPG, PNG, WEBP)');
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dgbyl9lcd';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pornpongplastic';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์อัปโหลดได้');
  }
};
