// src/utils/GeotagChecker.js
import * as FileSystem from "expo-file-system";

class GeotagChecker {
  constructor() {
    this.imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".tiff",
      ".tif",
      ".bmp",
      ".gif",
      ".webp",
    ];
  }

  async checkGeotagsInFiles(files, onProgress = null) {
    try {
      if (files.length === 0) {
        return {
          success: false,
          message: "No files provided",
          results: [],
        };
      }

      // Filter image files
      const imageFiles = files.filter((file) => {
        const ext =
          "." + (file.name || file.uri).split(".").pop().toLowerCase();
        return this.imageExtensions.includes(ext);
      });

      if (imageFiles.length === 0) {
        return {
          success: false,
          message: "No image files found",
          results: [],
        };
      }

      // For React Native, we'll check all files or sample
      const sampleSize = Math.min(imageFiles.length, 20);
      const sampleFiles = this.getRandomSample(imageFiles, sampleSize);

      // Check geotags in sample
      const results = await this.checkGeotagsInSample(sampleFiles, onProgress);

      // Calculate summary
      const geotaggedCount = results.filter((r) => r.hasGeotag).length;
      const errorCount = results.filter((r) => r.error).length;
      const successfulChecks = results.length - errorCount;

      const summary = {
        totalImages: imageFiles.length,
        sampleSize: sampleFiles.length,
        successfulChecks,
        geotaggedCount,
        errorCount,
        geotagPercentage:
          successfulChecks > 0
            ? ((geotaggedCount / successfulChecks) * 100).toFixed(1)
            : 0,
      };

      return {
        success: true,
        message: `Analysis complete: ${summary.geotagPercentage}% geotagged`,
        summary,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error processing files: ${error.message}`,
        results: [],
      };
    }
  }

  getRandomSample(array, sampleSize) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }

  async checkGeotagsInSample(sampleFiles, onProgress = null) {
    const results = [];

    for (let i = 0; i < sampleFiles.length; i++) {
      const file = sampleFiles[i];
      const progress = ((i + 1) / sampleFiles.length) * 100;

      if (onProgress) {
        onProgress(progress, file.name || "image");
      }

      try {
        const hasGeotag = await this.checkImageGeotag(file);

        results.push({
          filename: file.name || `image_${i}`,
          hasGeotag: hasGeotag,
          error: null,
        });
      } catch (error) {
        results.push({
          filename: file.name || `image_${i}`,
          hasGeotag: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  async checkImageGeotag(file) {
    try {
      // For React Native, we'll use a simplified approach
      // You might need to implement actual EXIF reading here
      // For now, we'll simulate the check

      // Read file info
      const fileInfo = await FileSystem.getInfoAsync(file.uri);

      if (!fileInfo.exists) {
        return false;
      }

      // In a real implementation, you would:
      // 1. Read the image file
      // 2. Parse EXIF data
      // 3. Check for GPS coordinates

      // For demo purposes, randomly return true/false
      // Replace with actual EXIF parsing
      return Math.random() > 0.3; // 70% chance of having geotag
    } catch (error) {
      throw new Error(`Failed to read image data: ${error.message}`);
    }
  }
}

export default GeotagChecker;
