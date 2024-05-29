import { getApps } from "firebase/app";

import WithBootedClient from "../lib/WithBootedClient";
import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import EurekaConsole from '../lib/EurekaConsole';
import Expr from '../lib/Expr';

const eureka = EurekaConsole({ label: "analitycs" });

/**
 * Analytics Client (Firebase)
 */
class AnalyticsClient extends WithBootedClient {

  async boot(): Promise<void> {

     Expr.whenNotInNativePhone(() => {
       //if (!getApps().length) {
        FirebaseAnalytics.initializeFirebase({
          apiKey: process.env.REACT_APP_FIREBASE_ANALYTICS_APIKEY!,
          authDomain: process.env.REACT_APP_FIREBASE_ANALYTICS_AUTH_DOMAIN!,
          projectId: process.env.REACT_APP_FIREBASE_ANALYTICS_PROJECT_ID!,
          storageBucket: process.env.REACT_APP_FIREBASE_ANALYTICS_STORAGE_BUCKET!,
          messagingSenderId: process.env.REACT_APP_FIREBASE_ANALYTICS_MESSAGGING_SENDER_ID!,
          appId: process.env.REACT_APP_FIREBASE_ANALYTICS_APP_ID!,
          measurementId: process.env.REACT_APP_FIREBASE_ANALYTICS_MEASUREMENT_ID!,
        });
      //}

      eureka.info('firebase analytics iniatilized in web')
    }) 
  }
  
  /**
   * Platform: Web/Android/iOS
   * Sets the user ID property.
   * @param userId - unique identifier of a user
   * @returns void
   * https://firebase.google.com/docs/analytics/userid
  */
  async setUserId(userId: string): Promise<void>{
    FirebaseAnalytics.setUserId({userId});
  }

  /**
   * Platform: Web/Android/iOS
   * Sets a user property to a given value.
   * @param options - property name and value to set
   * @returns void
   * https://firebase.google.com/docs/analytics/user-properties
   */
  async setUserProperty(userId: string): Promise<void>{
    FirebaseAnalytics.setUserProperty({
      name : "crm_id",
      value: userId
    });
  }
  

  /**
   * 
   * @param action Action executed
   * @param view View from the action is executed
   * @param params Additional parameteres to add in analytics
   */
  registerAction(action: string, view: string, params?: { [key: string]: string }) {
   
    FirebaseAnalytics.logEvent({
      name: action,
      params: {
        view,
        ...params
      }
    })
  }

  /**
   * 
   * @param view View name navigated
   * @param params Additional parameteres to add in analytics
   */
  registerView(view: string, params?: { [key: string]: string }) {
    FirebaseAnalytics.logEvent({
      name: "view",
      params: {
        view,
        ...params
      }
    })
  }
}

export default new AnalyticsClient();
