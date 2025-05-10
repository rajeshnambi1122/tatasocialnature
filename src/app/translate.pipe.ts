import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './translate.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, distinctUntilChanged } from 'rxjs/operators';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Set to false to update on language change
})
export class TranslatePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(value: string): Observable<string> {
    if (!value) {
      return of('');
    }
    return this.translateService.getCurrentLanguage().pipe(
      distinctUntilChanged(),
      map(() => this.translateService.getTranslation(value))
    );
  }
} 