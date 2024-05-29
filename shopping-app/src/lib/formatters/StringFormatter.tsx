class StringFormatter {

    capFirstLetter(string: string) {
      if (!string) return string;
      return string[0].toUpperCase() + string.substr(1).toLowerCase();
    }

    shortText(text:string, max_length:number, limit: number):string {
      if(text.length >= max_length) {
          return text.substring(0, limit) + '...';
      }
      return text;
    }

    htmlDecode(input:string){
      const doc = new DOMParser().parseFromString(input, "text/html");
      return doc.documentElement.textContent;
    }
    
  }
  
  export default new StringFormatter();