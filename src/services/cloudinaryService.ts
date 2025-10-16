// Cloudinary upload service
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
}

export const cloudinaryService = {
  // Upload file to Cloudinary
  async uploadFile(file: File): Promise<CloudinaryUploadResult> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "verifications");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload file to Cloudinary");
    }
  },

  // Delete file from Cloudinary
  async deleteFile(publicId: string): Promise<void> {
    // This typically requires a backend endpoint with Cloudinary API credentials
    console.log("Delete file:", publicId);
  },
};
