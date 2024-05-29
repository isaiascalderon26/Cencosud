import IWidget, { IBannerWidget, ICarrouselItem, ICarrouselWidget, IMapWidget, } from "../../../../models/widgets/IWidget";
import Analytics from '../../../../lib/FirebaseAnalytics';
interface ILogEvent {
	name: string;
	title: string;
	store: string;
	context: string;
	category: string;
	user: string;

}


export const logEventBannerWidgetAnalytics = async (widget: IWidget, user: string, mall: string, category : string = '') => {
	const params: ILogEvent = ({} as any) as ILogEvent;

	try {
		widget = widget as IBannerWidget | IMapWidget;
		params.name = "banners";
		params.title = widget.title;
		params.store = mall;
		params.context = "home";
		params.category = category;
		params.user = user === 'invited' ? 'invitado' : 'registrado';
		Analytics.customLogEventName(params.name, params.title, params.store, params.context, params.category, params.user);
	} catch (error: any) {
		console.log(error);
	}

}

export const logEventCarrouselWidgetAnalytics = async (widget: ICarrouselWidget, user: string, item: ICarrouselItem, mall: string) => {

	const params: ILogEvent = ({} as any) as ILogEvent;
	try {
		if (item.callback.type === 'NAV_IN_PAGE') {
			const callback_args: unknown[] | undefined = item.callback.details.callback_args;
			if (callback_args && callback_args.length > 0) {
				const itemCallbackArgs: { title: string, name: string, brand_name : string } = callback_args[0] as { title: string, name: string,  brand_name : string };
				params.name = 'banners';
				params.title = (itemCallbackArgs.brand_name || itemCallbackArgs.name || itemCallbackArgs.title || '').toLowerCase();
				params.store = mall;
				params.context = "home";
				params.category = (widget.source || widget.title || '').toLowerCase();
				params.user = user === 'invited' ? 'invitado' : 'registrado';
				Analytics.customLogEventName(params.name, params.title, params.store, params.context, params.category, params.user);
			}
		}
	}
	catch (error: any) {
		console.log(error);
	}


}

export const logEventSocialLinksWidgetAnalytics = async (url : string, mall : string, user : string) => {
	try{
		const params: ILogEvent = ({} as any) as ILogEvent;
		params.name = 'button';
		params.title = getDomainFromUrl(url);
		params.store = mall;
		params.context = "home";
		params.category = 'redes sociales';
		params.user = user === 'invited' ? 'invitado' : 'registrado';
		Analytics.customLogEventName(params.name, params.title, params.store, params.context, params.category, params.user);
	}
	catch(error: any){
		console.log(error);
	}
}


const getDomainFromUrl = (url : string) : string => {
  let str = url.split(".")
  let domain = ''
  if(str.length >= 3){/*http://www.example.com*/
    domain = str[1]
  }else{ /*http://example.com*/
    str = str[0].split("//")
    domain = str[1]
  }
  return domain

}

// const getCategory = (callback: ICallback): string => {
// 	const getPathString = (str: string, char1: string, char2: string) => str.substring(str.indexOf(char1) + 1, str.lastIndexOf(char2));
// 	switch (callback.type) {
// 		case 'NAV_IN_APP':
// 			return getPathString(callback.details.route, '/', '/');
// 		default:
// 			return '';
// 	}
// }
