declare global {
  namespace chrome {
    namespace runtime {
      interface MessageEvent {
        data: any;
        sender: chrome.runtime.MessageSender;
        sendResponse: (response: any) => void;
      }
    }
  }
}
