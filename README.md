# Priv WhatsApp Web ![Logo](src/images/icon32.png)
[![GitHub license](https://img.shields.io/github/license/LukasLen/Privacy-Extension-For-WhatsApp-Web.svg)](LICENSE)

**Priv WhatsApp Web** is a modern, privacy-focused browser extension that secures your WhatsApp Web session in public spaces, offices, or shared computers. It blurs messages, user/group names, profile pictures, media previews, and input fields until you hover over them.

This project is a heavily enhanced, modernized, and redesigned fork of the original **[Privacy Extension for WhatsApp Web](https://github.com/LukasLen/Privacy-Extension-For-WhatsApp-Web)** by **Lukas Lenhardt**. It fixes all broken CSS selectors due to WhatsApp Web updates and adds advanced security features like Screen Lock, Focus Loss Blur, Global Hotkeys, and Selective Chat Blur.

---

## Key Features & How to Use Them

### 1. Hover-to-Reveal Blur Effects
- **What it blurs**: Messages (in chat & sidebar previews), profile pictures, group/usernames, media previews, text input area, and gallery icons.
- **How to reveal**: Simply hover your mouse cursor over the blurred element. It will instantly reveal (with an optional transition delay which you can toggle off).

### 2. Screen Lock (App Lock)
- **How it works**: Protects your WhatsApp Web session from unauthorized access when you step away.
- **Set Up**:
  1. Open the **Priv WhatsApp Web** extension menu.
  2. Click the setting drop-down icon next to **Screen Lock**.
  3. Enter a secure password and click **Set**.
  4. Specify an idle timeout duration (e.g. 60 seconds) and click the checkmark **✔**.
- **How to Lock**: 
  - The screen will lock automatically after the specified idle timeout.
  - You can click the **Lock Now** button inside the extension menu.
  - Use the hotkey **`Alt + L`** to lock the screen instantly.

### 3. Focus Loss Auto-Blur
- **How it works**: Automatically blurs your entire WhatsApp Web tab the moment you switch to another browser tab or minimize/focus away from the browser window.
- **How to enable**: Toggle the **Blur on Focus Loss** option in the extension popup menu.

### 4. Global Hotkeys
- **`Alt + X`**: Instantly toggles the entire privacy blur active/inactive.
- **`Alt + L`**: Instantly locks the session (requires a configured Screen Lock password).

### 5. Selective Chat Blur (Custom Chat Blur)
- **How it works**: Apply privacy blur selectively to specific chats instead of everything globally.
- **How to use**:
  1. Toggle **Selective Blur** in the extension popup.
  2. To blur the current active conversation, click the **+ Blur Current Chat** button.
  3. Alternatively, type the name of a contact or group in the input field and click **Add**.
  4. To remove a chat, click the delete (**×**) button next to it in the active list.

## Inspiration & Acknowledgments
This extension is developed by **Muhammed Erkam DOKUR** and is built on top of the original open-source extension **Privacy Extension for WhatsApp Web** by **Lukas Lenhardt** (MIT License). All selector engines, styles, and locale handlers were updated, modernized, and expanded with advanced features with the assistance of AI pair programming.

### v1.0.0 (Initial Release Notes)
- **New Rebranding**: Launched **Priv WhatsApp Web** with a brand new vector logo (secure padlock featuring "MED") and a futuristic cyber-blue/cyan theme.
- **Selector Overhaul**: Rewrote all broken CSS selectors to restore full support for the latest WhatsApp Web updates.
- **New Privacy Protections**:
  - **Screen Lock (App Lock)**: Idle timer password protection or instant hotkey locking.
  - **Focus Loss Blur**: Instantly blurs/hides the WhatsApp Web screen when tab focus is lost.
  - **Global Hotkeys**: Toggle privacy mode (`Alt + X`) or Lock screen (`Alt + L`).
  - **Selective Chat Blur**: Choose exactly which chats/groups to blur instead of blurring globally.

---

## How to Install (For Developers / Local Testing)
1. Clone or download this repository.
2. In Google Chrome, go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right corner switch).
4. Click **Load unpacked** (top-left button).
5. Select the `src` folder from this project directory.
6. The extension is now loaded and active!

---

## How to Publish to the Chrome Web Store

Follow these step-by-step instructions to compile, package, and upload this extension to the official Chrome Web Store developer console.

### Step 1: Package the Extension
1. Verify that your version number inside the `src/manifest.json` file is correct (e.g. `3.3.2` or higher if making updates).
2. Compress/zip the **`src`** folder of this repository.
   - **Windows**: Right-click the `src` folder -> `Send to` -> `Compressed (zipped) folder`. Name it `priv-whatsapp-web.zip`.
   - **macOS/Linux**: Compress the folder using your archive manager or run the terminal command:
     ```bash
     zip -r priv-whatsapp-web.zip src/
     ```
   *(Ensure that manifest.json is at the root level of the ZIP file, not inside a nested subdirectory).*

### Step 2: Register a Chrome Web Store Developer Account
1. Visit the **[Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/)**.
2. Sign in with a Google account you want associated with the extension.
3. If this is your first time publishing, you will need to accept the developer agreement and pay a one-time **$5 USD developer registration fee** to Google.

### Step 3: Upload your ZIP Package
1. On the Developer Console dashboard, click the **New Item** button in the top right.
2. Drag and drop your `priv-whatsapp-web.zip` file into the dialog box or click to select the file.
3. Wait for the upload to complete. The system will validate the manifest format and create a draft store listing.

### Step 4: Complete the Store Listing
Fill out the required information in the **Store Listing** tab:
1. **Description**: Describe what the extension does, listing all the features (Hover Blur, Screen Lock, Focus Loss Blur, Hotkeys, Selective Chat Blur).
2. **Category**: Select **Productivity** or **Social & Communication**.
3. **Languages**: English (default), and add translations if desired.
4. **Icons**: Upload your 128x128 icon (you can find it in `src/images/icon128.png`).
5. **Screenshots**: Upload at least two high-quality screenshots (1280x800 or 640x400) showing the extension in action. You can use screenshots from the browser subagent verification tests.

### Step 5: Configure Privacy & Permissions
In the **Privacy practices** tab, complete the questionnaire:
1. **Single-Purpose Description**: State the primary function of the extension (e.g. *"A privacy utility that blurs private details on WhatsApp Web to prevent shoulder surfing."*).
2. **Permission Justifications**:
   - `storage`: Required to save the user's custom blur preferences, settings, list of custom chats, and hashed lock screen password locally.
   - Host Permission (`https://web.whatsapp.com/*`): Required to inject the content script and apply the CSS blur rules only on the official WhatsApp Web tab.
3. **Data Usage**: Declare that the extension **does not collect or transmit** any personal data, messages, or user information to external servers. All settings and hashes are stored 100% locally on the user's browser via `chrome.storage.sync`.

### Step 6: Submit for Review
1. Once all mandatory fields are completed, click **Submit for review**.
2. Google's review process is mostly automated but will include manual checks for privacy compliance. The review usually takes **1 to 3 business days**.
3. Once approved, the extension will be live on the Chrome Web Store and you will receive an email confirmation.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
