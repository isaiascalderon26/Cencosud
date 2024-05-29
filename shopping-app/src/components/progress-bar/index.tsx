import React from 'react';
// styles 
import './index.less';

interface IProps {
    bgcolor: string;
    completed: number;
    showPercentage?: boolean;
    labelcolor?: string;
}

const ProgressBar: React.FC<IProps> = (props) => { 
    
    const { completed, bgcolor, showPercentage, labelcolor } =  props;
    
    const fillerStyles = {
        width: `${completed}%`,
        background: `linear-gradient(${bgcolor})`
    }
    
    const labelStyles = {
        color: labelcolor ? labelcolor : 'white',
    }

    const percent =  showPercentage && `${completed}%`;

    return (
        
        <div className="component-progress-bar">
            <div style={fillerStyles} className="component-progress-bar-body">
                <span style={labelStyles} className="label-percent">{percent}</span>
            </div>
        </div>
    );
}

export default ProgressBar;