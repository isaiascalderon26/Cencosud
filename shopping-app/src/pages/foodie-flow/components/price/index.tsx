/**
 * Style
 */
import './index.less';

/**
 * Components
 */

/**
 * Lib
 */
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';

/**
 * Clients
 */

/**
 * Models
 */
import IProduct from '../../../../models/foodie/IProduct';

/**
 * Assets
 */

export interface IPriceProps {
    data: IProduct;
}

const Price: React.FC<IPriceProps> = ({ data }) => {
    return (
        <div className='price-container-xyza'>
            {data.reference_price && <span className='percent_discount'>-{Math.round(100 - (data.price * 100 / data.reference_price))}%</span>}
            {data.reference_price && <span className='price'>{`CLP ${NumberFormatter.toCurrency(data.price)}`}</span>}
            <span className={`price ${data.reference_price && 'discount'}`}>{`CLP ${NumberFormatter.toCurrency(data.reference_price || data.price)}`}</span>
        </div>
    )
}

export default Price;