const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

function getKey() {
  const url = new URL(window.location.href);
  return "scroll-" + url.origin + url.pathname;
}

function saveScrollPosition() {
  const scroll = { x: window.scrollX, y: window.scrollY };
  const key = getKey();
  
  console.log("💾 Content: Attempting to save scroll position", scroll);
  
  return new Promise((resolve, reject) => {
    browserAPI.runtime.sendMessage({ 
      type: "save-scroll", 
      key, 
      scroll 
    }, response => {
      if (response && response.success) {
        console.log("✅ Content: Scroll position saved successfully");
        resolve(true);
      } else {
        console.error("❌ Content: Failed to save scroll position");
        reject(new Error("Failed to save scroll position"));
      }
    });
  });
}

function loadScrollPosition() {
  const key = getKey();
  
  console.log("🔄 Content: Attempting to load scroll position for", key);
  
  return new Promise((resolve, reject) => {
    browserAPI.runtime.sendMessage({ 
      type: "get-scroll", 
      key 
    }, response => {
      if (response && response.scroll) {
        console.log("✅ Content: Retrieved scroll position", response.scroll);
        resolve(response.scroll);
      } else {
        console.log("ℹ️ Content: No saved scroll position found");
        resolve(null);
      }
    });
  });
}

function applyScrollPosition(scroll) {
  if (!scroll) return;
  
  console.log("📜 Content: Starting scroll restoration to", scroll);
  
  // Try multiple approaches to ensure scrolling works
  const scrollToPos = () => {
    // Method 1: Standard window.scrollTo
    window.scrollTo(scroll.x, scroll.y);
    
    // Method 2: Smooth scrolling
    window.scrollTo({
      left: scroll.x,
      top: scroll.y,
      behavior: 'auto'
    });
    
    // Method 3: Document element scrolling
    if (document.documentElement) {
      document.documentElement.scrollTop = scroll.y;
      document.documentElement.scrollLeft = scroll.x;
    }
    
    // Method 4: Body scrolling
    if (document.body) {
      document.body.scrollTop = scroll.y;
      document.body.scrollLeft = scroll.x;
    }
    
    console.log("📐 Content: After scroll attempt, current position:", 
                window.scrollX, window.scrollY);
  };

  // Attempt scrolling multiple times with increasing delays
  scrollToPos();
  
  // Try again after a short delay
  setTimeout(scrollToPos, 100);
  
  // And again after page has probably fully rendered
  setTimeout(scrollToPos, 500);
  
  // Final attempt after all dynamic content should be loaded
  setTimeout(scrollToPos, 1500);
}

// Initialize scroll restoration
function initScrollRestoration() {
  console.log("🚀 Content: Initializing scroll restoration");
  
  loadScrollPosition()
    .then(scroll => {
      if (scroll) {
        console.log("📜 Content: Found saved position, will restore to", scroll);
        applyScrollPosition(scroll);
      }
    })
    .catch(error => {
      console.error("❌ Content: Error loading scroll position", error);
    });
}

// Document load event
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Content: DOMContentLoaded event fired");
  // Wait briefly to allow basic rendering
  setTimeout(initScrollRestoration, 10);
});

// Window load event (after images, etc.)
window.addEventListener("load", () => {
  console.log("🖼️ Content: Window load event fired");
  // Try again after full page load
  setTimeout(initScrollRestoration, 10);
});

// REMOVED the beforeunload event listener to prevent auto-saving

// Listen for message from popup
browserAPI.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "save-scroll-request") {
    console.log("📩 Content: Received save scroll request from popup");
    
    saveScrollPosition()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("❌ Content: Error saving scroll position", error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep message channel open for async response
  }
});
