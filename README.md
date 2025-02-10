# chrome_extensions

## No more clicking all of thse Copy buttons then pasting; endlessly repeated

So I coded two Chrome extensions to capture plain text from chat
sessions with ChatGPT and/or Claude.

The Chrome extensions export ChatGPT or Claude AI chat conversations to plain
text files. When run, it processes the entire chat page/session and
creates a downloadable text file containing the full conversation.

Key features:
• The extension preserves the conversation structure and formatting by
intelligently handling different types of content like paragraphs,
lists, and spacing. 

• It identifies messages from both the user and AI, marks them as 
"ME:" or "AI" respectively. 

• The extension also captures references to any **Artifacts/Canvas**
created during the chat, but **not their contents**.

• The code includes several specialized functions that work together:
- A DOM processor that maintains layout and formatting
- A message extractor that identifies and captures chat content
- A Markdown cleaner that removes formatting syntax
- A formatter that structures the conversation into a readable text file

This tool is particularly useful for users who want to save, archive,
or analyze their conversations with ChatGPT/Claude in a clean,
readable **plain text** format.


### These extensions only work at these hardcoded URL's:
1. https://claude.ai/chat/ for **CapClaudeChat** *see: CapClaudeChat/background.js*
2. https://chatgpt.com/c/ for **CaptureOpenAI** *see: CaptureOpenAI/background.js*

---

Below are step‐by‐step instructions for installing **CapClaudeChat**
Chrome extension using the ZIP file download method (for users
without Git). This guide also includes steps for pinning the
extension to the toolbar.

---

1. Download and Extract the ZIP File

• Download the ZIP File: 
- Visit your GitHub repository page at https://github.com/cleesmith/chrome_extensions. 
- Click the green "Code" button. 
- Choose "Download ZIP". This will download the entire repository as a ZIP file.

• Extract the ZIP File: 
- Locate the downloaded ZIP file (typically in your Downloads folder). 
- Right-click the ZIP file and select "Extract All" (or use your
  preferred archive tool) to unzip the contents. 
- Once extracted, navigate into the unzipped folder and locate the
  CapClaudeChat subfolder. This folder contains the extension files,
  including the manifest.json file.

---

2. Install the Extension in Chrome

• Open the Chrome Extensions Page: 
- Open Google Chrome. 
- In the address bar, type: chrome://extensions and press Enter.

• Enable Developer Mode: 
- On the Extensions page, locate the toggle labeled "Developer mode"
  in the top-right corner and switch it On.

• Load the Unpacked Extension: 
- Click the "Load unpacked" button that now appears. 
- In the file picker window, navigate to and select the CapClaudeChat
  folder (the folder that contains the extension files, including
  manifest.json). 
- Click "Select Folder" (or "Open") to install the extension. 
- Chrome will load the extension, and you should see it listed on the
  Extensions page.

---

3. Pin the Extension to the Toolbar

• Open the Extensions Menu: 
- Look to the right of the Chrome address bar for the Extensions icon
  (represented by a puzzle piece). Click it to open the extensions
  dropdown.

• Pin the Extension: 
- In the dropdown list, locate the CapClaudeChat extension. 
- Click the pin icon (usually a small pushpin) next to the extension
  name. 
- Once pinned, the extension’s icon will appear on the toolbar for
  easy access.

---

Final Notes

• Testing the Extension: 
- After installation and pinning, click the CapClaudeChat icon on the
  toolbar to confirm that the extension opens its intended popup.
  This only works if you're at: https://claude.ai/chat/

• Updating the Extension: 
- If you make changes to the extension files in the folder, return to
  the Extensions page(chrome://extensions) and click the "Reload"
  button on the extension’s card to apply updates.


For more details on loading unpacked extensions, refer to the official
Chrome developer guide at:
https://developer.chrome.com/docs/extensions/mv3/getstarted/

---

> Note: the above instructions also apply to the Chrome extension **CaptureOpenAI** it's just in a different folder.<br>Also: **CaptureOpenAI** only works at: https://chatgpt.com/c/

---
