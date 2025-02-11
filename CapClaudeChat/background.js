chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith('https://claude.ai/chat/')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        // Recursively processes DOM nodes to preserve layout and spacing.
        // It handles paragraphs, breaks, lists, and list items.
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
                let bullet = '• '; // Default bullet symbol.
                if (node.parentElement &&
                    node.parentElement.tagName.toLowerCase() === 'ol') {
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

        // Extracts chat messages from the page.
        // It selects elements matching '[data-testid="user-message"]' or '.font-claude-message'.
        function getMessages() {
          const messages = [];
          const messageNodes = document.querySelectorAll(
            '[data-testid="user-message"], .font-claude-message'
          );
          messageNodes.forEach((msg) => {
            const isUser = msg.hasAttribute('data-testid') &&
                           msg.getAttribute('data-testid') === 'user-message';
            const type = isUser ? 'ME' : 'AI';
            let content = processNode(msg)
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            // Process artifact references if available.
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

        // Formats the extracted messages into a single text string.
        function formatConversation(messages) {
          let chat = 'Claude Chat Export - ' + new Date().toLocaleString() + '\n\n';
          chat += 'Source: ' + window.location.href + '\n\n';
          messages.forEach((msg) => {
            chat += msg.type + ':\n' + msg.content + '\n\n';
          });
          return chat;
        }

        // Helper function to remove common Markdown formatting from the text.
        function removeMarkdown(text) {
          // Remove code blocks enclosed in triple backticks.
          text = text.replace(/```[\s\S]*?```/g, '');
          // Remove inline code enclosed in single backticks.
          text = text.replace(/`([^`]+)`/g, '$1');
          // Remove images (e.g., ![alt text](url)).
          text = text.replace(/!\[.*?\]\(.*?\)/g, '');
          // Remove links (e.g., [link text](url)) and keep only the link text.
          text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
          // Remove bold formatting (e.g., **text** or __text__).
          text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
          // Remove italic formatting (e.g., *text* or _text_).
          text = text.replace(/(\*|_)(.*?)\1/g, '$2');
          // Remove any remaining stray Markdown characters.
          text = text.replace(/[*_~`]/g, '');
          return text;
        }

        // Main routine: capture, format, remove Markdown, and download.
        const messages = getMessages();
        if (messages.length === 0) {
          alert('No chat messages were found on this page.');
          return;
        }
        let formattedChat = formatConversation(messages);
        formattedChat = removeMarkdown(formattedChat);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const blob = new Blob([formattedChat], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'claude_chat_' + timestamp + '.txt';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        alert('Please use this extension while on a Claude chat page.');
      }
    });
  }
});
