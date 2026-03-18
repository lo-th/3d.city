/**
 * Test setup: initialise Micro.messageManager so that EventEmitter.emitEvent()
 * doesn't throw when simulation classes fire events during tests.
 */
import { Micro } from '../src/micro/Micro.js';
import { MessageManager } from '../src/micro/MessageManager.js';

// Give every test a fresh message queue
export function setupMicro() {
    Micro.messageManager = new MessageManager();
    return Micro.messageManager;
}
