/**
 * popup.js - Text extractor version with fixed encoding
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get UI elements
  const selectorInput = document.getElementById('selector');
  const scrapeButton = document.getElementById('scrapeButton');
  const copyButton = document.getElementById('copyButton');
  const downloadButton = document.getElementById('downloadButton');
  const statusDiv = document.getElementById('status');
  
  // Store the scraped content
  let scrapedContent = '';
  
  // Preset selector buttons
  document.getElementById('googleGenAiSelector').addEventListener('click', () => {
    selectorInput.value = '.col-content';
  });
  
  document.getElementById('mainContentSelector').addEventListener('click', () => {
    selectorInput.value = 'main';
  });
  
  document.getElementById('articleSelector').addEventListener('click', () => {
    selectorInput.value = 'article';
  });
  
  // Scrape button click handler
  scrapeButton.addEventListener('click', async () => {
    const selector = selectorInput.value.trim();
    
    if (!selector) {
      statusDiv.textContent = 'Please enter a CSS selector';
      return;
    }
    
    try {
      statusDiv.textContent = 'Extracting text...';
      
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Execute script to extract text from the page
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractTextWithHelpers,
        args: [selector]
      });
      
      // Process the result
      if (results && results[0] && results[0].result) {
        const result = results[0].result;
        if (result.success) {
          scrapedContent = result.content;
          statusDiv.textContent = 'Text extracted successfully!';
        } else {
          statusDiv.textContent = `Error: ${result.error}`;
        }
      } else {
        statusDiv.textContent = 'Error: Failed to get results from the page';
      }
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
      console.error('Extraction error:', error);
    }
  });
  
  // Copy button click handler
  copyButton.addEventListener('click', () => {
    if (!scrapedContent) {
      statusDiv.textContent = 'No text extracted yet';
      return;
    }
    
    navigator.clipboard.writeText(scrapedContent)
      .then(() => {
        statusDiv.textContent = 'Text copied to clipboard';
      })
      .catch(error => {
        statusDiv.textContent = `Error copying to clipboard: ${error.message}`;
      });
  });
  
  // Download button click handler
  downloadButton.addEventListener('click', () => {
    if (!scrapedContent) {
      statusDiv.textContent = 'No text extracted yet';
      return;
    }
    
    // Get the current date and time for the filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    
    // Create a download blob
    const blob = new Blob([scrapedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Download the file
    chrome.downloads.download({
      url: url,
      filename: `extracted-text-${timestamp}.txt`,
      saveAs: true
    });
    
    statusDiv.textContent = 'Download started';
  });
});

// This function contains all the helper functions and main extraction logic
function extractTextWithHelpers(selector) {
  // Helper function to identify block-level elements
  function isBlockElement(tagName) {
    const blockElements = [
      'address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 
      'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 
      'nav', 'noscript', 'ol', 'p', 'pre', 'section', 'table', 'tfoot', 
      'ul', 'video'
    ];
    
    return blockElements.includes(tagName);
  }

  // Helper function to clean up excessive whitespace
  function cleanupText(text) {
    return text
      // Replace multiple spaces with a single space
      .replace(/[ \t]+/g, ' ')
      // Replace 3 or more newlines with 2 newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace from start and end
      .trim();
  }

  // Helper function to extract text while preserving some structure
  function extractFormattedText(element) {
    let result = '';
    
    // Process all child nodes
    const childNodes = element.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      
      // Text node - add its content
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          result += text + ' ';
        }
      }
      // Element node - handle based on tag
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        // Block-level elements should add line breaks
        if (isBlockElement(tagName)) {
          // Add line breaks before block elements (except the first one)
          if (result.length > 0) {
            result += '\n\n';
          }
          
          // Process the element's content
          const innerText = extractFormattedText(node);
          
          // Handle headings - add emphasis
          if (tagName.match(/^h[1-6]$/)) {
            result += innerText.toUpperCase() + '\n';
          } 
          // Handle lists - add bullets or numbers
          else if (tagName === 'li') {
            // Using a simple dash instead of bullet character to avoid encoding issues
            result += '- ' + innerText + '\n';
          } 
          // Regular block element
          else {
            result += innerText;
          }
          
          // Add line break after the block element
          if (i < childNodes.length - 1) {
            result += '\n';
          }
        }
        // Handle special inline elements
        else if (tagName === 'br') {
          result += '\n';
        }
        // Other inline elements - just get their text
        else {
          result += extractFormattedText(node);
        }
      }
    }
    
    return result;
  }

  // Main extraction function
  try {
    // Find the element using the provided selector
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) {
      return {
        success: false,
        error: `No elements found with selector: ${selector}`
      };
    }
    
    // Get the main element (the first match)
    const element = elements[0];
    
    // Extract text with formatting preserved
    const textContent = extractFormattedText(element);
    
    // Clean up whitespace
    const cleanedText = cleanupText(textContent);
    
    return {
      success: true,
      content: cleanedText
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
