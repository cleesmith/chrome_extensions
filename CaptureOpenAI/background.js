chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith('https://chatgpt.com/c/')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        // Recursively process DOM nodes to preserve the visual layout.
        // Handles paragraphs, breaks, unordered and ordered lists.
        // For list items (<li>), if the parent is an ordered list (<ol>), it prefixes the item with its number.
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

        // Extracts the chat messages from the page.
        // It selects both user messages (with class "whitespace-pre-wrap") and AI messages (with class "markdown.prose"),
        // processes each to preserve formatting, and appends any additional canvas elements.
        function getMessages() {
          const messages = [];
          const elements = document.querySelectorAll('.whitespace-pre-wrap, .markdown.prose');
          elements.forEach(el => {
            let content = processNode(el).trim();
            const canvasRefs = el.querySelectorAll('.canvas');
            if (canvasRefs.length > 0) {
              let canvasContent = '';
              canvasRefs.forEach(canvasEl => {
                canvasContent += '[Canvas]\n';
              });
              if (canvasContent) {
                content += '\n\nCanvas:\n' + canvasContent;
              }
            }
            if (content && content !== 'Copy') {
              const type = el.classList.contains('whitespace-pre-wrap') ? 'ME' : 'AI';
              messages.push({ type, content });
            }
          });
          return messages;
        }

        // Formats the messages into a single text string for export.
        function formatConversation(messages) {
          let chat = 'ChatGPT Chat Export - ' + new Date().toLocaleString() + '\n\n';
          chat += 'Source: ' + window.location.href + '\n\n';
          messages.forEach(msg => {
            chat += msg.type + ':\n' + msg.content + '\n\n';
          });
          return chat.replace(/\n{4,}/g, '\n\n\n');
        }

        // Helper function to remove common Markdown formatting from the text.
        function removeMarkdown(text) {
          text = text.replace(/```[\s\S]*?```/g, '');
          text = text.replace(/`([^`]+)`/g, '$1');
          text = text.replace(/!\[.*?\]\(.*?\)/g, '');
          text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
          text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
          text = text.replace(/(\*|_)(.*?)\1/g, '$2');
          text = text.replace(/[*_~`]/g, '');
          return text;
        }

        // Get messages, format the conversation, remove Markdown, and create the download.
        const messages = getMessages();
        let formattedChat = formatConversation(messages);
        formattedChat = removeMarkdown(formattedChat);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const blob = new Blob([formattedChat], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chatgpt_export_' + timestamp + '.txt';
        a.click();
        URL.revokeObjectURL(url);
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
