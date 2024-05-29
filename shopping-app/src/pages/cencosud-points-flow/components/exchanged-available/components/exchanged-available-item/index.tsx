import { IonIcon } from '@ionic/react';

/**
 * Style
 */
import './index.less';

/**
 * Models
 */
 import IExchange from '../../../../../../models/cencosud-points/IExchange';

/**
 * Assets
 */
import iconMiMallPurple from '../../../../../../assets/media/icon-mimall-purple.svg';

/**
* Libs
*/
import NumberFormatter from '../../../../../../lib/formatters/NumberFormatter';
export interface IExchangedAvailableItemProps {
	exchange: IExchange
}

const ExchangedAvailableItem: React.FC<IExchangedAvailableItemProps> = ({exchange}) => {

	return (
		<div className='exchanged-available-item' style={{
			backgroundImage: `linear-gradient(360deg,#00000080 8%,#00000000 92%), url(${exchange.content.image})`,
		  }}>
			<div className='points-container'>
				<div className='points'><IonIcon icon={iconMiMallPurple}/> <span>{NumberFormatter.toNumber(exchange.exchange_amount.from)}</span></div>
			</div>
			<div className='info'>
				<div className='title'>{exchange.content.title}</div>
				<div className='subtitle'>{exchange.content.subtitle}</div>
			</div>
		</div>
	)
}

export default ExchangedAvailableItem
