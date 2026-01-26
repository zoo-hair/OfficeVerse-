/**
 * GenAI API Key Management Module
 * Handles API key configuration and validation for GenAI services
 * Terminal UI interface
 */

const API_BASE_URL = 'http://localhost:8080/api/genai';

// Store API key in session storage
let cachedApiKey = null;

/**
 * Initialize API key management
 */
export function initializeAPIKeyManagement() {
  setupEventListeners();
  checkConfigurationStatus();
}

/**
 * Setup event listeners for API key modal
 */
function setupEventListeners() {
  const modal = document.getElementById('genai-apikey-overlay');
  const closeBtn = document.getElementById('close-apikey-btn');
  const validateBtn = document.getElementById('validate-apikey-btn');
  const saveBtn = document.getElementById('save-apikey-btn');
  const apiKeyInput = document.getElementById('genai-apikey-input');
  const toggleVisibilityBtn = document.getElementById('toggle-apikey-visibility');
  const helpBtn = document.getElementById('apikey-help-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeAPIKeyModal);
  }

  if (validateBtn) {
    validateBtn.addEventListener('click', validateAPIKey);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', saveAPIKey);
  }

  if (toggleVisibilityBtn) {
    toggleVisibilityBtn.addEventListener('click', togglePasswordVisibility);
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', toggleHelpSection);
  }

  if (apiKeyInput) {
    apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveAPIKey();
      }
    });
  }
}

/**
 * Add terminal output line
 */
function addTerminalOutput(text, type = 'text') {
  const output = document.getElementById('terminal-output');
  if (!output) return;

  const line = document.createElement('div');
  line.className = 'terminal-line';

  const prompt = document.createElement('span');
  prompt.className = 'terminal-prompt';
  prompt.textContent = '$';

  const content = document.createElement('span');
  content.className = `terminal-${type}`;
  content.textContent = text;

  line.appendChild(prompt);
  line.appendChild(content);
  output.appendChild(line);

  // Auto-scroll to bottom
  setTimeout(() => {
    const content = document.getElementById('genai-apikey-content');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }, 50);
}

/**
 * Add terminal status message
 */
function addTerminalStatus(text, status = 'info') {
  const output = document.getElementById('terminal-output');
  if (!output) return;

  const line = document.createElement('div');
  line.className = 'terminal-line';

  const statusEl = document.createElement('span');
  statusEl.className = `terminal-status ${status}`;
  
  const icon = status === 'success' ? '✓' : status === 'error' ? '✗' : 'ℹ';
  statusEl.textContent = `${icon} ${text}`;

  line.appendChild(statusEl);
  output.appendChild(line);

  // Auto-scroll to bottom
  setTimeout(() => {
    const content = document.getElementById('genai-apikey-content');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }, 50);
}

/**
 * Show API key configuration modal
 */
export function showAPIKeyModal() {
  const overlay = document.getElementById('genai-apikey-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    addTerminalOutput('Waiting for API key input...');
    document.getElementById('genai-apikey-input')?.focus();
  }
}

/**
 * Close API key configuration modal
 */
function closeAPIKeyModal() {
  const overlay = document.getElementById('genai-apikey-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  clearStatusMessage();
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  const input = document.getElementById('genai-apikey-input');
  const btn = document.getElementById('toggle-apikey-visibility');

  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🔒';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

/**
 * Toggle help section
 */
function toggleHelpSection() {
  const helpSection = document.getElementById('terminal-help-section');
  if (helpSection) {
    if (helpSection.style.display === 'none') {
      helpSection.style.display = 'block';
      addTerminalOutput('Displaying help documentation...');
    } else {
      helpSection.style.display = 'none';
      addTerminalOutput('Help section hidden');
    }
  }
}

/**
 * Validate API key with backend
 */
async function validateAPIKey() {
  const apiKeyInput = document.getElementById('genai-apikey-input');
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    addTerminalStatus('ERROR: API key cannot be empty', 'error');
    return;
  }

  const validateBtn = document.getElementById('validate-apikey-btn');
  validateBtn.disabled = true;
  addTerminalOutput('Validating API key with OpenAI...');

  try {
    const response = await fetch(`${API_BASE_URL}/validate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
        provider: 'openai'
      }),
    });

    const result = await response.json();

    if (result.valid) {
      addTerminalStatus('API Key is valid and working!', 'success');
      cachedApiKey = apiKey;
    } else {
      addTerminalStatus(`Validation failed: ${result.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    addTerminalStatus(`Connection error: ${error.message}`, 'error');
  } finally {
    validateBtn.disabled = false;
  }
}

/**
 * Save API key to backend
 */
async function saveAPIKey() {
  const apiKeyInput = document.getElementById('genai-apikey-input');
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    addTerminalStatus('ERROR: API key cannot be empty', 'error');
    return;
  }

  const saveBtn = document.getElementById('save-apikey-btn');
  saveBtn.disabled = true;
  addTerminalOutput('Saving and configuring API key...');

  try {
    const response = await fetch(`${API_BASE_URL}/configure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
        provider: 'openai'
      }),
    });

    const result = await response.json();

    if (result.success) {
      addTerminalStatus('Configuration successful! GenAI services activated.', 'success');
      cachedApiKey = apiKey;
      
      setTimeout(() => {
        closeAPIKeyModal();
        location.reload(); // Reload to refresh the app
      }, 1500);
    } else {
      addTerminalStatus(`Configuration failed: ${result.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    addTerminalStatus(`Connection error: ${error.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
  }
}

/**
 * Check if GenAI is configured
 */
export async function isGenAIConfigured() {
  try {
    const response = await fetch(`${API_BASE_URL}/is-configured`, {
      method: 'GET'
    });

    const result = await response.json();
    return result.configured === true;
  } catch (error) {
    console.error('Configuration check error:', error);
    return false;
  }
}

/**
 * Check configuration status and show modal if needed
 */
async function checkConfigurationStatus() {
  try {
    const configured = await isGenAIConfigured();
    
    if (!configured) {
      console.log('GenAI not configured - will prompt for API key on first use');
    }
  } catch (error) {
    console.error('Status check error:', error);
  }
}

/**
 * Clear status message
 */
function clearStatusMessage() {
  const terminal = document.getElementById('terminal-output');
  if (terminal) {
    // Clear terminal output for next use
  }
}

/**
 * Get stored API key (if cached)
 */
export function getStoredAPIKey() {
  return cachedApiKey;
}

/**
 * Clear stored API key
 */
export function clearStoredAPIKey() {
  cachedApiKey = null;
  const input = document.getElementById('genai-apikey-input');
  if (input) input.value = '';
  clearStatusMessage();
}
