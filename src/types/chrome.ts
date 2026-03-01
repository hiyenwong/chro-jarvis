import { PluginMessage } from './index';

declare global {
  interface ChromeRuntimeMessageEvent {
    data: PluginMessage;
    sender: chrome.runtime.MessageSender;
    sendResponse: (response: unknown) => void;
  }
}