# How to Publish Priv WhatsApp Web to the Chrome Web Store

Follow these step-by-step instructions to compile, package, and upload this extension to the official Chrome Web Store developer console.

### Step 1: Package the Extension
1. Verify that your version number inside the `src/manifest.json` file is correct (currently `1.0.0`).
2. Compress/zip the **`src`** folder of this repository.
   - **Windows**: Right-click the `src` folder -> `Send to` -> `Compressed (zipped) folder`. Name it `priv-whatsapp-web.zip`.
   - **macOS/Linux**: Compress the folder using your archive manager or run the terminal command:
     ```bash
     zip -r priv-whatsapp-web.zip src/
     ```
   *(Ensure that manifest.json is at the root level of the ZIP file, not inside a nested subdirectory).*

### Step 2: Register a Chrome Web Store Developer Account
1. Visit the **[Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/)**.
2. Sign in with the Google account you want associated with the extension.
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
5. **Screenshots**: Upload at least two high-quality screenshots (1280x800 or 640x400) showing the extension in action.

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
