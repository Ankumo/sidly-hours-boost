import { EventEmitter } from 'stream';
import { SSEDataEmitterHandler } from './events.types';

export class SSEDataEmitter extends EventEmitter {
    sub(handler: SSEDataEmitterHandler) {
        this.on('data', handler);
        return handler;
    }

    unsub(handler: SSEDataEmitterHandler) {
        this.off('data', handler);
    }

    emitData: SSEDataEmitterHandler = (...args) => {
        return this.emit('data', ...args);
    };
}
