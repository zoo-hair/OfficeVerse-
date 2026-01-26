/**
 * GenAI Client Module - Handles communication with backend GenAI API
 * Backend manages OpenAI API integration with dynamic API key configuration
 */

import { showAPIKeyModal, isGenAIConfigured } from './APIKeyModule.js';

const API_BASE_URL = 'http://localhost:8080/api/genai';

/**
 * Send a prompt to the backend for processing by OpenAI
 * @param {string} prompt - User's prompt/query
 * @param {string} roomId - Current room ID for context
 * @returns {Promise<string>} - AI response from backend
 */
export async function sendPromptToGenAI(prompt, roomId) {
  try {
    // Check if API is configured
    const configured = await isGenAIConfigured();
    if (!configured) {
      showAPIKeyModal();
      throw new Error('GenAI service not configured. Please provide an API key.');
    }

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        roomId: roomId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Check if API needs configuration
      if (errorData.requiresConfig) {
        showAPIKeyModal();
        throw new Error('GenAI service not configured. Please provide an API key.');
      }
      
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      // Check if it requires configuration
      if (result.requiresConfig) {
        showAPIKeyModal();
      }
      throw new Error(result.error || 'No response generated');
    }
    
    return result.response || 'No response generated';
  } catch (error) {
    console.error('GenAI Error:', error);
    throw error;
  }
}

/**
 * Get GenAI service status
 * @returns {Promise<object>} - Service status and configuration
 */
export async function getGenAIStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GenAI Status Error:', error);
    throw error;
  }
}

/**
 * Check if GenAI service is available
 * @returns {Promise<boolean>}
 */
export async function isGenAIAvailable() {
  try {
    const status = await getGenAIStatus();
    return status.available === true;
  } catch (error) {
    return false;
  }
}

/**
 * Format message for display
 * @param {string} text - Raw message text
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Formatted message
 */
export function formatMessage(text, maxLength = 500) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

