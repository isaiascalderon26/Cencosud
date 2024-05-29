export interface IActivity {
  objectID: string,
  title: string,
  pdf_file: string,
  slider: string,
  description: string,
  description_html: string,
  image: string,
  location: string,
  video: string,
  validity_start_date: string;
  validity_end_date: string,
  schedule: string,
  sort: string,
  type: string,
  url: string,
  store: string,
  store_id: string,
  meta_data?: Record<string,string>
}