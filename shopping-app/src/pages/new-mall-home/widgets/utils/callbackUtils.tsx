import EventStreamer from "../../../../lib/EventStreamer";
import { ICallback } from "../../../../models/widgets/ICallback";

export const generateCallback = (callback: ICallback, context: unknown) => {
  switch(callback.type) {
    case 'NAV_EXT':
      return () => {
        window.open(callback.details.url);
      }
    case 'NAV_IN_APP':
      return () => {
        switch (callback.details.method) {
          case 'REPLACE':
            EventStreamer.emit('NAVIGATE_TO', callback.details.route);
            break;
          case 'PUSH':
            EventStreamer.emit('NAVIGATE_TO_PUSH', callback.details.route);
            break;
          default:
            break;
        }
      }
    case 'NAV_IN_PAGE':
      return () => {
        (context as any)[callback.details.callback](...(callback.details.callback_args || []));
      }
    default:
      return () => {
        console.log('Type not supported')
      };
  }
}