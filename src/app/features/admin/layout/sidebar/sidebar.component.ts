import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { UserService } from '../../../../core/services/user.service';

interface NavItem {
  id: string;
  label: string;
  iconPath: string;
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AvatarComponent, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly userService = inject(UserService);
  private readonly router = inject(Router);

  userMenuOpen = signal(false);

  readonly navItems: NavItem[] = [
    {
      id: 'dash',
      label: 'Resumen',
      iconPath: 'M3 12L12 4l9 8M5 11v8h5v-5h4v5h5v-8',
      route: '/dashboard',
    },
    {
      id: 'schedule',
      label: 'Horario',
      iconPath: 'M4 6h16M4 12h16M4 18h16',
      route: '/schedule',
    },
    {
      id: 'calendar',
      label: 'Calendario',
      iconPath: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1',
      route: '/calendario',
    },
    {
      id: 'res',
      label: 'Reservas',
      iconPath: 'M5 4h11l3 3v13H5zM9 9h7M9 13h7M9 17h5',
      route: '/reservations',
    },
    {
      id: 'cust',
      label: 'Clientes',
      iconPath:
        'M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2 19c0-3 3-5 6-5s6 2 6 5M14 14c2 0 6 1 6 5',
      route: '/clients',
    },
  ];

  toggleUserMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.userMenuOpen.update(v => !v);
  }

  signOut(): void {
    this.userService.signOut();
    this.userMenuOpen.set(false);
    this.router.navigate(['/login']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.userMenuOpen()) this.userMenuOpen.set(false);
  }
}
