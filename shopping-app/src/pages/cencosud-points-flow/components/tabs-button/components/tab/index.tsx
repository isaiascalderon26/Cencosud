import { IonIcon } from '@ionic/react';
import Measure, { ContentRect } from 'react-measure';

/**
 * Style
 */
import './index.less';

/**
 * Models
 */
 import { IExchangeCategory } from '../../../../../../models/cencosud-points/IExchange';

/**
 * Assets
 */
import checkImage from '../../../../../../assets/media/icon-check.svg';
import checkImageBackgroundWhite from '../../../../../../assets/media/icon-checked-white-bg.svg';
import { useEffect } from 'react';


export interface ITabData {
	name: string;
	[x: string]: any;
}

export interface ITabProps {
	data: IExchangeCategory;
	selected: boolean;
	onClick: (category: IExchangeCategory) => void;
	onResize: (contentRect: ContentRect) => void;
}

const Tab: React.FC<ITabProps> = ({ data, selected, onClick, onResize }) => {
	let className = 'tab-xcv';
	if (selected) {
		className += ' selected';
	}

	return (
		<Measure bounds onResize={onResize}>
			{({ measureRef }) => (
				<div ref={measureRef} className={className} onClick={() => onClick(data)}>
					<div className='tab-content'>
						<span>{data.name}</span>
						<IonIcon src={selected?checkImage:checkImageBackgroundWhite} />
					</div>
				</div>
			)}
		</Measure>
	)
}

export default Tab;
