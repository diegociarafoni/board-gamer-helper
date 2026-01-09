import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  standalone: true,
  imports: [IonicModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(
    public theme: ThemeService,   
  ) {}
}
