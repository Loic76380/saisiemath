// API service for OCR recognition
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Perform OCR on a base64 encoded image
 * @param {string} imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @returns {Promise<{latex: string, confidence: number, formats: object}>}
 */
export const performOCR = async (imageBase64) => {
  try {
    const response = await fetch(`${API_URL}/api/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `OCR failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OCR API error:', error);
    throw error;
  }
};

/**
 * Check if the API is available
 * @returns {Promise<boolean>}
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/api/`);
    return response.ok;
  } catch {
    return false;
  }
};
