import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  host: { style: 'display: inline-flex; align-items: center; line-height: 0; flex-shrink: 0;' },
  template: `
    @switch (name) {
      @case ('arrow') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4"/>
        </svg>
      }
      @case ('back') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 8H3M7 4 3 8l4 4"/>
        </svg>
      }
      @case ('user') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4">
          <circle cx="8" cy="5.5" r="2.5"/>
          <path d="M3 13.5c0-2.5 2.2-4 5-4s5 1.5 5 4"/>
        </svg>
      }
      @case ('lock') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4">
          <rect x="3" y="7" width="10" height="7" rx="1.5"/>
          <path d="M5.5 7V5a2.5 2.5 0 1 1 5 0v2" stroke-linecap="round"/>
        </svg>
      }
      @case ('eye') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4">
          <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"/>
          <circle cx="8" cy="8" r="2"/>
        </svg>
      }
      @case ('check') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 8 3.5 3.5L13 5"/>
        </svg>
      }
      @case ('shield') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.5">
          <path d="M8 1.5 3 4v3.5c0 3 2 5.5 5 7 3-1.5 5-4 5-7V4L8 1.5Z"/>
        </svg>
      }
      @case ('info') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4">
          <circle cx="8" cy="8" r="6"/>
          <path d="M8 11.5V7M8 4.8v.01" stroke-linecap="round"/>
        </svg>
      }
      @case ('bell') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4">
          <path d="M3.5 11.5h9l-1-1.5V7a3.5 3.5 0 0 0-7 0v3l-1 1.5Z"/>
          <path d="M6.5 13.5c.4.6 1 1 1.5 1s1.1-.4 1.5-1" stroke-linecap="round"/>
        </svg>
      }
      @case ('search') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.6">
          <circle cx="7" cy="7" r="4.5"/>
          <path d="m10.5 10.5 3 3" stroke-linecap="round"/>
        </svg>
      }
      @case ('plus') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round">
          <path d="M8 3v10M3 8h10"/>
        </svg>
      }
      @case ('dots') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" [attr.fill]="color">
          <circle cx="3" cy="8" r="1.4"/>
          <circle cx="8" cy="8" r="1.4"/>
          <circle cx="13" cy="8" r="1.4"/>
        </svg>
      }
      @case ('calendar') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4">
          <rect x="2" y="3.5" width="12" height="10" rx="1.5"/>
          <path d="M2 6.5h12M5 2v3M11 2v3" stroke-linecap="round"/>
        </svg>
      }
      @case ('filter') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4" stroke-linecap="round">
          <path d="M2 4h12M4 8h8M6 12h4"/>
        </svg>
      }
      @case ('chevron-left') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 4 6 8l4 4"/>
        </svg>
      }
      @case ('chevron-right') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 4l4 4-4 4"/>
        </svg>
      }
      @case ('weather') {
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16" fill="none"
             [attr.stroke]="color" stroke-width="1.4">
          <circle cx="8" cy="8" r="3"/>
          <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" stroke-linecap="round"/>
        </svg>
      }
    }
  `,
})
export class IconComponent {
  @Input() name!: string;
  @Input() size = 16;
  @Input() color = 'currentColor';
}
