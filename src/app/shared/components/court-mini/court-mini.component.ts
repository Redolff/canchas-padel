import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-court-mini',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="10" rx="1.5" [attr.stroke]="color" stroke-width="1.2"/>
      <line x1="10" y1="5" x2="10" y2="15" [attr.stroke]="color" stroke-width="1.2" stroke-dasharray="1 1"/>
      <line x1="6"  y1="5" x2="6"  y2="15" [attr.stroke]="color" stroke-width="0.8" opacity=".5"/>
      <line x1="14" y1="5" x2="14" y2="15" [attr.stroke]="color" stroke-width="0.8" opacity=".5"/>
      <line x1="2"  y1="10" x2="6"  y2="10" [attr.stroke]="color" stroke-width="0.8" opacity=".5"/>
      <line x1="14" y1="10" x2="18" y2="10" [attr.stroke]="color" stroke-width="0.8" opacity=".5"/>
    </svg>
  `,
  host: { style: 'display: inline-flex; align-items: center; flex-shrink: 0;' },
})
export class CourtMiniComponent {
  @Input() size = 20;
  @Input() color = '#0e3b29';
}
