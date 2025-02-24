chrome.action.onClicked.addListener((tab) => {
  // Define the URL pattern for Grok chat pages
  const grokChatUrlPattern = 'https://grok.com/chat/';
  if (tab.url.startsWith(grokChatUrlPattern)) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        // Recursively process DOM nodes to preserve visual layout
        function processNode(node) {
          let text = '';
          if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const style = window.getComputedStyle(node);
            const marginTop = parseInt(style.marginTop);
            const marginBottom = parseInt(style.marginBottom);
            if (marginTop > 10) text += '\n';
            switch (node.tagName.toLowerCase()) {
              case 'div':
              case 'p': {
                const childText = Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('');
                text += childText + '\n';
                break;
              }
              case 'br': {
                text += '\n';
                break;
              }
              case 'ul':
              case 'ol': {
                const listText = Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('');
                text += listText + '\n';
                break;
              }
              case 'li': {
                let bullet = '• ';
                if (
                  node.parentElement &&
                  node.parentElement.tagName.toLowerCase() === 'ol'
                ) {
                  const siblings = Array.from(node.parentElement.children)
                    .filter(child => child.tagName.toLowerCase() === 'li');
                  const index = siblings.indexOf(node) + 1;
                  bullet = index + '. ';
                }
                text += '\n' + bullet + Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('').trim() + '\n';
                break;
              }
              default: {
                text += Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('');
              }
            }
            if (marginBottom > 10) text += '\n';
          }
          return text;
        }

        // Extract chat messages from the Grok page
        function getMessages() {
          const messages = [];
          
          // Select all message bubbles (both user and Grok messages use .message-bubble)
          const messageBubbles = document.querySelectorAll('.message-bubble');
          
          messageBubbles.forEach(bubble => {
            let content = processNode(bubble).trim();
            if (content) {
              // Determine if it's a user (ME:) or Grok (AI:) message based on distinguishing features
              const isUserMessage = bubble.classList.contains('bg-foreground') && 
                                   bubble.classList.contains('border-input-border');
              const type = isUserMessage ? 'ME:' : 'AI:';
              messages.push({ type, content });
            }
          });
          
          return messages;
        }

        // Format the messages into a text string
        function formatConversation(messages) {
          let chat = 'Grok Chat Export - ' + new Date().toLocaleString() + '\n\n';
          chat += 'Source: ' + window.location.href + '\n\n';
          messages.forEach(msg => {
            chat += msg.type + '\n' + msg.content + '\n\n';
          });
          return chat.replace(/\n{4,}/g, '\n\n\n');
        }

        // Remove the "Thoughts" section specifically
        function removeThoughtsSection(text) {
          // Target the exact pattern "Thoughts\n\nExpand for details" with flexible spacing
          const thoughtsPattern = /Thoughts\s*\n+\s*Expand for details\s*\n*/g;
          return text.replace(thoughtsPattern, '');
        }

        // Remove Markdown-like formatting
        function removeMarkdown(text) {
          text = text.replace(/```[\s\S]*?```/g, ''); // Code blocks
          text = text.replace(/`([^`]+)`/g, '$1');    // Inline code
          text = text.replace(/!\[.*?\]\(.*?\)/g, ''); // Images
          text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
          text = text.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
          text = text.replace(/(\*|_)(.*?)\1/g, '$2');    // Italic
          text = text.replace(/[*_~`]/g, '');             // Remaining symbols
          return text;
        }

        // Process and download the chat
        const messages = getMessages();
        let formattedChat = formatConversation(messages);
        formattedChat = removeThoughtsSection(formattedChat); // Remove "Thoughts" section first
        formattedChat = removeMarkdown(formattedChat);        // Then remove Markdown
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const blob = new Blob([formattedChat], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grok_export_' + timestamp + '.txt';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        alert('Please use this extension while on a Grok chat page.');
      }
    });
  }
});
