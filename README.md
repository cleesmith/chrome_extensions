# Chrome Extensions for AI Chat Export

These Chrome extensions offer a secure, efficient way to export your conversations with ChatGPT and Claude AI to plain text files. What sets them apart is their completely local operation - all code runs on your computer, downloads happen directly from your browser to your local storage, and no data ever gets sent to external servers or "mothership" systems. Unlike extensions from the Chrome Web Store, which often require broad permissions, communicate with remote servers, and pose potential security risks, these extensions are designed to be lightweight, transparent, and fully self-contained. You install them directly from source code, allowing you to inspect exactly what they do and verify that they operate entirely within your own system.


[![About Chrome Extensions](https://img.youtube.com/vi/WV7PE8nFzuk/0.jpg)](https://www.youtube.com/live/WV7PE8nFzuk?si=YhV29P3H9PBzWYVt)


## The Problem These Extensions Solve

If you've spent time working with AI chat interfaces, you're likely familiar with the tedious process of repeatedly clicking Copy buttons and pasting content elsewhere to save your conversations. This repetitive task becomes particularly frustrating during longer chat sessions. I created these extensions to eliminate this hassle, allowing you to capture entire conversations with a single click.

## How These Extensions Work

When you activate one of these extensions, it processes your current chat session and creates a downloadable text file containing the complete conversation. The processing engine intelligently handles various content types and, crucially, removes all Markdown formatting that typically clutters AI chat exports. This Markdown cleanup transforms those annoying asterisks, backticks, and formatting symbols into clean, readable plain text - the way you'd actually want to read it. Both extensions apply this cleanup automatically, so you don't have to manually remove formatting markers or deal with hard-to-read raw Markdown in your exported conversations.

The extensions preserve the natural flow of dialogue by clearly marking messages as either "ME:" or "AI:", making conversations easy to follow. While they note the presence of any Artifacts or Canvas elements created during your chat sessions, they currently don't capture the contents of these elements since they exist in separate windows. This might be addressed in a future enhancement, but for now, the focus remains on capturing the main conversation in clean, readable plain text.

## Security Through Simplicity and Transparency

These extensions prioritize security through a carefully restricted design. They operate only on specific, hardcoded URLs:

For CapClaudeChat: https://claude.ai/chat/
<br>
For CaptureOpenAI: https://chatgpt.com/c/

This strict URL limitation ensures the extensions only activate where they're needed and can't access other websites. The code is purposefully simple and focused, making it easy to verify exactly what it does. When you inspect the source code, you'll find several specialized components working together:
- The DOM processor maintains proper layout and formatting while traversing the chat interface. 
- A dedicated message extractor identifies and captures chat content accurately. 
- The Markdown cleaner removes unnecessary formatting syntax that often makes AI chat exports difficult to read. 
- Finally, the formatter structures everything into a clean, readable text file.

## Installation Guide

Since these extensions emphasize security through transparency, they aren't distributed through the Chrome Web Store. Instead, you'll install them directly from source code, giving you complete control and visibility over what runs in your browser. Here's how to install them:

### Getting the Extension Files

Start by downloading the extension files from GitHub. Visit https://github.com/cleesmith/chrome_extensions and click the green '<> Code' button, then select "Download ZIP". This downloads the entire repository as a ZIP file. After downloading, locate the file in your Downloads folder and extract its contents. Within the extracted folder, you'll find separate folders for each extension - look for "CapClaudeChat" or "CaptureOpenAI" depending on which one you want to install first.

### Setting Up in Chrome

Open Google Chrome and navigate to the extensions page by typing chrome://extensions in your address bar. In the top right corner of this page, you'll see a toggle labeled "Developer mode" - turn this on. This enables the ability to load extensions directly from your computer.

After enabling Developer mode, click the "Load unpacked" button that appears. Use the file picker window to navigate to and select the extension folder you want to install (either CapClaudeChat or CaptureOpenAI). Select this folder and click "Open" or "Select Folder". Chrome will load the extension and display it on your Extensions page.

### Making the Extension Easily Accessible

To make the extension readily available, you'll want to pin it to your Chrome toolbar. Look for the puzzle piece icon to the right of your address bar - this opens the Extensions menu. Find your newly installed extension in this menu and click the pin icon next to it. This places the extension's icon directly on your toolbar for easy access.

### Final Setup Steps

After installation, you can test the extension by visiting the appropriate chat website (either claude.ai/chat or chatgpt.com/c) and clicking the extension's icon. Remember, each extension only works on its specific site. If you make any changes to the extension files, you'll need to return to the Extensions page and click the "Reload" button on the extension's card to apply updates.

## Understanding What You've Installed

The transparency of these extensions means you can examine every aspect of their operation. The code is straightforward and well-commented, allowing you to verify exactly what happens when you use them. This approach stands in contrast to many Chrome Web Store extensions where the actual functionality can be obscured or changed without your knowledge.

For more detailed information about working with extensions installed this way, you can refer to Chrome's official developer documentation at https://developer.chrome.com/docs/extensions/mv3/getstarted/

Remember that these installation instructions work the same way for both extensions - they just use different folders and work on different sites. CapClaudeChat is for claude.ai/chat, while CaptureOpenAI handles chatgpt.com/c conversations.