export interface ButtonNavigationBarItem {
  /**
   * @param {string} visible text
   */
  text?: string;
  /**
   * @param {string} visible Icon
   */
  icon?: string;
}

export interface ButtonNavigationBarProps {
  /**
   * @param {Array<ButtonNavigationBarItem>} List of items
   */
  items: Array<ButtonNavigationBarItem>;
  /**
   * @param {'top' | 'bottom'} Indicator position
   */
  indicatorPosition?: 'top' | 'bottom';
  /**
   * @param {number} Default index selected
   */
  initialIndex?: number;
  /**
   * @param {string} Custom class names
   */
  className?: string;
  /**
   * @param {void} Callback triggered after navigation item index changed
   */
  onIndexChanged?: (index: number) => void;
}
