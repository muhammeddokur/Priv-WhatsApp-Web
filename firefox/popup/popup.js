/* Privacy Extension for WhatsApp(TM) Web                       */
/* Copyright (c) 2024 Lukas Lenhardt - lukaslen.com             */
/* Released under the MIT license, see LICENSE file for details */

// Remove this upon Chrome supporting the browser namespace
if (typeof browser == "undefined") {
  // Redefine browser namespace for Chrome for interoperability with Firefox
  globalThis.browser = chrome;
}

const styleIdentifier = "pfwa";
const settingsIdentifier = "settings";

let version = browser.runtime.getManifest().version;
document.getElementById('version').innerText = version;

document.querySelectorAll('[data-locale]').forEach(e => {
  e.innerText = browser.i18n.getMessage(e.dataset.locale);
});
document.querySelectorAll('[data-localetitle]').forEach(e => {
  e.title = browser.i18n.getMessage(e.dataset.localetitle);
});
document.querySelectorAll('[data-placeholder]').forEach(e => {
  e.placeholder = browser.i18n.getMessage(e.dataset.placeholder);
});

let switches = document.querySelectorAll("input[type='checkbox']");

// Track switch changes and save settings
switches.forEach((checkbox) => {
  checkbox.addEventListener('change', saveSettings);
});
function saveSettings() {
  let id = this.dataset.style;
  let checked = this.checked;

  browser.storage.sync.get([settingsIdentifier]).then((result) => {
    if (!result.hasOwnProperty(settingsIdentifier)) {
      browser.runtime.reload();
      return;
    }
    if (id == "on") {
      result.settings.on = checked;
    } else if (id === "blurOnIdle") {
      result.settings.blurOnIdle.isEnabled = checked;
    } else if (id === "lockScreenEnabled") {
      result.settings.lockScreen.isEnabled = checked;
    } else if (id === "blurOnFocusLoss") {
      result.settings.blurOnFocusLoss = checked;
    } else if (id === "customBlurEnabled") {
      result.settings.customBlurEnabled = checked;
    } else {
      result.settings.styles[id] = checked;
    }
    browser.storage.sync.set(result);
  });
}

// toggle open/close blur amount settings
const showBlurSettings = (ev) => {
  ev.currentTarget.classList.toggle("active");
  ev.currentTarget.parentNode.querySelector(".collapsible").classList.toggle("show");
}
const revealButtons = document.querySelectorAll(".reveal-btn");
revealButtons.forEach((revealBtn) => {
  revealBtn.addEventListener("click", showBlurSettings)
})

// track form save/submit for variable style settings
const forms = document.querySelectorAll("form.var-style");

forms.forEach((form) => {
  form.addEventListener("submit", saveFormSettings);
})
function saveFormSettings(ev) {
  ev.preventDefault();
  const [key, val] = Object.entries(Object.fromEntries(new FormData(ev.target)))[0];

  browser.storage.sync.get([settingsIdentifier]).then((result) => {
    if (!result.hasOwnProperty(settingsIdentifier)) {
      browser.runtime.reload();
      return;
    }
    if (key === "itBlur") {
      result.settings.blurOnIdle.idleTimeout = val;
    } else {
      result.settings.varStyles[key] = val + "px";
    }
    browser.storage.sync.set(result);
  });
}

// Load settings and update switches
browser.storage.sync.get([settingsIdentifier]).then((result) => {
  if (!result.hasOwnProperty(settingsIdentifier)) {
    browser.runtime.reload();
    return;
  }

  switches.forEach((checkbox) => {
    let id = checkbox.dataset.style;
    if (id == "on") {
      checkbox.checked = result.settings.on;
    } else if (id === "blurOnIdle") {
      checkbox.checked = result.settings?.blurOnIdle?.isEnabled;
    } else if (id === "lockScreenEnabled") {
      checkbox.checked = result.settings?.lockScreen?.isEnabled;
    } else if (id === "blurOnFocusLoss") {
      checkbox.checked = result.settings?.blurOnFocusLoss;
    } else if (id === "customBlurEnabled") {
      checkbox.checked = result.settings?.customBlurEnabled;
    } else {
      checkbox.checked = result.settings.styles[id];
    }
  });

  // set variable input value
  forms.forEach((form) => {
    const numInput = form.querySelector(`input[type="number"]`)
    const varName = numInput.dataset.varName;
    if (varName === "itBlur") {
      numInput.value = parseInt(result.settings?.blurOnIdle?.idleTimeout || 15);
    } else {
      numInput.value = parseInt(result.settings.varStyles[varName]);
    }
  })

  // load lockScreen values
  if (result.settings.lockScreen) {
    document.getElementById("lockScreenTimeout").value = result.settings.lockScreen.idleTimeout || 60;
  }

  // load custom chats list
  renderCustomChatsList(result.settings.customBlurList || []);
  
});

// Simple Hash function for password
function hashPassword(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

// Custom chats list renderer
function renderCustomChatsList(list) {
  const container = document.getElementById("customChatsList");
  if (!container) return;
  container.textContent = "";
  if (!list || list.length === 0) {
    const noChatsDiv = document.createElement("div");
    noChatsDiv.style.color = "#888";
    noChatsDiv.style.textAlign = "center";
    noChatsDiv.style.padding = "5px";
    noChatsDiv.textContent = "No chats added.";
    container.appendChild(noChatsDiv);
    return;
  }
  list.forEach(name => {
    const div = document.createElement("div");
    div.style = "display: flex; justify-content: space-between; align-items: center; padding: 2px 5px; border-bottom: 1px solid #f0f0f0;";
    
    const spanName = document.createElement("span");
    spanName.textContent = name;

    const spanRemove = document.createElement("span");
    spanRemove.className = "remove-chat-btn";
    spanRemove.dataset.name = name;
    spanRemove.style.color = "red";
    spanRemove.style.cursor = "pointer";
    spanRemove.style.fontWeight = "bold";
    spanRemove.style.fontSize = "12px";
    spanRemove.style.padding = "0 4px";
    spanRemove.textContent = "×";

    div.appendChild(spanName);
    div.appendChild(spanRemove);
    container.appendChild(div);
  });

  document.querySelectorAll(".remove-chat-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const nameToRemove = this.dataset.name;
      browser.storage.sync.get([settingsIdentifier]).then((result) => {
        if (!result.hasOwnProperty(settingsIdentifier)) return;
        result.settings.customBlurList = (result.settings.customBlurList || []).filter(n => n !== nameToRemove);
        browser.storage.sync.set(result).then(() => {
          renderCustomChatsList(result.settings.customBlurList);
        });
      });
    });
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Event Listeners for Lock Screen
document.getElementById("saveLockPassword").addEventListener("click", () => {
  const pwdInput = document.getElementById("lockPassword");
  const pwd = pwdInput.value.trim();
  if (!pwd) return;
  browser.storage.sync.get([settingsIdentifier]).then((result) => {
    if (!result.hasOwnProperty(settingsIdentifier)) return;
    if (!result.settings.lockScreen) result.settings.lockScreen = {};
    result.settings.lockScreen.passwordHash = hashPassword(pwd);
    browser.storage.sync.set(result).then(() => {
      pwdInput.value = "";
      pwdInput.placeholder = browser.i18n.getMessage("placeholderSetPassword") === "Şifre Belirle" ? "Şifre Ayarlandı!" : "Password Set!";
      setTimeout(() => { pwdInput.placeholder = browser.i18n.getMessage("placeholderSetPassword"); }, 2000);
    });
  });
});

document.getElementById("saveLockTimeout").addEventListener("click", () => {
  const timeoutInput = document.getElementById("lockScreenTimeout");
  const timeoutVal = parseInt(timeoutInput.value) || 60;
  browser.storage.sync.get([settingsIdentifier]).then((result) => {
    if (!result.hasOwnProperty(settingsIdentifier)) return;
    if (!result.settings.lockScreen) result.settings.lockScreen = {};
    result.settings.lockScreen.idleTimeout = timeoutVal;
    browser.storage.sync.set(result);
  });
});

document.getElementById("lockNowBtn").addEventListener("click", () => {
  browser.storage.sync.get([settingsIdentifier]).then((result) => {
    if (!result.hasOwnProperty(settingsIdentifier)) return;
    if (result.settings.lockScreen?.passwordHash) {
      result.settings.lockScreen.isLocked = true;
      browser.storage.sync.set(result);
    } else {
      alert("Please set a password first.");
    }
  });
});

// Event Listeners for Custom Chat Blur
document.getElementById("addCustomChatBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("newCustomChatName");
  const nameVal = nameInput.value.trim().toLowerCase();
  if (!nameVal) return;
  browser.storage.sync.get([settingsIdentifier]).then((result) => {
    if (!result.hasOwnProperty(settingsIdentifier)) return;
    if (!result.settings.customBlurList) result.settings.customBlurList = [];
    if (!result.settings.customBlurList.includes(nameVal)) {
      result.settings.customBlurList.push(nameVal);
      browser.storage.sync.set(result).then(() => {
        nameInput.value = "";
        renderCustomChatsList(result.settings.customBlurList);
      });
    }
  });
});

document.getElementById("addActiveChatBtn").addEventListener("click", () => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs.length === 0) return;
    browser.tabs.sendMessage(tabs[0].id, { action: "getActiveChatName" }).then((response) => {
      if (response && response.chatName) {
        const nameToAdd = response.chatName.trim().toLowerCase();
        if (!nameToAdd) return;
        browser.storage.sync.get([settingsIdentifier]).then((result) => {
          if (!result.hasOwnProperty(settingsIdentifier)) return;
          if (!result.settings.customBlurList) result.settings.customBlurList = [];
          if (!result.settings.customBlurList.includes(nameToAdd)) {
            result.settings.customBlurList.push(nameToAdd);
            browser.storage.sync.set(result).then(() => {
              renderCustomChatsList(result.settings.customBlurList);
            });
          }
        });
      }
    }).catch(err => {
      console.log("Could not message contentScript. Is WhatsApp open?", err);
    });
  });
});