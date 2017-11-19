import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the GoogleApiProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class GoogleApiProvider {

  public url: string;
  public apiKey: string;

  constructor(public http: Http) {
    console.log('Hello GoogleApiProvider Provider');
  }

  getPlaceSearchDetailsByLocation(keyword,lat,long){    
    let link = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+keyword+'&location='+lat+','+long+'&radius=10000&key=AIzaSyCXoadpcxrX-M88DytYIAaUK_Jk2tmROxY';
    // let link = this.url+data+'&format=json&apiKey='+this.apiKey;
    let response = this.http.get(link).map(res => res.json());
    return response;
  }

  getPlaceSearchDetails(keyword){    
    let link = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+keyword+'&key=AIzaSyCXoadpcxrX-M88DytYIAaUK_Jk2tmROxY';
    // let link = this.url+data+'&format=json&apiKey='+this.apiKey;
    let response = this.http.get(link).map(res => res.json());
    return response;
  }

}
