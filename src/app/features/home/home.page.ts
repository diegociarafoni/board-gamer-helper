import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  standalone: true,
  imports: [IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(
    private router: Router,
    public theme: ThemeService,   
  ) {}

  go(mode: string): void {
    this.router.navigate(['/mode', mode]);
  }
}
