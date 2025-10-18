/**
 * Counter API service for integrating with counterapi.dev
 * Handles fetching and incrementing visitor count with proper error handling
 */

const API_ENDPOINT = 'https://v3dlp987le.execute-api.ap-south-1.amazonaws.com/dev/counter/up';
const REQUEST_TIMEOUT = 5000; // 5 seconds

/**
 * Fetches and increments the visitor count from counterapi.dev
 * @returns {Promise<number>} The updated visitor count
 * @throws {Error} When API call fails, times out, or returns invalid data
 */
export const fetchVisitorCount = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log('Fetching from:', API_ENDPOINT);
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    console.log('Full API response:', data);

    // Handle different response formats - try multiple possible structures
    let count;
    if (data && typeof data.Count === 'number') {
      // counterapi.dev format
      count = data.Count;
    } else {
      throw new Error('Invalid response format from counter API');
    }

    if (count < 0) {
      throw new Error('Invalid count value from counter API');
    }

    console.log('Extracted count:', count);
    return count;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout: Counter API took too long to respond');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach counter API');
    }

    // Re-throw other errors with context
    throw new Error(`Counter API error: ${error.message}`);
  }
};