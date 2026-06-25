# How to Publish Priv WhatsApp Web

Follow these step-by-step instructions to compile, package, and upload this extension to the Google Chrome Web Store and Mozilla Firefox Add-ons (AMO) consoles.

---

## 1. Publishing to Google Chrome Web Store

### Step 1: Package the Extension
1. Verify that your version number inside the `src/manifest.json` file is correct (currently `1.0.4`).
2. Compress/zip the **`src`** folder of this repository.
   - **Windows**: Right-click the `src` folder -> `Send to` -> `Compressed (zipped) folder`. Name it `priv-whatsapp-web-chrome.zip`.
   - **macOS/Linux**: Compress the folder using your archive manager or run the terminal command:
     ```bash
     zip -r priv-whatsapp-web-chrome.zip src/
     ```
   *(Ensure that manifest.json is at the root level of the ZIP file, not inside a nested subdirectory).*

### Step 2: Register a Chrome Web Store Developer Account
1. Visit the **[Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/)**.
2. Sign in with the Google account you want associated with the extension.
3. If this is your first time publishing, you will need to accept the developer agreement and pay a one-time **$5 USD developer registration fee** to Google.

### Step 3: Upload your ZIP Package
1. On the Developer Console dashboard, click the **New Item** button in the top right.
2. Drag and drop your `priv-whatsapp-web-chrome.zip` file into the dialog box or click to select the file.
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

---

## 2. Publishing to Mozilla Firefox Add-ons (AMO)

### Step 1: Package the Extension
1. Verify that your version number inside the `firefox/manifest.json` file is correct (currently `1.0.4`).
2. Compress/zip the **`firefox`** folder of this repository.
   - **Windows**: Right-click the `firefox` folder -> `Send to` -> `Compressed (zipped) folder`. Name it `priv-whatsapp-web-firefox.zip`.
   - **macOS/Linux**: Compress the folder using your archive manager or run the terminal command:
     ```bash
     zip -r priv-whatsapp-web-firefox.zip firefox/
     ```
   *(Ensure that manifest.json is at the root level of the ZIP file, not inside a nested subdirectory).*

### Step 2: Register a Firefox Add-ons Developer Account
1. Visit the **[Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)**.
2. Log in or create a Firefox Account (FxA).
3. Set up your developer profile. (Registration is free and does not require a registration fee).

### Step 3: Submit a New Add-on
1. Click the **Submit a New Add-on** button.
2. Select your distribution option:
   - **On this site**: Firefox hosts your add-on on addons.mozilla.org (AMO) so users can find and install it directly. (Recommended).
   - **On your own**: You host and distribute the signed `.xpi` file yourself.
3. Drag and drop your `priv-whatsapp-web-firefox.zip` file.
4. The system will perform an automatic code validation check. Fix any warnings/errors if reported.

### Step 4: Describe the Add-on & Details
1. Provide a detailed summary and description of the features.
2. Set the category (e.g. **Privacy & Security** or **Social & Communication**).
3. Upload screenshots and icons (e.g., `firefox/images/icon128.png`).

### Step 5: Review & Approval
1. Submit the add-on for review.
2. Mozilla reviewers inspect the submission (manually or via automated security scripts depending on complexity).
3. Review duration ranges from **a few hours to 3 days**. Once approved, the extension is signed and listed on the AMO marketplace.

