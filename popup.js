const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
const saveButton = document.getElementById("save-scroll");
const clearButton = document.getElementById("clear-scroll");
const status = document.getElementById("status");
const savedInfo = document.getElementById("saved-info");
const savedYText = document.getElementById("saved-y");

function showStatus(message, isError = false) {
  status.textContent = message;
  status.style.display = "block";
  
  if (isError) {
    status.classList.add("error");
  } else {
    status.classList.remove("error");
  }
  
  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}

async function getCurrentTab() {
  try {
    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
    return tab;
  } catch (error) {
    console.error("Error getting current tab:", error);
    return null;
  }
}

async function checkSavedPosition() {
  try {
    const tab = await getCurrentTab();
    if (!tab) return;

    // Get URL parts for storage key
    const url = new URL(tab.url);
    const key = "scroll-" + url.origin + url.pathname;

    // Check if we have a saved position
    browserAPI.storage.local.get(key, (data) => {
      const scroll = data[key];
      if (scroll) {
        savedInfo.style.display = "block";
        savedYText.textContent = scroll.y;
      } else {
        savedInfo.style.display = "none";
      }
    });
  } catch (error) {
    console.error("Error checking saved position:", error);
  }
}

saveButton.addEventListener("click", async () => {
  try {
    const tab = await getCurrentTab();
    if (!tab) {
      showStatus("Cannot access current tab", true);
      return;
    }
    
    browserAPI.tabs.sendMessage(tab.id, { type: "save-scroll-request" })
      .then(response => {
        if (response && response.success) {
          showStatus("Position saved!");
          checkSavedPosition(); // Refresh the saved position display
        } else {
          showStatus("Failed to save position", true);
        }
      })
      .catch(error => {
        console.error("Error sending message to content script:", error);
        showStatus("Cannot access this page", true);
      });
  } catch (error) {
    console.error("Error in save button handler:", error);
    showStatus("Extension error", true);
  }
});

clearButton.addEventListener("click", async () => {
  try {
    const tab = await getCurrentTab();
    if (!tab) {
      showStatus("Cannot access current tab", true);
      return;
    }
    
    browserAPI.tabs.sendMessage(tab.id, { type: "clear-scroll-request" })
      .then(response => {
        if (response && response.success) {
          showStatus("Position cleared");
          savedInfo.style.display = "none";
        } else {
          showStatus("Failed to clear position", true);
        }
      })
      .catch(error => {
        console.error("Error sending message to content script:", error);
        showStatus("Cannot access this page", true);
      });
  } catch (error) {
    console.error("Error in clear button handler:", error);
    showStatus("Extension error", true);
  }
});

// When popup opens, check if we have a saved position
document.addEventListener("DOMContentLoaded", checkSavedPosition);
