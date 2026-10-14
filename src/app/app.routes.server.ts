import { RenderMode, ServerRoute } from '@angular/ssr';

/** Todo se prerenderiza como HTML estático para GitHub Pages. */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
