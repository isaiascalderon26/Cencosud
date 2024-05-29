export interface IService {
    objectID: string,
    name: string,
    description: string,
    image: string,
    location: string,

    control: string
    keywords: string[]
    store: string
    store_id: string
    meta_data: Record<string, string>
  }