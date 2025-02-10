chrome.action.onClicked.addListener((tab) => {
  console.log('Extension clicked, URL:', tab.url);

  if (tab.url.startsWith('https://claude.ai/chat/')) {
    console.log('URL match confirmed, attempting to execute script');

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        /**
         * Recursively processes DOM nodes to preserve layout and spacing.
         * It handles paragraphs, breaks, lists, and list items.
         */
        function processNode(node) {
          let text = '';

          if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const style = window.getComputedStyle(node);
            const marginTop = parseInt(style.marginTop);
            const marginBottom = parseInt(style.marginBottom);

            // Add a newline if the element has significant top margin.
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
              case 'br':
                text += '\n';
                break;
              case 'ul':
              case 'ol': {
                // Process list container elements by processing their children.
                const listText = Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('');
                text += listText + '\n';
                break;
              }
              case 'li': {
                let bullet = '• '; // Default bullet symbol.
                if (
                  node.parentElement &&
                  node.parentElement.tagName.toLowerCase() === 'ol'
                ) {
                  // For ordered lists, compute the numerical index.
                  const siblings = Array.from(node.parentElement.children).filter(
                    child => child.tagName.toLowerCase() === 'li'
                  );
                  const index = siblings.indexOf(node) + 1;
                  bullet = index + '. ';
                }
                // Start the list item on a new line with its bullet/number.
                text += '\n' + bullet + Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('')
                  .trim() + '\n';
                break;
              }
              default:
                // For any other elements, simply process their children.
                text += Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('');
            }

            // Add a newline if the element has significant bottom margin.
            if (marginBottom > 10) text += '\n';
          }
          return text;
        }

        /**
         * Extracts chat messages from the page.
         * Each message is processed with processNode() to preserve layout.
         * Also handles artifact references while skipping unwanted titles like "Untitled".
         */
        function getMessages() {
          const messages = [];
          const messageNodes = document.querySelectorAll(
            '[data-testid="user-message"], .font-claude-message'
          );

          messageNodes.forEach((msg) => {
            const isUser = msg.hasAttribute('data-testid') &&
                           msg.getAttribute('data-testid') === 'user-message';
            const type = isUser ? 'ME' : 'AI';

            // Process the node recursively to preserve formatting.
            let content = processNode(msg)
              .replace(/\n{3,}/g, '\n\n') // Limit excessive newlines.
              .trim();

            // Process artifact information if available.
            const artifactRefs = msg.querySelectorAll('button[aria-label="Preview contents"]');
            if (artifactRefs.length > 0) {
              let artifactContent = '';
              artifactRefs.forEach((ref) => {
                const title = ref.querySelector('.font-medium')?.textContent || '';
                if (title.trim() && title.trim() !== 'Untitled') {
                  artifactContent += `[${title.trim()}]\n`;
                }
              });
              if (artifactContent) {
                content += '\n\nArtifacts:\n' + artifactContent;
              }
            }

            if (content) {
              messages.push({ type, content });
            }
          });

          return messages;
        }

        /**
         * Formats the extracted messages into a single text string.
         */
        function formatConversation(messages) {
          let chat = `Chat Export - ${new Date().toLocaleString()}\n\n`;
          chat += `Source: ${window.location.href}\n\n`;

          messages.forEach((msg) => {
            chat += `${msg.type}:\n${msg.content}\n\n`;
          });

          return chat;
        }

        // Main routine to capture and download the chat.
        try {
          console.log('Starting chat capture');
          const messages = getMessages();
          console.log('Messages captured:', messages.length);

          if (messages.length === 0) {
            console.warn('No messages found on the page.');
            alert('No chat messages were found on this page.');
            return;
          }

          const formattedChat = formatConversation(messages);
          console.log('Chat formatted, length:', formattedChat.length);

          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const blob = new Blob([formattedChat], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `claude_chat_${timestamp}.txt`;

          console.log('Attempting download');
          a.click();

          // Revoke the URL immediately (this is fine since you're on the page).
          URL.revokeObjectURL(url);
          console.log('Download triggered');
        } catch (error) {
          console.error('Error in captureChat:', error);
        }
      }
    })
    .then(() => {
      console.log('Script executed successfully');
    })
    .catch((err) => {
      console.error('Script execution failed:', err);
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        alert('Please use this extension while on a Claude chat page.');
      }
    });
  }
});
