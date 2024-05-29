import Job from '../lib/Job';
import EurekaConsole from '../lib/EurekaConsole';
import { FCM } from '@capacitor-community/fcm';
import Expr from '../lib/Expr';
import SnapshotClient from '../clients/SnapshotClient';

const eureka = EurekaConsole({ label: "push-job" });

class PushNotificationsJob extends Job {
  constructor() {
    super({
      runEveryInSeconds: 86400, /* Every 24 hours */
      waitBeforeFirstRunInSeconds: 1
    });
  }

  /**
   * Subscribe to Push Notification Service
   * @memberof PushNotificationsJob
   */
  async doTheJob() {
    Expr.whenInNativePhone(async () => {
      const fcmToken = await FCM.getToken();

      SnapshotClient.takeSnapshot("NOTIFICATION_TOKEN", { notification_token: fcmToken.token });

      eureka.debug(`notification token obtained ${fcmToken.token}`)
    })
  }

  async onReceivePushNotification(pushMessage: IFCMPushNotification, actionId?: string) {

    // According to the push message notification category
    switch (pushMessage.data.category.toUpperCase()) {
      case "PAYMENT_CALLBACK":
        //alert('Push received: ' + JSON.stringify(pushMessage));
        //eureka.debug('push received', pushMessage.data.category)
        //console.log(JSON.stringify(pushMessage.data.meta_data));
        //  eureka.debug('push received', pushMessage.data.meta_data)
        // Parse the metada of the PAYMENT Structure
        const metadata: IPaymentMetadataPushNotification = JSON.parse(pushMessage.data.meta_data);
        //EventStreamer.emit("DEEPLINK:PAYMENT_CALLBACK", metadata)

        break;
      default:
        eureka.error('category undefined: ', pushMessage.data.category.toUpperCase())
        eureka.debug(pushMessage.data.meta_data)
        break;
    }
  }
}


export interface IFCMNotficationData {
  category: "PAYMENT_CALLBACK",
  meta_data: string
  "gcm.message_id": string,
}

export interface IFCMPushNotification extends Notification {
  data: IFCMNotficationData
}

export interface IPaymentCodeCallbackPushNotification {
}

export interface IPaymentMetadataPushNotification {
  merchant: IPaymentMerchantCallbackPushNotification,
  description: string,
  amount: {
    currency: "CLP" | "USD",
    total: number
  },
  cards_total: number,
  links: IPaymentLinkCallbackPushNotification[]
}

export interface IPaymentLinkCallbackPushNotification {
  metadata: {
    card_last_four: number,
    card_type: "Visa" | "Mastercard" | "Redcompra"
  },
  method: "POST" | "PUT" | "PATCH",
  rel: "seamless_pay",
  href: string
}

export interface IPaymentMerchantCallbackPushNotification {
  name: string,
  avatar: string,
  branch_office: {
    name: String,
    id: string
  }
}

export default new PushNotificationsJob();