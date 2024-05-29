import { EventEmitter } from "events";
import { Storage } from '@capacitor/storage';

/**
 * Lib
 */
import EurekaConsole from '../lib/EurekaConsole';
import WithBootedClient from "../lib/WithBootedClient";

/**
 * Models
 */
import IItem from "../models/foodie/IItem";
import IShoppingCart from "../models/foodie/IShoppingCart";

const cartKey = "@cart";
const metaKey = "@cart_meta";
const cartVersion = 1;
const eureka = EurekaConsole({ label: "shopping-cart-client" })

export interface IStats {
  /**
   * Quantity of items in the cart
   */
  quantity: number;
  /**
   * Amount in pesos that value
   * take care of selected modifiers
   */
  amount: number;
}

interface IState {
  [key: string]: IShoppingCart
}

/**
 * Shopping Cart Client
 * 
 * Manage the shopping cart in local storage
 * 
 * @class ShoppingCartClient
 */
class ShoppingCartClient extends WithBootedClient {
  private state?: IState;
  private emitter: EventEmitter;

  constructor() {
    super();
    this.emitter = new EventEmitter();
  }

  async boot(): Promise<void> {
    const [cart, meta] = await Promise.all([
      Storage.get({ key: cartKey }),
      Storage.get({ key: metaKey }),
    ]);

    if (cart && cart.value) {
      const cartState = JSON.parse(cart.value);
      const cartMeta = ( meta && meta.value) ? JSON.parse(meta.value): { version: 0 }
      this.setState(this.migrateState(cartState, cartMeta.version, cartVersion ));
    }
    eureka.info('Shopping Carts were loaded from local storage');
  }

  /**
   * Get cart
   * @param localId 
   * @returns {IShoppingCart}
   * @memberof ShoppingCartClient
   */
  getCart(localId: string): IShoppingCart {
    if (!this.state) {
      return {};
    }

    return this.state[localId] || {};
  }

  /**
   * Get cart list
   * @param localId 
   * @returns {IItem[]}
   * @memberof ShoppingCartClient
   */
  getCartList(localId: string): IItem[] {
    const cart = this.getCart(localId);
    return Object.values(cart);
  }



  /**
   * Get cart stats
   * @param localId 
   * @returns {IStats}
   * @memberof ShoppingCartClient
   */
  getCartStats(localId: string): IStats {
    return this.calculateStats(this.getCart(localId));
  }

  /**
   * Get product quantity
   * @param localId 
   * @param productId 
   * @returns 
   */
  getProductQty(localId: string, productId: string): number {
    const items = this.getCartList(localId);
    return items.reduce((acc, item) => item.product_id === productId ? acc += item.quantity : acc, 0);
  }

  /**
   * Add cart item
   * @param localId 
   * @param item 
   * @returns {Promise<void>}
   * @memberof ShoppingCartClient
   */
  async addItem(localId: string, item: IItem): Promise<void> {
    const add = { ...item, id: `${new Date().valueOf()}` };

    // already exist
    const signature = this.signature(add);
    const mach = this.getCartList(localId).find((item) => this.signature(item) === signature);
    if (mach) {
      add.id = mach.id;
      add.quantity += mach.quantity;
    }
    this.updateItem(localId, add);
  }

  /**
   * Update cart item
   * @param localId 
   * @param item 
   * @returns {Promise<void>}
   * @memberof ShoppingCartClient
   */
  async updateItem(localId: string, item: IItem): Promise<void> {
    const cart = this.getCart(localId);

    cart[item.id] = item;
    if (item.quantity <= 0) {
      delete cart[item.id];
    }
    await this.setState({
      ...this.state,
      [localId]: cart
    });

    // emit product qty updated event
    this.emitter.emit(`cart/${localId}/product/${item.product_id}/qty-updated`, this.getProductQty(localId, item.product_id));

    // emit item updated event
    this.emitter.emit(`cart/${localId}/item/${item.id}/updated`, item);

    // emit cart updated event
    this.emitter.emit(`cart/${localId}/updated`, cart);
  }

  /**
   * Clear items
   * @param localId 
   */
  async clearItems(localId: string): Promise<void> {
    const unique = new Set();
    const cart = this.getCart(localId);
    const items = this.getCartList(localId);

    items.forEach((item) => {
      const removed = { ...item, quantity: 0 };

      delete cart[removed.id];

      if (!unique.has(removed.product_id)) {
        unique.add(removed.product_id);

        // emit product qty updated event
        this.emitter.emit(`cart/${localId}/product/${removed.id}/qty-updated`, 0);
      }

      // emit item updated event
      this.emitter.emit(`cart/${localId}/item/${removed.id}/updated`, removed);
    });

    await this.setState({
      ...this.state,
      [localId]: cart
    });

    // emit cart updated event
    this.emitter.emit(`cart/${localId}/updated`, cart);
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<void> {
    await this.setState({});
  }

  /**
   * Listen to product quantity updated event
   * @param localId 
   * @param productId 
   * @param callback 
   * @returns {void}
   * @memberof ShoppingCartClient
   */
  onChangeProductQty(localId: string, productId: string, callback: (quantity: number) => void): void {
    this.emitter.on(`cart/${localId}/product/${productId}/qty-updated`, callback);
  }

  /**
   * Unsubscribe from product quantity updated event
   * @param localId 
   * @param productId 
   * @param callback 
   * @returns {void}
   * @memberof ShoppingCartClient
   */
  offChangeProductQty(localId: string, productId: string, callback: (quantity: number) => void): void {
    this.emitter.off(`cart/${localId}/product/${productId}/qty-updated`, callback);
  }

  /**
   * Listen to item updated event
   * @param localId 
   * @param itemId 
   * @param callback 
   * @returns {void}
   * @memberof ShoppingCartClient
   */
  onChangeItem(localId: string, itemId: string, callback: (item: IItem) => void): void {
    this.emitter.on(`cart/${localId}/item/${itemId}/updated`, callback);
  }

  /**
   * Unsubscribe from item updated event
   * @param localId 
   * @param itemId 
   * @param callback 
   * @returns {void}
   * @memberof ShoppingCartClient
   */
  offChangeItem(localId: string, itemId: string, callback: (quantity: number) => void): void {
    this.emitter.off(`cart/${localId}/item/${itemId}/updated`, callback);
  }

  /**
   * LIsten to cart updated event
   * @param localId 
   * @param callback 
   * @returns {void}
   * @memberof ShoppingCartClient
   */
  onChangeCart(localId: string, callback: (cart: IShoppingCart) => void): void {
    this.emitter.on(`cart/${localId}/updated`, callback);
  }

  /**
   * Unsubscribe from cart updated event
   * @param localId 
   * @param callback 
   * @returns {void}
   * @memberof ShoppingCartClient
   */
  offChangeCart(localId: string, callback: (cart: IShoppingCart) => void): void {
    this.emitter.off(`cart/${localId}/updated`, callback);
  }

  /**
   * Calculate stats over a cart
   * @param cart 
   * @returns {IStats}
   * @memberof ShoppingCartClient
   */
  calculateStats(cart: IShoppingCart): IStats {
    return Object.values(cart).reduce<IStats>((acc, item) => {
      const newAcc = { ...acc };

      const itemStats = this.calculateItemStats(item);
      newAcc.quantity += itemStats.quantity;
      newAcc.amount += itemStats.amount;

      return newAcc;
    }, { quantity: 0, amount: 0 });
  }

  /**
   * Calculate stats for all locals (cross - selling)
   * @returns {IStats}
   * @memberof ShoppingCartClient
   */
  calculateMultiOrdersStats():IStats {
    if(!this.state){
      return {
        amount: 0,
        quantity: 0
      }
    }
    return Object.entries(this.state).reduce((accumulator, obj) => {
      const stats = this.getCartStats(obj[0])
      accumulator.amount += stats.amount;
      accumulator.quantity += stats.quantity;
      return accumulator;
    }, {amount: 0, quantity: 0})
  }


  

  /**
   * Calculate item stats
   * @param item 
   * @returns {IStats}
   * @memberof ShoppingCartClient
   */
  calculateItemStats(item: IItem): IStats {
    return {
      quantity: item.quantity,
      amount: item.quantity * (item.price + item.selected_modifiers.reduce((acc, modifier) => acc += modifier.price, 0))
    }
  }

  /**
   * Get item signature
   * @param item 
   * @returns {string}
   * @memberof ShoppingCartClient
   */
  signature(item: IItem): string {
    return `${item.product_id}-${item.selected_modifiers.sort((a, b) => a.id.localeCompare(b.id)).map((s) => s.id).join('')}-${(item.comment || '').trim()}`;
  }

  private async setState(newState: IState): Promise<void> {
    this.state = newState;

    try {
      await Storage.set({
        key: cartKey,
        value: JSON.stringify(this.state)
      });
    } catch (error) {
      eureka.error('Unexpected error while setting cart state in local storage', error);
    }
  }

  private migrateState(newState: IState, oldVersion: number, newVersion: number): IState {
    let migrated = { ...newState };
    if (oldVersion === 0 && newVersion === 1) {
      // clean state
      migrated = {};
    }
    // add more steps when needed

    // after migrate update cart meta
    (async () => {
      try {
        await Storage.set({
          key: metaKey,
          value: JSON.stringify({ version: cartVersion })
        });
      } catch (error) {
        eureka.error('Unexpected error while setting cart meta in local storage', error);
      }
    })()

    return migrated;
  }

  getCartsData() {
    if(!this.state) {
      return []
    }
    const data = Object.entries(this.state).map(obj => {
      const items = this.getCartList(obj[0]);
      return {
        localId: obj[0],
        items: items
      }
    })
    return data;
  }

  getLocalsIdsWithCartItems() {
    if(!this.state){
      return [];
    }
    return Object.entries(this.state)
          .filter(l => l[1] && Object.values(l[1]).length > 0)
          .map(l => l[0])
    ;
  }

}

export default new ShoppingCartClient();

