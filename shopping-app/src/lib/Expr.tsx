import AuthenticationClient from "../clients/AuthenticationClient";
import { isPlatform } from "@ionic/react";

/**
 * Expression Class (Guard Pattern)
 */
class Expressions {

  /**
   * Execute a callback when the condition is True
   * @param {boolean} condition Expression to Check
   * @param {()=>void} callback Function to execute if the condition is True
   * @param {() => void} [falseCallback] Function to execute if the condition is False
   */
  whenTrue(condition: boolean, callback: () => void, falseCallback?: () => void) {
    if (condition) {
      callback();
    } else if (falseCallback) {
      falseCallback();
    }
  }

  /**
   ** Execute a callback when the condition is False
   * @param {boolean} condition Expression to Check
   * @param {()=>void} callback Function to execute if the condition is False
   * @param {() => void} [trueCallback] Function to execute if the condition is True
   * @memberof Expressions
   */
  whenFalse(condition: boolean, callback: () => void, trueCallback?: () => void) {
    if (!condition) {
      callback();
    } else if (trueCallback) {
      trueCallback();
    }
  }


  /**
   * Function to execute if the system are in TEST_MODE ENV = true
   * @param {() => void} callback Function to execute if the condition is True
   * @memberof Expressions
   */
  whenTestMode(callback: () => void): any {
    if (process.env.REACT_APP_TEST_MODE === 'true') {
      return callback();
    }
  }

  /**
   * Function to execute if the user has the admin or developer role
   * @param {() => void} callback Function to execute if the condition is True
   * @returns {*} 
   * @memberof Expressions
   */
  whenHasElevatePrivileges(callback: () => void): any {
    const app_client_id = process.env.REACT_APP_WALMART_PAY_APP_CLIENT_ID;
    if (AuthenticationClient.isAuthenticated() && AuthenticationClient.hasRole([
      `${app_client_id}:owner`,
      `${app_client_id}:admin`,
      `${app_client_id}:developer`
    ])) {
      return callback();
    }
  }

  whenIsRegisteredUser(callback: () => void): any {
    if (AuthenticationClient.isAuthenticated() && !AuthenticationClient.hasRole('app_user')) {
      return callback();
    }
  }

  /**
   * Function to execute if the user has the admin or developer role
   * @param {() => void} callback Function to execute if the condition is True
   * @returns {*} 
   * @memberof Expressions
   */
  whenConditionRender(condition: boolean, callback: () => void): any {
    if(condition) {
      return callback();
    }
    return <div></div>
  }

  /**
   * Execute a callback when we are in Native Phone (Capacitor)
   * @param {()=>void} callback Function to execute if we are in a native phone
   */
  whenInNativePhone(callback: () => void) {
    if (isPlatform("capacitor")) {
      callback();
    }
  }

  /**
   * Execute a callback when we are not in Native Phone (Capacitor)
   * @param {()=>void} inCallback Function to execute if we are in a native phone
   */
  whenNotInNativePhone(callback: () => void) {
    if (!isPlatform("capacitor")) {
      callback();
    }
  }

  /**
   * Execute a callback when we are not in Native Phone (Capacitor)
   * @param {()=>void} inCallback Function to execute if we are in a native phone
   */
  whenAndroid(callback: () => void, notCallback?: () => void) {
    if (isPlatform("android")) {
      callback();
    } else if (notCallback) {
      notCallback();
    }
  }

  /**
   * Execute a callback when we are in IOS Platform
   * @param {()=>void} inCallback Function to execute if we are in a native phone
   */
  whenIos(callback: () => void, notCallback?: () => void) {
    if (isPlatform("ios")) {
      callback();
    } else if (notCallback) {
      notCallback();
    }
  }

}

export default new Expressions();