import Measure, { ContentRect } from 'react-measure';

/**
 * Style
 */
 import './index.less';

export interface ISectionTitleProps {
    onResize: (contentRect: ContentRect) => void;
}

const SectionTitle: React.FC<ISectionTitleProps> = ({ children, onResize }) => {
    return (
        <Measure bounds onResize={onResize}>
                {({ measureRef }) => (
                    <div className='section-title-xyz'>
                        <h1 ref={measureRef} >
                            {children}
                        </h1>
                    </div>
                )}
        </Measure>
    )
}

export default SectionTitle;