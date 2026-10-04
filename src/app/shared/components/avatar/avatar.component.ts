import { Component, Input } from '@angular/core';

const AVATAR_COLORS: [string, string][] = [
  ['#0e3b29', '#d4ff3a'],
  ['#c46a3e', '#fef3e8'],
  ['#2a6fb5', '#dbeafe'],
  ['#6b4ba7', '#ede4ff'],
  ['#0a1f17', '#d4ff3a'],
  ['#7a3e30', '#fbe8d6'],
];

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div
      class="avatar"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.font-size.px]="size * 0.38"
      [style.background]="bg"
      [style.color]="fg"
      [style.box-shadow]="ring ? '0 0 0 2px var(--pc-card), 0 0 0 4px ' + ring : null"
    >{{ initials }}</div>
  `,
  styles: [`
    .avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--pc-display);
      font-weight: 600;
      flex-shrink: 0;
      user-select: none;
    }
  `],
  host: { style: 'display: inline-flex; flex-shrink: 0;' },
})
export class AvatarComponent {
  @Input() name = '';
  @Input() size = 32;
  @Input() ring?: string;

  get initials(): string {
    return this.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '·';
  }

  private get colorIndex(): number {
    return [...this.name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  }

  get bg(): string { return AVATAR_COLORS[this.colorIndex][0]; }
  get fg(): string { return AVATAR_COLORS[this.colorIndex][1]; }
}
