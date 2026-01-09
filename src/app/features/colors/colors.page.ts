import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ColorService } from '../../core/services/color.service';

@Component({
  standalone: true,
  imports: [IonicModule],
  templateUrl: './colors.page.html',
})
export class ColorsPage {
  constructor(public colors: ColorService) {}
}
