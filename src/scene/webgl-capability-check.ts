/** Gate for the 3D hero intro — falls back to the tilt-card when false. */
export function canRunHeroScene(): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  // Coarse pointer ≈ phones/tablets: serve the lightweight fallback.
  if (matchMedia('(pointer: coarse)').matches && innerWidth < 900) return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)).toLowerCase();
      if (renderer.includes('swiftshader') || renderer.includes('software')) return false;
    }
    return true;
  } catch {
    return false;
  }
}
