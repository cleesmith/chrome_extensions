chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith('https://chatgpt.com/c/')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        /**
         * Recursively process DOM nodes to preserve the visual layout.
         * - Handles paragraphs, breaks, unordered and ordered lists.
         * - For list items (<li>), if the parent is an ordered list (<ol>), it prefixes the item with its number.
         */
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
                // Process the list container by processing its children.
                const listText = Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('');
                text += listText + '\n';
                break;
              }
              case 'li': {
                let bullet = '• '; // default for unordered lists
                if (
                  node.parentElement &&
                  node.parentElement.tagName.toLowerCase() === 'ol'
                ) {
                  // Compute the numerical index for ordered lists.
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
                // For any other elements, process their children.
                text += Array.from(node.childNodes)
                  .map(child => processNode(child))
                  .join('');
              }
            }

            if (marginBottom > 10) text += '\n';
          }

          return text;
        }

        /**
         * Extracts the chat messages from the page.
         * It selects both user messages (with class "whitespace-pre-wrap") and AI messages (with class "markdown.prose")
         * in document order, processes each to preserve formatting, and appends any additional canvas elements.
         */
        function getMessages() {
          const messages = [];
          const elements = document.querySelectorAll('.whitespace-pre-wrap, .markdown.prose');

          elements.forEach(el => {
            // Process the node recursively.
            let content = processNode(el).trim();

            // Check for additional "canvas" elements within this message.
            // (In the OpenAI interface these additional elements are referred to as "canvas".)
            const canvasRefs = el.querySelectorAll('.canvas');
            if (canvasRefs.length > 0) {
              let canvasContent = '';
              canvasRefs.forEach(canvasEl => {
                // Here we simply insert a placeholder.
                // You can expand this logic to extract more details if needed.
                canvasContent += `[Canvas]\n`;
              });
              if (canvasContent) {
                content += '\n\nCanvas:\n' + canvasContent;
              }
            }

            // Skip any elements that only contain the text "Copy" (if any).
            if (content && content !== 'Copy') {
              // Determine the message type based on the element's class.
              const type = el.classList.contains('whitespace-pre-wrap') ? 'ME' : 'AI';
              messages.push({ type, content });
            }
          });

          return messages;
        }

        /**
         * Formats the messages into a single text string for export.
         */
        function formatConversation(messages) {
          let chat = `ChatGPT Export - ${new Date().toLocaleString()}\n\n`;
          chat += `Source: ${window.location.href}\n\n`;

          messages.forEach(msg => {
            chat += `${msg.type}:\n${msg.content}\n\n`;
          });

          return chat.replace(/\n{4,}/g, '\n\n\n');
        }

        try {
          const messages = getMessages();
          console.log('Messages found:', messages.length);
          const formattedChat = formatConversation(messages);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const blob = new Blob([formattedChat], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chatgpt_export_${timestamp}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        alert('Please use this extension while on a ChatGPT chat page.');
      }
    });
  }
});
