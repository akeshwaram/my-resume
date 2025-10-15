/**
 * Counter API service for integrating with counterapi.dev
 * Handles fetching and incrementing visitor count with proper error handling
 */

const API_ENDPOINT = 'https://api.counterapi.dev/v2/ashwinresumevisitcounter/resume/up';
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

    // Validate response structure - the count is in data.data.up_count
    if (!data.data || typeof data.data.up_count !== 'number' || data.data.up_count < 0) {
      throw new Error('Invalid response format from counter API');
    }

    console.log('Extracted count:', data.data.up_count);
    return data.data.up_count;
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