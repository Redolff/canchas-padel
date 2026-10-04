import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-court-art',
  standalone: true,
  template: `
    <svg [attr.width]="width" [attr.height]="height" viewBox="0 0 280 140" style="display: block;">
      <defs>
        <linearGradient [attr.id]="uid + '-turf'" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2d6e4f"/>
          <stop offset="1" stop-color="#225a3f"/>
        </linearGradient>
        <linearGradient [attr.id]="uid + '-clay'" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#c46a3e"/>
          <stop offset="1" stop-color="#a55330"/>
        </linearGradient>
        <linearGradient [attr.id]="uid + '-blue'" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a6fb5"/>
          <stop offset="1" stop-color="#1c5694"/>
        </linearGradient>
        <pattern [attr.id]="uid + '-glass'" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
        </pattern>
      </defs>

      <!-- Glass enclosure shadow -->
      <rect x="8" y="14" width="264" height="112" rx="6" fill="rgba(10,31,23,0.15)"/>

      <!-- Court surface -->
      <rect x="10" y="14" width="260" height="112" rx="5" [attr.fill]="surfaceFill"/>
      <rect x="10" y="14" width="260" height="112" rx="5" [attr.fill]="glassFill" opacity=".4"/>

      <!-- Court lines -->
      <g [attr.stroke]="courtLine" stroke-width="1.2" fill="none" opacity="0.85">
        <rect x="18" y="22" width="244" height="96" rx="1"/>
        <line x1="80" y1="22" x2="80" y2="118"/>
        <line x1="200" y1="22" x2="200" y2="118"/>
        <line x1="18" y1="70" x2="80" y2="70"/>
        <line x1="200" y1="70" x2="262" y2="70"/>
        <line x1="140" y1="14" x2="140" y2="126"
              stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-dasharray="2 2"/>
      </g>

      <!-- Net posts -->
      <circle cx="140" cy="14" r="2.5" fill="#0a1f17"/>
      <circle cx="140" cy="126" r="2.5" fill="#0a1f17"/>

      @if (showBall) {
        <g transform="translate(108,84)">
          <circle r="5" fill="#d4ff3a" stroke="#0a1f17" stroke-width="0.8"/>
          <path d="M-4 0a4 4 0 0 1 8 0M-4 0a4 4 0 0 0 8 0"
                fill="none" stroke="#ffffff" stroke-width="0.6" opacity=".7"/>
        </g>
      }

      @if (showPlayers) {
        <g>
          <circle cx="55" cy="50" r="4" fill="#d4ff3a" stroke="#0a1f17" stroke-width=".8"/>
          <circle cx="55" cy="90" r="4" fill="#d4ff3a" stroke="#0a1f17" stroke-width=".8"/>
          <circle cx="225" cy="50" r="4" fill="#ffffff" stroke="#0a1f17" stroke-width=".8"/>
          <circle cx="225" cy="90" r="4" fill="#ffffff" stroke="#0a1f17" stroke-width=".8"/>
        </g>
      }
    </svg>
  `,
})
export class CourtArtComponent {
  private static count = 0;
  protected readonly uid = `court-${++CourtArtComponent.count}`;

  @Input() width = 280;
  @Input() height = 140;
  @Input() surface: 'turf' | 'clay' | 'blue' = 'turf';
  @Input() showBall = true;
  @Input() showPlayers = false;

  get surfaceFill(): string {
    return `url(#${this.uid}-${this.surface})`;
  }

  get glassFill(): string {
    return `url(#${this.uid}-glass)`;
  }

  get courtLine(): string {
    if (this.surface === 'blue') return '#cfe6ff';
    if (this.surface === 'clay') return '#f7d9c2';
    return '#e8ffb5';
  }
}
