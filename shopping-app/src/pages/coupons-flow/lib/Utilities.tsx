import NumberFormatter from "../../../lib/formatters/NumberFormatter";
import { IDiscount } from "../../../models/discount/IDiscount";

class Utilities {

    decorateDiscount = (discount: IDiscount): string => {

        const { type, details } = discount.discount;
        const { value, time } = details;

        let totalDiscount: Record<string,string> = {
            'PERCENT': `${value}% dscto`,
            'AMOUNT':  time && time > 0 
                    ? `${time} min <span class="time-dscto">dscto.</span>` 
                    : `${NumberFormatter.toCurrency(value)} dscto`
        };

        return totalDiscount[type];
    }

}

export default new Utilities();