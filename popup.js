const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
const button = document.getElementById("save-scroll");
const status = document.getElementById("status");

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

button.addEventListener("click", async () => {
  try {
    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
    
    browserAPI.tabs.sendMessage(tab.id, { type: "save-scroll-request" })
      .then(response => {
        if (response && response.success) {
          showStatus("Position saved!");
        } else {
          showStatus("Failed to save position", true);
        }
      })
      .catch(error => {
        console.error("Error sending message to content script:", error);
        showStatus("Cannot access this page", true);
      });
  } catch (error) {
    console.error("Error in popup script:", error);
    showStatus("Extension error", true);
  }
});
