chrome.action.onClicked.addListener((tab) => {
    if (tab.url.startsWith('https://chatgpt.com/c/')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function() {
                // Recursively process DOM nodes to preserve layout
                function processNode(node) {
                    let text = '';
                    
                    if (node.nodeType === Node.TEXT_NODE) {
                        text += node.textContent;
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const style = window.getComputedStyle(node);
                        const marginTop = parseInt(style.marginTop);
                        const marginBottom = parseInt(style.marginBottom);
                        
                        if (marginTop > 10) text += '\n';
                        
                        switch(node.tagName.toLowerCase()) {
                            case 'div':
                            case 'p':
                                const childText = Array.from(node.childNodes)
                                    .map(child => processNode(child))
                                    .join('');
                                text += childText + '\n';
                                break;
                                
                            case 'br':
                                text += '\n';
                                break;

                            case 'li':
                                // Start list items on a new line so that they don't run into preceding text
                                text += '\n• ' + Array.from(node.childNodes)
                                    .map(child => processNode(child))
                                    .join('').trim() + '\n';
                                break;
                                
                            default:
                                text += Array.from(node.childNodes)
                                    .map(child => processNode(child))
                                    .join('');
                        }
                        
                        if (marginBottom > 10) text += '\n';
                    }
                    
                    return text;
                }

                // Updated getMessages to preserve message order
                function getMessages() {
                    const messages = [];
                    const elements = document.querySelectorAll('.whitespace-pre-wrap, .markdown.prose');
                    
                    elements.forEach(el => {
                        const content = processNode(el).trim();
                        // Skip any elements that only contain the text "Copy"
                        if (content && content !== 'Copy') {
                            const type = el.classList.contains('whitespace-pre-wrap') ? 'ME' : 'AI';
                            messages.push({ type, content });
                        }
                    });
                    
                    return messages;
                }

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
