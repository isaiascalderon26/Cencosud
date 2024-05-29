import WithBootedClient from "../lib/WithBootedClient";
import EventStreamer from "../lib/EventStreamer";
import { App as IonicApp, URLOpenListenerEvent } from '@capacitor/app';

/**
 * Deep Linking Client
 * https://capacitor.ionicframework.com/docs/guides/deep-links/
 * 
 * IMPORTANT TO CONFIGURE CORRECTLY IN IOS
 * https://stackoverflow.com/questions/63500747/universallink-is-not-working-on-ios-14-devices-but-works-well-on-simulator
 */
class DeepLinksClient extends WithBootedClient {

  async boot(): Promise<void> {
    this.captureDeepLinks();
  }

  captureDeepLinks() {
    IonicApp.addListener("appUrlOpen", (data:URLOpenListenerEvent) => {
      console.log("APP URL OPEN", data.url);
      const url = data.url.replace(`${process.env.REACT_APP_DEEP_LINK_URL!}/`, "");
      let deeplink_split: string[] = [];
      let deeplink_id: string;
      let deeplink_params: string[] = [];

      // URI Fragment
      if (url.indexOf("#") > 0) {
        deeplink_split = url.split("#");
      }
      if (url.indexOf("?") > 0) {
        deeplink_split = url.split("?");
      }

      deeplink_id = deeplink_split[0];
      if (deeplink_split.length > 0) {
        deeplink_params = deeplink_split[1].split("&");
      }

      const params: any = {};
      deeplink_params.forEach((param) => {
        const splitted = param.split("=");
        const name = splitted[0];
        const value = splitted[1];
        params[name] = value;
      });


      console.log(`DEEPLINK:${deeplink_id.toUpperCase()}`);
      // console.log("APP URL PARAMS")


      EventStreamer.emit(`DEEPLINK:${deeplink_id.toUpperCase()}` as any, params)
    })
  }

}

export default new DeepLinksClient();
