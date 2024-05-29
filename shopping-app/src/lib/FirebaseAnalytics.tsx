import "@capacitor-community/firebase-analytics";
//import { Plugins } from '@capacitor/core';
import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import EurekaConsole from "./EurekaConsole";
import Expr from "./Expr";
//const { FirebaseAnalytics } = Plugins;
const eureka = EurekaConsole({ label: "FirebaseAnalytics" });

class Analytics {
    constructor () {
        Expr.whenNotInNativePhone(() => {
        FirebaseAnalytics.initializeFirebase({
            apiKey: process.env.REACT_APP_FIREBASE_ANALYTICS_APIKEY!,
            authDomain: process.env.REACT_APP_FIREBASE_ANALYTICS_AUTH_DOMAIN!,
            projectId: process.env.REACT_APP_FIREBASE_ANALYTICS_PROJECT_ID!,
            storageBucket: process.env.REACT_APP_FIREBASE_ANALYTICS_STORAGE_BUCKET!,
            messagingSenderId: process.env.REACT_APP_FIREBASE_ANALYTICS_MESSAGGING_SENDER_ID!,
            appId: process.env.REACT_APP_FIREBASE_ANALYTICS_APP_ID!,
            measurementId: process.env.REACT_APP_FIREBASE_ANALYTICS_MEASUREMENT_ID!,
          })
          eureka.info('firebase analytics iniatilized in web')
        }) 
    }
    /**
     * Enviar nombre de pantalla a Firebase
     * @param screenName Nombre de la pantalla
     */
    async logEvent (screen_name:string) {
        try {
            await FirebaseAnalytics.logEvent({
                name: "screen_view",
                params: {
                    screen_name,
                },
            });
        } catch (error:any) {
            eureka.error('An error has occurred trying to send event to Firebase', error)
            eureka.debug(error);
        }
    }

    /**
     * Enviar nombre del evento a Firebase
     * @param name Nombre del evento
     */
    async customLogEvent (name:string, screen_name:string) {
        try {
            await FirebaseAnalytics.logEvent({
            name,
            params: {
              screen_name,
            },
            });  
        } catch (error:any) {
            eureka.error('An error has occurred trying to send event to Firebase', error)
            eureka.debug(error);
        }
    }

    /**
     * Enviar nombre del evento a Firebase
     * @param name Nombre del evento
     * @param title titulo del banner
     * @param store mall del banner
     */
    async customLogEventName (name:string, title:string, store:string, context: string, category:string, user : string = ''): Promise<void> {
      try {
        if(process.env.REACT_APP_ENVIRONMENT !== 'production') return;
          await FirebaseAnalytics.logEvent({
          name,
          params: {
            title,
            store,
            context,
            category,
            user
        },
          });  
      } catch (error:any) {
          eureka.error('An error has occurred trying to send event to Firebase', error)
          eureka.debug(error);
      }
    }
}

export default new Analytics();