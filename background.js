const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "save-scroll") {
    browserAPI.storage.local.set({ [msg.key]: msg.scroll }, () => {
      console.log("✅ Background: Saved scroll for", msg.key, msg.scroll);
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }
  
  if (msg.type === "get-scroll") {
    browserAPI.storage.local.get(msg.key, (data) => {
      console.log("🔍 Background: Retrieved scroll data", msg.key, data[msg.key]);
      sendResponse({ scroll: data[msg.key] });
    });
    return true; // Keep message channel open for async response
  }
  
  if (msg.type === "clear-scroll") {
    browserAPI.storage.local.remove(msg.key, () => {
      console.log("🧹 Background: Cleared scroll data for", msg.key);
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }
});
