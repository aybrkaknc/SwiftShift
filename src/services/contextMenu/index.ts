/**
 * Context Menu Module
 * Ana export dosyası - ContextMenuManager'ı dışarıya sunar.
 */

export { ContextMenuManager } from './menuBuilder';
export { buildPayload } from './payloadBuilder';
export type { TelegramPayloadData } from './payloadBuilder';
export { handleCaptureAndSend } from './captureHandler';
export { handleAddDestination } from './destinationHandler';
export { onClicked } from './clickHandler';
