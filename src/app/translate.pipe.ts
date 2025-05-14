import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './translate.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Set to false to update on language change
})
export class TranslatePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(value: string): string | null {
    if (!value) {
      return '';
    }
    
    // Get the translation directly
    return this.translateService.getTranslation(value);
  }
}