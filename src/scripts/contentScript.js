/* Priv WhatsApp Web                                            */
/* Copyright (c) 2024 Lukas Lenhardt - lukaslen.com             */
/* Copyright (c) 2026 Muhammed Erkam DOKUR                      */
/* Released under the MIT license, see LICENSE file for details */

// Remove this upon Chrome supporting the browser namespace
if (typeof browser == "undefined") {
  // Redefine browser namespace for Chrome for interoperability with Firefox
  globalThis.browser = chrome;
}

const styleIdentifier = "pfwa";
const settingsIdentifier = "settings";

let isFocusLossBlurEnabled = false;
let customBlurEnabled = false;
let customBlurList = [];
let lockTimerObj = null;

function removeStyleById(id) {
  let el;
  if(el=document.getElementById(id)){
    el.parentNode.removeChild(el);
  }
}

function removeAllStyles() {
  var el = document.getElementsByClassName(styleIdentifier);
  while (el.length > 0) {
    el[0].parentNode.removeChild(el[0]);
  }
}

function addStyleById(id) {
  if (document.getElementById(id)) return;

  var link = document.createElement('link');
  link.id = id;
  link.className = styleIdentifier;
  link.href = browser.runtime.getURL('css/'+id+'.css');
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}

// variable style
function addVarStyle([varName, value]) {
  if (document.getElementById(varName)) removeStyleById(varName);

  const kebabize = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (s, ofs) => (ofs ? "-" : "") + s.toLowerCase());

  const innerText = `
  #whatsapp-web body {
    --${kebabize(varName)}: ${value};
  }
  `

  const varStyleEl = document.getElementById(varName);
  if (varStyleEl) {
    varStyleEl.innerText = innerText;
    return;
  };

  var styleEl = document.createElement('style');
  styleEl.id = varName;
  styleEl.className = "pfwa-variables";
  styleEl.innerText = innerText;
  document.getElementsByTagName("head")[0].appendChild(styleEl);
}

function updateStyles(changes) {
  injectCustomBlurStyle();

  browser.storage.sync.get([settingsIdentifier]).then((result) => {
    if (result == null) return;

    // Handle Lock Screen state
    const lockScreen = result.settings.lockScreen;
    if (lockScreen && lockScreen.isEnabled && lockScreen.isLocked && lockScreen.passwordHash) {
      showLockScreen(lockScreen.passwordHash);
    } else {
      const lockEl = document.getElementById("pfwa-lock-screen");
      if (lockEl) {
        lockEl.remove();
        document.body.style.overflow = "";
      }
    }

    // Set lock screen idle timer
    setLockScreenIdle(changes, result);

    // Focus Loss Blur Setting
    isFocusLossBlurEnabled = !!result.settings.blurOnFocusLoss;

    // Custom/Selective Blur Settings
    customBlurEnabled = !!result.settings.customBlurEnabled;
    customBlurList = result.settings.customBlurList || [];
    runCustomBlurCheck();

    if (!result.settings.on) {
      removeAllStyles();
      
      if (timers?.timerObj) {
        removeTimer();
      }

      return;
    }
    
    var styles = Object.keys(result.settings.styles);
    styles.forEach((style) => {
      if (result.settings.styles[style]) {
        addStyleById(style);
      } else {
        removeStyleById(style);
      }
    });

    // update variable styles
    const varStyles = Object.entries(result.settings.varStyles);
    varStyles.forEach((varStyle) => {
      addVarStyle(varStyle);
    })
    
    // update blur on idle
    setBlurOnIdle(changes, result);

  });
}

// Update styles on setting change
browser.storage.onChanged.addListener((changes, area) => {
  if (area == "sync" && changes.settings != null) {
    updateStyles(changes);
  }
});

// Initial update once page loaded
updateStyles();

/**
 * timer
 *
 * Run idleCallback if user idle for idleTime,
 * then run activeCallback if any events happen
 * 
 * @param {Object} opts
 * @param {function} opts.idleCallback - fired when user is idle
 * @param {function} opts.activeCallback - fired when user is active
 * @param {number} opts.idleTime - time in milliseconds  
 * @param {[string]} [opts.events] - event listeners. Default to : ["pointermove", "pointerdown", "keydown"]
 * 
 */
const timer = (opts) => {
  let options = opts || {};
  const idleCallback = options.idleCallback || function () { };
  const activeCallback = options.activeCallback || function () { };
  const idleTime = options.idleTime || 1000;
  const events = options.events || ["pointermove", "pointerdown", "keydown"];
  let isActive = true;
  let isEnabled = true;
  let timerId;

  function addOrRemoveEvents(addOrRemove) {
    events.forEach((eventName) => {
      document[addOrRemove](eventName, triggerActive);
    });
  }

  function enable() {
    isEnabled = true;
    addOrRemoveEvents("addEventListener");
    triggerActive();
  }

  function triggerActive() {
    if (!isActive) {
      isActive = true;
      activeCallback();
    }
    clearTimeout(timerId);
    timerId = setTimeout(triggerIdle, idleTime);
  }
  
  function triggerIdle() {
    if (!isActive) return;
    isActive = false;
    idleCallback();
  }

  function disable() {
    isActive = true;
    isEnabled = false;
    clearTimeout(timerId);
    addOrRemoveEvents('removeEventListener');
  }

  return {
    isEnabled: () => isEnabled,
    enable: enable,
    disable: disable,
    triggerActive: triggerActive,
    triggerIdle: triggerIdle
  };
}

const timers = {};

// blur page 
const blurBody = () => {
  document.body.style.filter = "blur(var(--wi-blur)) grayscale(1)";
  document.body.style.transition = "filter .3s linear";
}
// unblur page 
const unblurBody = () => {
  document.body.style.filter = "";
}

// disable and remove timer if exist
const removeTimer = () => {
  timers.timerObj.triggerActive();
  timers.timerObj.disable();
  delete timers.timerObj;
}

const setBlurOnIdle = (changes, result) => {

  const previousState = changes?.settings?.oldValue?.blurOnIdle;
  const currentState = changes?.settings?.newValue?.blurOnIdle ?? result.settings?.blurOnIdle;
  const isPreviousEnabled = previousState?.isEnabled;
  const isCurrentEnabled = currentState?.isEnabled;
  const isBlurOnIdleChanged = isPreviousEnabled !== isCurrentEnabled;
  const isIdleTimeoutChanged = previousState?.idleTimeout !== currentState?.idleTimeout;

  if (isCurrentEnabled && (isBlurOnIdleChanged || changes?.settings?.oldValue?.on === false)) {
    if (timers?.timerObj) {
      removeTimer();
    }
    // create new timer
    const newTimer = timer({
      idleCallback: blurBody,
      activeCallback: unblurBody,
      idleTime: parseInt(currentState?.idleTimeout * 1000 || 15000),
    });
    timers.timerObj = newTimer;
    timers.timerObj.enable();
  } else if (isCurrentEnabled && isBlurOnIdleChanged === false) {
    if (isIdleTimeoutChanged) {
      if (timers?.timerObj) {
        removeTimer();
      }
      // then create new timer
      const newTimer = timer({
        idleCallback: blurBody,
        activeCallback: unblurBody,
        idleTime: parseInt(currentState?.idleTimeout * 1000 || 15000),
      });
      timers.timerObj = newTimer;
      timers.timerObj.enable();
    }
  } else if (isCurrentEnabled === false && isBlurOnIdleChanged) {
    if (timers?.timerObj) {
      removeTimer();
    }
  }

}

// Simple Hash function for password
function hashPassword(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

// Inject override CSS styles for selective blur and focus-lost blur
function injectCustomBlurStyle() {
  const styleId = "pfwa-custom-blur-style";
  if (document.getElementById(styleId)) return;
  const styleEl = document.createElement("style");
  styleEl.id = styleId;
  styleEl.innerText = `
    .pfwa-custom-no-blur,
    .pfwa-custom-no-blur * {
      filter: none !important;
      transition: none !important;
    }
    body.pfwa-custom-blur-inactive-chat #main,
    body.pfwa-custom-blur-inactive-chat #main * {
      filter: none !important;
      transition: none !important;
    }
    body.pfwa-focus-lost {
      filter: blur(15px) !important;
      transition: filter 0.15s ease-in-out !important;
    }
  `;
  document.getElementsByTagName("head")[0].appendChild(styleEl);
}

// Custom / Selective Blur check
function runCustomBlurCheck() {
  if (!customBlurEnabled) {
    document.body.classList.remove("pfwa-custom-blur-inactive-chat");
    document.querySelectorAll('.pfwa-custom-no-blur').forEach(el => el.classList.remove('pfwa-custom-no-blur'));
    return;
  }

  // 1. Scan sidebar list items
  const listItems = document.querySelectorAll('div[data-testid^="list-item-"]');
  listItems.forEach(item => {
    const titleEl = item.querySelector('div[data-testid="cell-frame-title"] span');
    if (titleEl) {
      const name = titleEl.innerText.trim().toLowerCase();
      if (customBlurList.includes(name)) {
        item.classList.remove('pfwa-custom-no-blur');
      } else {
        item.classList.add('pfwa-custom-no-blur');
      }
    }
  });

  // 2. Scan active chat header
  const header = document.querySelector('header[data-testid="conversation-header"]');
  if (header) {
    const titleEl = header.querySelector('span[title]') || header.querySelector('div[role="button"] span');
    if (titleEl) {
      const name = (titleEl.getAttribute('title') || titleEl.innerText).trim().toLowerCase();
      if (customBlurList.includes(name)) {
        document.body.classList.remove("pfwa-custom-blur-inactive-chat");
      } else {
        document.body.classList.add("pfwa-custom-blur-inactive-chat");
      }
    } else {
      document.body.classList.add("pfwa-custom-blur-inactive-chat");
    }
  } else {
    document.body.classList.remove("pfwa-custom-blur-inactive-chat");
  }
}

// MutationObserver for Selective Blur
let customBlurTimeout = null;
const customBlurObserver = new MutationObserver(() => {
  if (!customBlurEnabled) return;
  if (customBlurTimeout) clearTimeout(customBlurTimeout);
  customBlurTimeout = setTimeout(runCustomBlurCheck, 150);
});
customBlurObserver.observe(document.body, { childList: true, subtree: true });

// Focus Loss Blur Handlers
function handleWindowBlur() {
  if (isFocusLossBlurEnabled) {
    document.body.classList.add("pfwa-focus-lost");
  }
}
function handleWindowFocus() {
  document.body.classList.remove("pfwa-focus-lost");
}
window.addEventListener('blur', handleWindowBlur);
window.addEventListener('focus', handleWindowFocus);

// Lock Screen overlay
function showLockScreen(passwordHash) {
  if (document.getElementById("pfwa-lock-screen")) return;

  const overlay = document.createElement("div");
  overlay.id = "pfwa-lock-screen";
  overlay.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999999;
    background: rgba(10, 15, 30, 0.75);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;

  overlay.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 30px; width: 300px; text-align: center; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); backdrop-filter: blur(5px);">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" style="color: #00d2ff; margin-bottom: 15px;">
        <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1c1.71 0 3.1 1.39 3.1 3.1z"/>
      </svg>
      <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">WhatsApp Web Locked</h2>
      <p style="color: #ccc; font-size: 12px; margin-bottom: 20px;">Enter your password to unlock</p>
      <input type="password" id="pfwa-lock-pwd-input" placeholder="Password" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; background: rgba(0, 0, 0, 0.2); color: white; text-align: center; outline: none; font-size: 16px; margin-bottom: 15px; transition: border 0.3s;">
      <button id="pfwa-unlock-btn" style="width: 100%; padding: 10px; border: none; border-radius: 8px; background: #00d2ff; color: white; font-weight: bold; cursor: pointer; font-size: 14px; transition: background 0.2s;">Unlock</button>
      <div id="pfwa-lock-error" style="color: #ff4d4d; font-size: 12px; margin-top: 10px; height: 15px;"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const input = document.getElementById("pfwa-lock-pwd-input");
  const btn = document.getElementById("pfwa-unlock-btn");
  const errorDiv = document.getElementById("pfwa-lock-error");

  input.focus();

  const shakeInput = () => {
    input.style.border = "1px solid #ff4d4d";
    input.style.transform = "translateX(5px)";
    setTimeout(() => input.style.transform = "translateX(-5px)", 50);
    setTimeout(() => input.style.transform = "translateX(5px)", 100);
    setTimeout(() => input.style.transform = "translateX(0)", 150);
    setTimeout(() => { input.style.border = "1px solid rgba(255,255,255,0.3)"; }, 1000);
  };

  const handleUnlock = () => {
    const val = input.value;
    if (hashPassword(val) === passwordHash) {
      overlay.remove();
      document.body.style.overflow = "";
      browser.storage.sync.get([settingsIdentifier]).then((res) => {
        if (res && res.settings) {
          res.settings.lockScreen.isLocked = false;
          browser.storage.sync.set(res);
        }
      });
      if (lockTimerObj) lockTimerObj.triggerActive();
    } else {
      errorDiv.innerText = "Incorrect Password!";
      shakeInput();
      input.value = "";
    }
  };

  btn.addEventListener("click", handleUnlock);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUnlock();
  });

  overlay.addEventListener("keydown", (e) => { e.stopPropagation(); });
  overlay.addEventListener("keypress", (e) => { e.stopPropagation(); });
  overlay.addEventListener("keyup", (e) => { e.stopPropagation(); });
}

// Lock Screen Idle Timer Setup
const setLockScreenIdle = (changes, result) => {
  const previousState = changes?.settings?.oldValue?.lockScreen;
  const currentState = changes?.settings?.newValue?.lockScreen ?? result.settings?.lockScreen;
  const isPreviousEnabled = previousState?.isEnabled;
  const isCurrentEnabled = currentState?.isEnabled;
  const isLockScreenChanged = isPreviousEnabled !== isCurrentEnabled;
  const isTimeoutChanged = previousState?.idleTimeout !== currentState?.idleTimeout;

  if (isCurrentEnabled && currentState?.passwordHash) {
    if (isLockScreenChanged || changes?.settings?.oldValue?.on === false || isTimeoutChanged) {
      if (lockTimerObj) {
        lockTimerObj.disable();
        lockTimerObj = null;
      }
      lockTimerObj = timer({
        idleCallback: () => {
          browser.storage.sync.get([settingsIdentifier]).then((res) => {
            if (res && res.settings) {
              res.settings.lockScreen.isLocked = true;
              browser.storage.sync.set(res);
            }
          });
        },
        activeCallback: () => {},
        idleTime: parseInt(currentState.idleTimeout * 1000 || 60000),
      });
      lockTimerObj.enable();
    }
  } else {
    if (lockTimerObj) {
      lockTimerObj.disable();
      lockTimerObj = null;
    }
  }
};

// Keydown listener for page-wide Alt+X and Alt+L hotkeys
window.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key === 'x' || e.key === 'X' || e.code === 'KeyX')) {
    e.preventDefault();
    browser.storage.sync.get([settingsIdentifier]).then((result) => {
      if (result && result.settings) {
        result.settings.on = !result.settings.on;
        browser.storage.sync.set(result);
      }
    });
  }
  if (e.altKey && (e.key === 'l' || e.key === 'L' || e.code === 'KeyL')) {
    e.preventDefault();
    browser.storage.sync.get([settingsIdentifier]).then((result) => {
      if (result && result.settings?.lockScreen?.isEnabled && result.settings?.lockScreen?.passwordHash) {
        result.settings.lockScreen.isLocked = true;
        browser.storage.sync.set(result);
      }
    });
  }
});

// Runtime messages listener
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getActiveChatName") {
    const header = document.querySelector('header[data-testid="conversation-header"]');
    if (header) {
      const titleEl = header.querySelector('span[title]') || header.querySelector('div[role="button"] span');
      if (titleEl) {
        sendResponse({ chatName: titleEl.getAttribute('title') || titleEl.innerText });
        return true;
      }
    }
    sendResponse({ chatName: null });
  }
  return true;
});
