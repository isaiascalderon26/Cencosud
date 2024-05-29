import React from 'react';
import {
  ContentDescription,
  ContentSubTitle,
  ContentTitle,
  Content,
  Grid,
  Image,
  ImageContent,
  Logo,
} from './style';
interface IProps {
  orientation: 'horizontal' | 'vertical' | 'square';
  height: string;
  width: string;
  image?: string;
  logo?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  cssClass?: string | string[];
  callback?: (value: any) => void;
}

export const Card: React.FC<IProps> = ({
  height,
  width,
  logo,
  callback,
  image,
  title,
  subtitle,
  description,
  orientation,
  cssClass,
}) => {
  const _cssClass = ['card-components-lkjmf'];
  if (cssClass) {
      _cssClass.push(...(typeof cssClass === 'string' ? [cssClass] : cssClass));
  }
  return (
    <Grid
      className={`card-components-lkjmf ${cssClass}`}
      onClick={callback}
      height={height}
      width={width}
      orientation={orientation}
    >
			<ImageContent className='card-image' orientation={orientation}>
				<Image image={image!} />
			</ImageContent>
      {['horizontal', 'vertical'].includes(orientation) && (
        <>
          <Logo className='card-logo' image={logo!} />
          <Content>
            {title && (
              <ContentTitle className="card-title" orientation={orientation}>
                {title}
              </ContentTitle>
            )}
            {subtitle && (
              <ContentSubTitle className="card-subtitle">
                {subtitle}
              </ContentSubTitle>
            )}
            {description && (
              <ContentDescription className="card-description">
                {description}
              </ContentDescription>
            )}
          </Content>
        </>
      )}
    </Grid>
  );
};
