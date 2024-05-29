class PluralizeFormatter {

    pluralize = (quantity:number) => {
        return quantity > 1 ? "s" : "";
    }
  }
  
  export default new PluralizeFormatter();