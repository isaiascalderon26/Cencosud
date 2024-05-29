import sc from 'styled-components';
import type { IContentTitleStyle, IGridStyle, IImageContentStyle, IImageStyle } from './types-card';

export const Grid = sc.div<IGridStyle>`
	background: #FFF;
	border-radius: 12px;
	display: grid;
	filter: drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.1));
	grid-template-columns: ${(props: IGridStyle) => props.orientation === 'vertical' ? '20% 80%': ( props.orientation === 'horizontal') ? '30% 70%' : '100%'};
	grid-template-rows:  ${(props: IGridStyle) => ['horizontal', 'vertical'].includes(props.orientation!) ? '60% 40%' : '100%'};
	grid-template-areas: ${(props: IGridStyle) => props.orientation === 'square' ? '' :  `	'image image'
																							'logo content'`};
	height: ${(props: IGridStyle) => props.height || '176px'};
	margin: 5px;
	overflow: hidden;
	width: ${(props: IGridStyle) => props.width || '256px'};
`;

export const ImageContent = sc.div<IImageContentStyle>`
	border-radius: 8px;
	padding:  ${(props : IImageContentStyle) => ['vertical', 'horizontal'].includes(props.orientation) ? '8px' : '15px'};
	${(props: IImageContentStyle) => ['vertical', 'horizontal'].includes(props.orientation) && `grid-area: image;`};
	width: inherit;
`;

export const Image = sc.img<IImageStyle>`
	border-radius: 8px;
	background-image: url(${(props: IImageStyle) => props.image});
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-origin: border-box;
	height: 100%;
	width: 100%;
`;

export const Logo = sc.div<IImageStyle>`
	align-self: flex-start;
	background-image: url(${(props: IImageStyle) => props.image});
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-color: #fff;
	border: 2px solid #FFFFFF;
	border-radius: 50%;
	box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.15);
  	height: 38px;
	grid-area: logo;
  	justify-self: end;
	margin-top: 5px;
	padding: 10px;
	width: 38px;
`;


export const Content = sc.div`
	padding: 10px;
	grid-area: content;
`;

export const ContentTitle = sc.h1<IContentTitleStyle>`
	color: #19191B;
	font-family: 'Open Sans';
	font-size: 16px;
	font-weight: 600;
	margin-bottom: ${( props : IContentTitleStyle) => props.orientation === 'vertical' ? '4px' : '1px'}
`;

export const ContentDescription = sc.p`
  	color: #909090;
	font-family: 'Open Sans';
	font-style: normal;
	font-weight: 300;
	font-size: 12px;
	line-height: 100%;
	letter-spacing: -0.05em;
`;

export const ContentSubTitle = sc.h3`
	font-family: 'Open Sans';
	font-style: normal;
	font-weight: 400;
	font-size: 10px;
	line-height: 125%;
	letter-spacing: -0.05em;
	color: #909090;
`;