import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class WalmartApiProvider {
  
  public url: string;
  public apiKey: string;

  constructor(public http: Http) {
    console.log('Hello WalmartApiProvider Provider');
    // this.url = 'http://api.walmartlabs.com/v1/search?query=';
    // this.apiKey = 'ffqmhs47yejn9b46t9a68ex8';
  }

  getProductDetaisByKeyword(keyword){    
      let link = 'http://api.walmartlabs.com/v1/search?query='+keyword+'&format=json&apiKey=ffqmhs47yejn9b46t9a68ex8';
      // let link = this.url+data+'&format=json&apiKey='+this.apiKey;
      let response = this.http.get(link).map(res => res.json());
      return response;
  }
  
  getProductDetaisByUPC(upcValue){
      let link = 'http://api.walmartlabs.com/v1/items?apiKey=ffqmhs47yejn9b46t9a68ex8&upc='+upcValue;
      let response = this.http.get(link).map(res => res.json());
      return response;
  }

}
