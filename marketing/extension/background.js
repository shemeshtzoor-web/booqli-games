// לחיצה על האייקון פותחת את מרכז הפרסום בלשונית חדשה
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("app.html") });
});
