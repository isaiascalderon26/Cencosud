import { IonIcon } from '@ionic/react';
import Measure, { ContentRect } from 'react-measure';

/**
 * Style
 */
import './index.less';

/**
 * Models
 */
import ICategory from '../../../../../../models/foodie/ICategory';

/**
 * Assets
 */
import checkImage from '../../../../../../assets/media/icon-check.svg';

const UNIQUE_CLASS = 'hrcmrnmwkl'
export interface ITabData {
	name: string;
	[x: string]: any;
}

export interface ITabProps {
	data: ICategory;
	selected: boolean;
	onClick: () => void;
	onResize: (contentRect: ContentRect) => void;
}

const Tab: React.FC<ITabProps> = ({ data, selected, onClick, onResize }) => {
	let className = `tab-xcv-${UNIQUE_CLASS}`;
	if (selected) {
		className += ' selected';
	}

	return (
		<Measure bounds onResize={onResize}>
			{({ measureRef }) => (
				<div ref={measureRef} className={className} onClick={onClick}>
					<div className='tab-content'>
						<span>{data.name}</span>
						<div className='icon'>
							<IonIcon src={checkImage} />

						</div>
					</div>
				</div>
			)}
		</Measure>
	)
}

export default Tab;