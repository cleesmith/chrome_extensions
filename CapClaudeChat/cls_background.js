chrome.action.onClicked.addListener((tab) => {
    console.log('Extension clicked, URL:', tab.url);
    
    if (tab.url.startsWith('https://claude.ai/chat/')) {
        console.log('URL match confirmed, attempting to execute script');
        
        // Inject all functions together as one script
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function() {
                // Helper function to extract messages
                function getMessages() {
                    const messages = [];
                    let currentMessage = { type: null, content: '' };
                    
                    document.querySelectorAll('[data-testid="user-message"], .font-claude-message').forEach(msg => {
                        const isHuman = msg.hasAttribute('data-testid') && msg.getAttribute('data-testid') === 'user-message';
                        const type = isHuman ? 'ME' : 'AI';
                        
                        let content = msg.innerText
                            .replace(/Copy|Retry|Edit/g, '')
                            .replace(/Claude can make mistakes\. Please double-check responses\./g, '')
                            .replace(/Click to open code/g, '')
                            .replace(/\n{3,}/g, '\n\n')
                            .trim();
                        
                        const artifactRefs = msg.querySelectorAll('button[aria-label="Preview contents"]');
                        if (artifactRefs.length > 0) {
                            content += '\n\nArtifacts:\n';
                            artifactRefs.forEach(ref => {
                                const title = ref.querySelector('.font-medium')?.textContent || '';
                                content += `[${title.trim()}]\n`;
                            });
                        }
                        
                        if (content) {
                            currentMessage = { type, content };
                            messages.push(currentMessage);
                        }
                    });
                    
                    return messages;
                }

                // Helper function to format conversation
                function formatConversation(messages) {
                    let chat = `Chat Export - ${new Date().toLocaleString()}\n\n`;
                    chat += `Source: ${window.location.href}\n\n`;
                    
                    messages.forEach(msg => {
                        chat += `${msg.type}:\n${msg.content}\n\n`;
                    });
                    
                    return chat;
                }

                // Main capture function
                console.log('Starting chat capture');
                
                try {
                    const messages = getMessages();
                    console.log('Messages captured:', messages.length);
                    
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
                    URL.revokeObjectURL(url);
                    
                    console.log('Download triggered');
                } catch (error) {
                    console.error('Error in captureChat:', error);
                }
            }
        }).then(() => {
            console.log('Script executed successfully');
        }).catch((err) => {
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
