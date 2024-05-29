import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import IWidget from '../models/widgets/IWidget';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage widgets
 * 
 * @class WidgetsClient
 */
class WidgetsClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List widgets using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IWidget>>}
   * @memberof WidgetsClient
   */
  async list(params: IListParams): Promise<IWidget[]> {
    const response = await this.axios.get(`/widgets`, { params });
    
    return response.data.data;
    /*const response: IWidget[] = [
      {
        id: 'banner-pay-parking-costanera',
        type: 'BANNER',
        enabled: true,
        priority: 1,
        tags: ['COSTANERA_CENTER'],
        title: 'Paga tu parking',
        image: 'https://ux-cdn.cencosudx.io/mimall-app/banners/banner_pago_parking.jpeg',
        //size: 'SMALL',
        callback: {
          type: 'NAV_IN_APP',
          details: {
            route: '/parking/costanera%20center',
            method: 'PUSH'
          }
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'carrousel-videos-costanera',
        type: 'CARROUSEL',
        enabled: true,
        priority: 3,
        tags: ['COSTANERA_CENTER'],
        title: 'Actividades',
        
        items: [{
          media: {
            type: 'VIDEO',
            url: 'https://ux-cdn.cencosudx.io/mimall-app/activities/portales/Video_Bienvenida_APP.mp4',
          },
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                url: 'https://ux-cdn.cencosudx.io/mimall-app/activities/portales/Video_Bienvenida_APP.mp4#t=1,14',
                "title": "¡Bienvenida App!",
                "pdf_file": "",
                "slider": [
                  ""
                ],
                "description": "",
                "image": "",
                "location": "",
                "video": "https://ux-cdn.cencosudx.io/mimall-app/activities/portales/Video_Bienvenida_APP.mp4",
                "validity_start_date": "2021-06-29",
                "validity_end_date": "2022-12-31",
                "schedule": "",
                "sort": "1",
                "store": "costanera center",
                "store_id": "446564f853914c81d3158b8ad396680b",
                "type": "video",
                "meta_data": {
                  "provider": "realmedia"
                },
                "objectID": "17030806197d4_dashboard_generated_id",
                "_highlightResult": {
                  "title": {
                    "value": "¡Bienvenida App!",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "validity_end_date": {
                    "value": "2022-12-31",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "store": {
                    "value": "<em>costanera</em> <em>center</em>",
                    "matchLevel": "full",
                    "fullyHighlighted": true,
                    "matchedWords": [
                      "costanera",
                      "center"
                    ]
                  },
                  "type": {
                    "value": "video",
                    "matchLevel": "none",
                    "matchedWords": []
                  }
                }
              }]
            }
          },
        }],
        see_more: {
          message: 'Ver Mas',
          callback: {
            type: 'NAV_IN_APP',
            details: {
              route: '/activities/costanera%20center',
              method: 'PUSH'
            }
          }
        },
        orientation: 'VERTICAL',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'banner-game-costanera',
        type: 'BANNER',
        enabled: true,
        priority: 3,
        tags: ['COSTANERA_CENTER'],
        title: 'Juegos',
        image: 'https://ux-cdn.cencosudx.io/mimall-app/banners/banner_gamificacion.jpeg',
        //size: 'SMALL',
        callback: {
          type: 'NAV_IN_APP',
          details: {
            route: '/challenge/costanera%20center',
            method: 'PUSH'
          }
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'banner-sky-costanera',
        type: 'BANNER',
        enabled: true,
        priority: 4,
        tags: ['COSTANERA_CENTER'],
        title: 'Conoce SKY Costanera',
        image: 'https://ux-cdn.cencosudx.io/mimall-app/banners/costanera-sky.jpeg',
        //size: 'SMALL',
        callback: {
          type: 'NAV_IN_APP',
          details: {
            route: '/sky-costanera/costanera%20center',
            method: 'PUSH'
          }
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'carrousel-activities-costanera',
        type: 'CARROUSEL',
        enabled: true,
        priority: 2,
        tags: ['COSTANERA_CENTER'],
        title: 'Disfruta del cine',
        items: [{
          media: {
            type: 'MOVIE',
            url: 'https://cdn.apis.cineplanet.cl/CDN/media/entity/get/FilmPosterGraphic/HO00000843?referenceScheme=HeadOffice&allowPlaceHolder=true',
          },
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                url: 'https://ux-cdn.cencosudx.io/mimall-app/activities/portales/Video_Bienvenida_APP.mp4#t=1,14',
                "title": "ERASE UNA VEZ UN GENIO",
                "synopsis": "La Dra. en literatura Alithea Binnie (Tilda Swinton) parece estar feliz con su vida aunque se enfrenta al mundo con cierto escepticismo. De repente, se encuentra con un genio (Idris Elba) que ofrece concederle tres deseos a cambio de su libertad. En un principio, Alithea se niega a aceptar la oferta ya que sabe que todos los cuentos sobre conceder deseos acaban mal. El genio defiende su posición contándole diversas historias fantásticas de su pasado. Finalmente, ella se deja persuadir y pedirá un deseo que sorprenderá a ambos.",
                "posterUrl": "https://cdn.apis.cineplanet.cl/CDN/media/entity/get/FilmPosterGraphic/HO00000843?referenceScheme=HeadOffice&allowPlaceHolder=true",
                "code_store": "0000000004",
                "trailer": "https://youtu.be/DSnwYuDdu6Q",
                "ratingDescription": "TE +7",
                "genre": "DRAMA",
                "runtime": 109,
                "cinema": "CINEPLANET",
                "meta_data": {
                  "id": "HO00000843",
                  "cast": {
                    "cast": []
                  },
                  "director": "null ",
                  "formats": [
                    "2D",
                    "PRIME",
                    "CONV"
                  ],
                  "gallery": {
                    "images": []
                  },
                  "isComingSoon": false,
                  "OpeningDate": "2022-09-01T00:00:00-04:00",
                  "restricted": false,
                  "genre": "DRAMA",
                  "isNewRelease": true,
                  "isPreSale": false,
                  "festival": "",
                  "languages": [
                    "SUBTITULAD"
                  ],
                  "posterUrl": "https://cdn.apis.cineplanet.cl/CDN/media/entity/get/FilmPosterGraphic/HO00000843?referenceScheme=HeadOffice&allowPlaceHolder=true",
                  "ratingDescription": "TE +7",
                  "runTime": 109,
                  "synopsis": "La Dra. en literatura Alithea Binnie (Tilda Swinton) parece estar feliz con su vida aunque se enfrenta al mundo con cierto escepticismo. De repente, se encuentra con un genio (Idris Elba) que ofrece concederle tres deseos a cambio de su libertad. En un principio, Alithea se niega a aceptar la oferta ya que sabe que todos los cuentos sobre conceder deseos acaban mal. El genio defiende su posición contándole diversas historias fantásticas de su pasado. Finalmente, ella se deja persuadir y pedirá un deseo que sorprenderá a ambos.",
                  "thumbnailUrl": [
                    "http://vista.clcineplanet.com/WSVistaWebClientCDN/media/entity/get/FilmPosterGraphic/HO00000843?referenceScheme=HeadOffice&allowPlaceHolder=true&width=1",
                    "http://vista.clcineplanet.com/WSVistaWebClientCDN/media/entity/get/FilmPosterGraphic/HO00000843?referenceScheme=HeadOffice&allowPlaceHolder=true&width=379"
                  ],
                  "title": "ERASE UNA VEZ UN GENIO",
                  "trailer": "https://youtu.be/DSnwYuDdu6Q",
                  "cinemas": [
                    {
                      "cinemaId": "0000000003",
                      "dates": [
                        {
                          "date": "2022-09-05T00:00:00",
                          "sessions": [
                            "0000000003-26947",
                            "0000000003-26948"
                          ]
                        },
                        {
                          "date": "2022-09-07T00:00:00",
                          "sessions": [
                            "0000000003-26985",
                            "0000000003-26986"
                          ]
                        },
                        {
                          "date": "2022-09-06T00:00:00",
                          "sessions": [
                            "0000000003-26966",
                            "0000000003-26967"
                          ]
                        }
                      ]
                    },
                    {
                      "cinemaId": "0000000004",
                      "dates": [
                        {
                          "date": "2022-09-05T00:00:00",
                          "sessions": [
                            "0000000004-63330",
                            "0000000004-63332"
                          ]
                        },
                        {
                          "date": "2022-09-07T00:00:00",
                          "sessions": [
                            "0000000004-63414",
                            "0000000004-63416"
                          ]
                        },
                        {
                          "date": "2022-09-06T00:00:00",
                          "sessions": [
                            "0000000004-63372",
                            "0000000004-63374"
                          ]
                        }
                      ]
                    },
                    {
                      "cinemaId": "0000000007",
                      "dates": [
                        {
                          "date": "2022-09-05T00:00:00",
                          "sessions": [
                            "0000000007-66976",
                            "0000000007-66977",
                            "0000000007-66978"
                          ]
                        },
                        {
                          "date": "2022-09-07T00:00:00",
                          "sessions": [
                            "0000000007-67044",
                            "0000000007-67045",
                            "0000000007-67046"
                          ]
                        },
                        {
                          "date": "2022-09-06T00:00:00",
                          "sessions": [
                            "0000000007-67010",
                            "0000000007-67011",
                            "0000000007-67012"
                          ]
                        }
                      ]
                    },
                    {
                      "cinemaId": "0000000006",
                      "dates": [
                        {
                          "date": "2022-09-05T00:00:00",
                          "sessions": [
                            "0000000006-27092",
                            "0000000006-27093",
                            "0000000006-27094"
                          ]
                        },
                        {
                          "date": "2022-09-07T00:00:00",
                          "sessions": [
                            "0000000006-27114",
                            "0000000006-27115",
                            "0000000006-27116"
                          ]
                        },
                        {
                          "date": "2022-09-06T00:00:00",
                          "sessions": [
                            "0000000006-27103",
                            "0000000006-27104",
                            "0000000006-27105"
                          ]
                        }
                      ]
                    }
                  ],
                  "movieDetailsUrl": "erase-una-vez-un-genio",
                  "film_functions": [
                    {
                      "date": "2022-09-05",
                      "versions": [
                        {
                          "title": "ERASE UNA VEZ UN GENIO",
                          "type": "2D PRI ",
                          "hour": [
                            "17:00:00",
                            "21:50:00"
                          ]
                        }
                      ]
                    }
                  ]
                },
                "objectID": "HO00000843-0000000004",
                "_highlightResult": {
                  "code_store": {
                    "value": "<em>0000000004</em>",
                    "matchLevel": "full",
                    "fullyHighlighted": true,
                    "matchedWords": [
                      "0000000004"
                    ]
                  }
                }
              }]
            }
          },
        }],
        see_more: {
          message: 'Ver Mas',
          callback: {
            type: 'NAV_IN_APP',
            details: {
              route: '/movies/costanera%20center',
              method: 'PUSH'
            }
          }
        },
        orientation: 'VERTICAL',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'carrousel-promotions-costanera',
        type: 'CARROUSEL',
        enabled: true,
        priority: 7,
        tags: ['COSTANERA_CENTER'],
        title: 'Promociones',
        items: [{
          media: {
            type: 'IMAGE',
            url: '/sites/default/files/imagenes-promocion/desc%20516x260%20copia%202_0.jpg',
          },
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                "title": "20% descuento para la 2da pre-venta.",
                "description": "&lt;ul&gt;&lt;li&gt;Promoción válida del 03/09/2022 hasta agotar stock.&lt;/li&gt;<br />\r\n&lt;li&gt;Descuento válido únicamente para las entradas de 3 días en la pre-venta 2 del evento. Máximo 4 códigos de descuento por transacción.&lt;/li&gt;<br />\r\n&lt;li&gt;El descuento se aplica automáticamente al ingresar el código.&lt;/li&gt;&lt;/ul&gt;",
                "image": "/sites/default/files/imagenes-promocion/desc%20516x260%20copia%202_0.jpg",
                "validity_start_date": "2022-08-24",
                "validity_end_date": "2023-03-16",
                "brand_name": "Lollapalooza",
                "brand_logo": "/sites/default/files/logos-marca/logotipololla2022-02.png",
                "store": "costanera center",
                "control": "Solo APP Destacado",
                "keywords": [
                  "Lollapalooza",
                  " lolla",
                  " lolla chile",
                  " entretención",
                  " música",
                  " festival",
                  " lolla fans",
                  " fans",
                  " puntoticket",
                  " lineup"
                ],
                "store_id": "446564f853914c81d3158b8ad396680b",
                "meta_data": {
                  "provider": "realmedia"
                },
                "order": 1,
                "objectID": "79501c41460ea_dashboard_generated_id",
                "_highlightResult": {
                  "title": {
                    "value": "20% descuento para la 2da pre-venta.",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "validity_end_date": {
                    "value": "2023-03-16",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "brand_name": {
                    "value": "Lollapalooza",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "store": {
                    "value": "<em>costanera</em> <em>center</em>",
                    "matchLevel": "full",
                    "fullyHighlighted": true,
                    "matchedWords": [
                      "costanera",
                      "center"
                    ]
                  }
                }
              }]
            }
          },
        }, {
          media: {
            type: 'IMAGE',
            url: '/sites/default/files/imagenes-promocion/desc%20516x260%20copia%202_0.jpg',
          },
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                  "title": "20% descuento para la 2da pre-venta.",
                  "description": "&lt;ul&gt;&lt;li&gt;Promoción válida del 03/09/2022 hasta agotar stock.&lt;/li&gt;<br />\r\n&lt;li&gt;Descuento válido únicamente para las entradas de 3 días en la pre-venta 2 del evento. Máximo 4 códigos de descuento por transacción.&lt;/li&gt;<br />\r\n&lt;li&gt;El descuento se aplica automáticamente al ingresar el código.&lt;/li&gt;&lt;/ul&gt;",
                  "image": "/sites/default/files/imagenes-promocion/desc%20516x260%20copia%202_0.jpg",
                  "validity_start_date": "2022-08-24",
                  "validity_end_date": "2023-03-16",
                  "brand_name": "Lollapalooza",
                  "brand_logo": "/sites/default/files/logos-marca/logotipololla2022-02.png",
                  "store": "costanera center",
                  "control": "Solo APP Destacado",
                  "keywords": [
                    "Lollapalooza",
                    " lolla",
                    " lolla chile",
                    " entretención",
                    " música",
                    " festival",
                    " lolla fans",
                    " fans",
                    " puntoticket",
                    " lineup"
                  ],
                  "store_id": "446564f853914c81d3158b8ad396680b",
                  "meta_data": {
                    "provider": "realmedia"
                  },
                  "order": 1,
                  "objectID": "79501c41460ea_dashboard_generated_id",
                  "_highlightResult": {
                    "title": {
                      "value": "20% descuento para la 2da pre-venta.",
                      "matchLevel": "none",
                      "matchedWords": []
                    },
                    "validity_end_date": {
                      "value": "2023-03-16",
                      "matchLevel": "none",
                      "matchedWords": []
                    },
                    "brand_name": {
                      "value": "Lollapalooza",
                      "matchLevel": "none",
                      "matchedWords": []
                    },
                    "store": {
                      "value": "<em>costanera</em> <em>center</em>",
                      "matchLevel": "full",
                      "fullyHighlighted": true,
                      "matchedWords": [
                        "costanera",
                        "center"
                      ]
                    }
                  }
                }]
            }
          },
        }],
        see_more: {
          message: 'Ver Mas',
          callback: {
            type: 'NAV_IN_APP',
            details: {
              route: '/promotions/costanera%20center',
              method: 'PUSH'
            }
          }
        },
        orientation: 'HORIZONTAL',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'banner-la-energi-nos-mueve',
        type: 'BANNER',
        enabled: true,
        priority: 1,
        tags: ['COSTANERA_CENTER'],
        title: 'La energia nos mueve',
        image: 'https://ux-cdn.cencosudx.io/mimall-app/banners/activacion/banner_cc_juego_baile.jpg',
        //size: 'SMALL',
        callback: {
          type: 'NAV_IN_PAGE',
          details: {
            callback: 'onBannerhandler',
            callback_args: [{
              flag: true,
              id: "BANNER-DAY-MOM",
              image: "https://ux-cdn.cencosudx.io/mimall-app/banners/activacion/banner_cc_juego_baile.jpg",
              title: "La energia nos mueve",
              url: "https://www.costanera10anos.cl/"
            }]
          }
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'carrousel-stores-costanera',
        type: 'CARROUSEL',
        enabled: true,
        priority: 8,
        tags: ['COSTANERA_CENTER'],
        title: '¿Ya nos visitaste?',
        rows: 2,
        items: [{
          media: {
            type: 'IMAGE',
            url: '/sites/default/files/styles/convert_webp/public/fotos-tienda/platon.jpeg.webp?itok=LiRBsRnb',
          },
          badgeText: 'Nivel 5',
          bodyText: 'Platón',
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                "name": "Platón",
                "phone": "562 2618 9547",
                "level": [
                  "5"
                ],
                "web": "https://www.platon.cl",
                "control": "Web y APP",
                "map": "CC_N5_L5529_PLATON_2",
                "url_map": "https://mall.costaneracenter.cl/sites/default/files/styles/convert_webp/public/mapas/CC_N5_L5529_PLATON_2.jpg.webp?itok=vbkS6tze",
                "keywords": [
                  "Comida rápida",
                  " buffet",
                  " comida casera",
                  " pescados",
                  " carne",
                  " pollo"
                ],
                "description": "Platón nace en 1996 como el primer restaurante de Comida Rápida Casera. Los estándares de calidad que aplica en sus procesos, han permitido que Platón sea percibido como la cadena de comida rápida casera con mayor proyección en el mercado, el cual viene a dar una solución variada y creativa a la alimentación diaria. Mediante el sistema de franquicias, la cadena tiene negocios en varias regiones a lo largo del país, incluyendo la región Metropolitana.",
                "category": "Gastronomía,Patio de comidas",
                "photo": "/sites/default/files/styles/convert_webp/public/fotos-tienda/platon.jpeg.webp?itok=LiRBsRnb",
                "logo": "/sites/default/files/styles/convert_webp/public/logos-marca/logo_984_1.png.webp?itok=a-aPsemT",
                "store": "costanera center",
                "store_id": "446564f853914c81d3158b8ad396680b",
                "email": "",
                "instagram": "",
                "whatsapp": "",
                "local": "",
                "market_schedules": [
                  {
                    "id": "1",
                    "dias_txhorarios": "Lunes a domingo",
                    "horas_txhorarios": "10:00 a 20:30 hrs"
                  }
                ],
                "meta_data": {
                  "provider": "realmedia"
                },
                "objectID": "11136-446564f853914c81d3158b8ad396680b",
                "_highlightResult": {
                  "name": {
                    "value": "Platón",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "level": [
                    {
                      "value": "5",
                      "matchLevel": "none",
                      "matchedWords": []
                    }
                  ],
                  "description": {
                    "value": "Platón nace en 1996 como el primer <em>restaurante</em> de Comida Rápida Casera. Los estándares de calidad que aplica en sus procesos, han permitido que Platón sea percibido como la cadena de comida rápida casera con mayor proyección en el mercado, el cual viene a dar una solución variada y creativa a la alimentación diaria. Mediante el sistema de franquicias, la cadena tiene negocios en varias regiones a lo largo del país, incluyendo la región Metropolitana.",
                    "matchLevel": "full",
                    "fullyHighlighted": false,
                    "matchedWords": [
                      "restaurant"
                    ]
                  },
                  "category": {
                    "value": "Gastronomía,Patio de comidas",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "store": {
                    "value": "costanera center",
                    "matchLevel": "none",
                    "matchedWords": []
                  }
                }
              }]
            }
          },
        }, {
          media: {
            type: 'IMAGE',
            url: '/sites/default/files/styles/convert_webp/public/fotos-tienda/COSTAMIA.jpg.webp?itok=w6IhG14F',
          },
          badgeText: 'Nivel 5',
          bodyText: 'Costamia',
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                "name": "Costamia",
                "phone": "562 2618 9788",
                "level": [
                  "5"
                ],
                "web": "https://www.instagram.com/costamia_restaurant/?hl=es",
                "control": "Web y APP",
                "map": "CC_N5_L5168_COSTAMIA_2",
                "url_map": "https://mall.costaneracenter.cl/sites/default/files/styles/convert_webp/public/mapas/CC_N5_L5168_COSTAMIA_2.jpg.webp?itok=iXq4jsJx",
                "keywords": [
                  "Restaurantes",
                  " comida especializada",
                  " ceviche",
                  " chilena",
                  " mariscos",
                  " sopas",
                  " pastas",
                  " licores",
                  " aperitivos",
                  " cocteles",
                  ""
                ],
                "description": "Costamia Restaurante Aguarían, el primer restaurante acuario de Chile. Comida basada en la materia prima de las costas de nuestro país.",
                "category": "Mirador,Chilena",
                "photo": "/sites/default/files/styles/convert_webp/public/fotos-tienda/COSTAMIA.jpg.webp?itok=w6IhG14F",
                "logo": "/sites/default/files/styles/convert_webp/public/logos-marca/logo_1007_1.png.webp?itok=Ru5s_b-L",
                "store": "costanera center",
                "store_id": "446564f853914c81d3158b8ad396680b",
                "email": "",
                "instagram": "",
                "whatsapp": "",
                "local": "",
                "market_schedules": [
                  {
                    "id": "1",
                    "dias_txhorarios": "Lunes a domingo",
                    "horas_txhorarios": "10:00 a 20:30 hrs"
                  }
                ],
                "meta_data": {
                  "provider": "realmedia"
                },
                "objectID": "10351-446564f853914c81d3158b8ad396680b",
                "_highlightResult": {
                  "name": {
                    "value": "Costamia",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "level": [
                    {
                      "value": "5",
                      "matchLevel": "none",
                      "matchedWords": []
                    }
                  ],
                  "description": {
                    "value": "Costamia <em>Restaurante</em> Aguarían, el primer <em>restaurante</em> acuario de Chile. Comida basada en la materia prima de las costas de nuestro país.",
                    "matchLevel": "full",
                    "fullyHighlighted": false,
                    "matchedWords": [
                      "restaurant"
                    ]
                  },
                  "category": {
                    "value": "Mirador,Chilena",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "store": {
                    "value": "costanera center",
                    "matchLevel": "none",
                    "matchedWords": []
                  }
                }
              }]
            }
            
          },
        },
        {
          media: {
            type: 'IMAGE',
            url: '/sites/default/files/styles/convert_webp/public/fotos-tienda/Japone%CC%81s%20Costanera%20%281%29.png.webp?itok=orDEgrjE',
          },
          badgeText: 'Nivel 5',
          bodyText: 'El Japonés',
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                "name": "El Japonés",
                "phone": "",
                "level": [
                  "5"
                ],
                "web": "https://eljaponeschile.com",
                "control": "Web y APP",
                "map": "CC_N5_L5141_EL-JAPONES%20%281%29",
                "url_map": "https://mall.costaneracenter.cl/sites/default/files/styles/convert_webp/public/mapas/CC_N5_L5141_EL-JAPONES%20%281%29.jpg.webp?itok=M-0zppqO",
                "space": "0zppqO",
                "keywords": [
                  "Comida japonesa",
                  " comida asiática",
                  " mirador costanera",
                  " bar",
                  " planchas",
                  " piqueos",
                  " Sushi",
                  " nikkei",
                  " rolls",
                  " ceviche",
                  " poke",
                  " gohan",
                  " restaurant",
                  " ramen",
                  " gyosas"
                ],
                "description": "Cocina japonesa, pero con malicia, es el sello de este local con el estilo de una izakaya, típico bar o restaurante japonés, mezcla tradición con un toque contemporáneo. Una carta que es un viajar por Asia, pero con toque nikkei. Hay sushi, piqueos, y planchas, ideal para compartir. ",
                "category": "Mirador,Asiática",
                "photo": "/sites/default/files/styles/convert_webp/public/fotos-tienda/Japone%CC%81s%20Costanera%20%281%29.png.webp?itok=orDEgrjE,/sites/default/files/styles/convert_webp/public/fotos-tienda/_HIN7999_0.jpeg.webp?itok=oId3Wcik",
                "logo": "/sites/default/files/styles/convert_webp/public/logos-marca/Logo%20Web%20Cencosud%20Japone%CC%81s.png.webp?itok=pKSZDUZY",
                "store": "costanera center",
                "store_id": "446564f853914c81d3158b8ad396680b",
                "email": "",
                "instagram": "https://www.instagram.com/eljapones_chile/",
                "whatsapp": "",
                "local": 5141,
                "market_schedules": [
                  {
                    "id": "96",
                    "dias_txhorarios": "Lunes a Domingo",
                    "horas_txhorarios": "12:30 a 22:00 hrs"
                  }
                ],
                "meta_data": {
                  "provider": "realmedia"
                },
                "objectID": "11786-446564f853914c81d3158b8ad396680b",
                "_highlightResult": {
                  "name": {
                    "value": "El Japonés",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "level": [
                    {
                      "value": "5",
                      "matchLevel": "none",
                      "matchedWords": []
                    }
                  ],
                  "description": {
                    "value": "Cocina japonesa, pero con malicia, es el sello de este local con el estilo de una izakaya, típico bar o <em>restaurante</em> japonés, mezcla tradición con un toque contemporáneo. Una carta que es un viajar por Asia, pero con toque nikkei. Hay sushi, piqueos, y planchas, ideal para compartir. ",
                    "matchLevel": "full",
                    "fullyHighlighted": false,
                    "matchedWords": [
                      "restaurant"
                    ]
                  },
                  "category": {
                    "value": "Mirador,Asiática",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "store": {
                    "value": "costanera center",
                    "matchLevel": "none",
                    "matchedWords": []
                  }
                }
              }]
            }
          },
        },
        {
          media: {
            type: 'IMAGE',
            url: '/sites/default/files/styles/convert_webp/public/fotos-tienda/externalPic_764%2520%25281%2529.jpg.webp?itok=LilJs9d4',
          },
          badgeText: 'Nivel 5',
          bodyText: 'Pollo Stop',
          callback: {
            type: 'NAV_IN_PAGE',
            details: {
              callback: 'onOpenActivityModalHandler',
              callback_args: [{
                "name": "Pollo Stop",
                "phone": "562 2618 9610",
                "level": [
                  "5"
                ],
                "web": "https://www.pollostop.cl",
                "control": "Web y APP",
                "map": "CC_N5_L5520_POLLO-STOP_2",
                "url_map": "https://mall.costaneracenter.cl/sites/default/files/styles/convert_webp/public/mapas/CC_N5_L5520_POLLO-STOP_2.jpg.webp?itok=wBpFA_F_",
                "keywords": [
                  "Comida rápida",
                  " pollo asado",
                  " pollo",
                  " hamburguesa",
                  " comida americana"
                ],
                "description": "Bienvenidos a Pollo Stop, el famoso restaurante familiar que ha marcado toda una Época, ahora en una atmosfera renovada y moderna, al nivel que nuestros fieles clientes se merecen. En este nuevo espacio ofreceremos lo mejor de nuestros famosos y tradicionales productos, además de nuevas preparaciones basadas en el sabor Único de nuestro Pollo y su receta original.",
                "category": "Gastronomía,Patio de comidas",
                "photo": "/sites/default/files/styles/convert_webp/public/fotos-tienda/externalPic_764%2520%25281%2529.jpg.webp?itok=LilJs9d4",
                "logo": "/sites/default/files/styles/convert_webp/public/logos-marca/logo_1622_1.jpg.webp?itok=AR1TR2MG",
                "store": "costanera center",
                "store_id": "446564f853914c81d3158b8ad396680b",
                "email": "",
                "instagram": "",
                "whatsapp": "",
                "local": "",
                "market_schedules": [
                  {
                    "id": "1",
                    "dias_txhorarios": "Lunes a domingo",
                    "horas_txhorarios": "10:00 a 20:30 hrs"
                  }
                ],
                "meta_data": {
                  "provider": "realmedia"
                },
                "objectID": "11151-446564f853914c81d3158b8ad396680b",
                "_highlightResult": {
                  "name": {
                    "value": "Pollo Stop",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "level": [
                    {
                      "value": "5",
                      "matchLevel": "none",
                      "matchedWords": []
                    }
                  ],
                  "description": {
                    "value": "Bienvenidos a Pollo Stop, el famoso <em>restaurante</em> familiar que ha marcado toda una Época, ahora en una atmosfera renovada y moderna, al nivel que nuestros fieles clientes se merecen. En este nuevo espacio ofreceremos lo mejor de nuestros famosos y tradicionales productos, además de nuevas preparaciones basadas en el sabor Único de nuestro Pollo y su receta original.",
                    "matchLevel": "full",
                    "fullyHighlighted": false,
                    "matchedWords": [
                      "restaurant"
                    ]
                  },
                  "category": {
                    "value": "Gastronomía,Patio de comidas",
                    "matchLevel": "none",
                    "matchedWords": []
                  },
                  "store": {
                    "value": "costanera center",
                    "matchLevel": "none",
                    "matchedWords": []
                  }
                }
              }]
            }
          },
        }],
        orientation: 'HORIZONTAL',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'banner-map-costanera',
        type: 'MAP',
        enabled: true,
        priority: 7,
        tags: ['COSTANERA_CENTER'],
        title: 'Cómo llegar a Costanera Center',
        image: 'https://ux-cdn.cencosudx.io/mimall-app/drive-map/costaneracenter.jpg',
        //size: 'MEDIUM',
        callback: {
          type: 'NAV_IN_PAGE',
          details: {
            callback: 'onClickMap',
            callback_args: [{
              icons_share_location: [
                {
                  "type": "google-maps",
                  "state": true,
                  "url": "https://goo.gl/maps/gbmRL9LTTXxhMrpb8",
                  "mall": "costanera center"
                },
                {
                  "type": "waze",
                  "state": true,
                  "url": "https://waze.com/ul?preview_venue_id=189662650.1896560962.12184823",
                  "mall": "costanera center"
                }
              ],
              site: {
                "id": "446564f853914c81d3158b8ad396680b",
                "name": "costanera center",
                "alias": "costanera",
                "web": "https://mall.costaneracenter.cl",
                "logo": "https://storage.googleapis.com/shopping-images-test/costanera.png",
                "meta_data": {
                  "sort": "1",
                  "api": "https://mall.costaneracenter.cl",
                  "api_version": "v2",
                  "provider": "realmedia",
                  "parking": true,
                  "type": "mall",
                  "cine": "cineplanet",
                  "cineId": "0000000004",
                  "facilityNumber": 1510213,
                  "cdgSIISucur": 82536657,
                  "sapCode": "S511",
                  "address": "Avda. Andres Bello 2447",
                  "district": "Providencia",
                  "city": "Santiago",
                  "companyName": "Cencosud Shopping S.A.",
                  "documentNumber": "76433310-1",
                  "commercialActivity": "Estacionamiento de Vehiculos",
                  "terminal": 1001,
                  "levels": [
                    0,
                    7
                  ],
                  "schedules": {
                    "tiendas": [
                      "9:00",
                      "20:00"
                    ]
                  },
                  "skyCostanera": {
                    "app": true,
                    "enable_form": true,
                    "validation": true
                  },
                  "social_networks": {
                    "twitter": "https://twitter.com/CostaneraCenter",
                    "instagram": "https://www.instagram.com/mallcostaneracenter/",
                    "facebook": "https://www.facebook.com/costaneracenter",
                    "youtube": "https://www.youtube.com/user/CostaneraCenter"
                  }
                }
              }
            }]
          }
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'social-links-socia-links-costanera',
        type: 'SOCIAL_LINKS',
        enabled: true,
        priority: 8,
        tags: ['COSTANERA_CENTER'],
        links: [
          {
            icon: 'https://ux-cdn.cencosudx.io/mimall-app/logo/social-media/icon-instagram.svg',
            url: 'https://www.instagram.com/mallcostaneracenter/',
          },
          {
            icon: 'https://ux-cdn.cencosudx.io/mimall-app/logo/social-media/icon-facebook.svg',
            url: 'https://www.facebook.com/costaneracenter',
          },
          {
            icon: 'https://ux-cdn.cencosudx.io/mimall-app/logo/social-media/icon-twitter.svg',
            url: 'https://twitter.com/CostaneraCenter',
          },
          {
            icon: 'https://ux-cdn.cencosudx.io/mimall-app/logo/social-media/icon-youtube.svg',
            url: 'https://www.youtube.com/user/CostaneraCenter'
          },
        ],
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    return response;*/
  }

}

export default new WidgetsClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
