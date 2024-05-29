export type Orientation = 'horizontal' | 'vertical' | 'square';
export interface IContentTitleStyle {
	orientation: Orientation;
}

export interface IGridStyle extends IStyledProps{
    orientation: Orientation;
	width: string;
	height: string;
}

export interface IImageContentStyle{
	orientation: Orientation;
}

export interface IImageStyle{
	image: string;
}