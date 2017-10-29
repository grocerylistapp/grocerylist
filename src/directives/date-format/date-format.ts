import { Directive, ElementRef, Renderer } from '@angular/core';

/**
 * Generated class for the DateFormatDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */
@Directive({
  selector: '[date-format]' // Attribute selector
})
export class DateFormatDirective {

  constructor(public element: ElementRef, public renderer: Renderer) {
    console.log('Hello DateFormatDirective Directive');
    console.log(this.element.nativeElement);
  }

}
