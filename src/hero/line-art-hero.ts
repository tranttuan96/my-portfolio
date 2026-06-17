/**
 * Animated line-art hero: a cosy "dev at his desk" scene drawn entirely in SVG
 * strokes. Lightweight (no three.js, no raster), crisp at any size. Motion is
 * pure CSS/SMIL — the lines wipe on, then ambient loops keep it alive:
 * gently swaying pendant lamp + plant, rising mug steam, pulsing laptop glow,
 * a subtle typing bob and an occasional blink.
 *
 * Foreground shapes (desk, laptop, mug, head, torso) are filled with the page
 * background so they cleanly occlude the strokes behind them — proper depth.
 * Stylised likeness of Tuan: round glasses, dark side-parted hair, plaid shirt.
 */
const BG = '#0e0b1a';

const SCENE = /* html */ `
<svg viewBox="0 0 760 480" role="img" aria-label="Tuan working at his desk" class="hero-svg">
  <defs>
    <clipPath id="reveal"><rect x="0" y="0" width="0" height="480">
      <animate attributeName="width" from="0" to="760" dur="1.5s" begin="0.15s"
               fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1" values="0;760"/>
    </rect></clipPath>
    <clipPath id="shirtClip"><path d="M372,198 L338,216 L332,282 L428,282 L422,216 L388,198 Z"/></clipPath>
  </defs>

  <g clip-path="url(#reveal)" stroke="#f5f0e6" stroke-width="2.4" fill="none"
     stroke-linecap="round" stroke-linejoin="round">

    <!-- window frame + floor -->
    <rect x="18" y="18" width="724" height="444" rx="20"/>
    <line x1="40" y1="384" x2="720" y2="384"/>

    <!-- door (left wall) -->
    <g opacity="0.85">
      <rect x="48" y="150" width="92" height="234" rx="4"/>
      <rect x="66" y="178" width="34" height="30" rx="2"/>
      <line x1="126" y1="270" x2="126" y2="286"/>
    </g>

    <!-- pendant lamp -->
    <g id="lamp">
      <line x1="300" y1="30" x2="300" y2="92"/>
      <path d="M280,120 L320,120 L312,94 L288,94 Z"/>
      <circle cx="300" cy="124" r="5"/>
    </g>

    <!-- AC unit (top right) -->
    <g opacity="0.85">
      <rect x="470" y="46" width="150" height="42" rx="9"/>
      <line x1="486" y1="74" x2="604" y2="74"/>
      <line x1="486" y1="80" x2="604" y2="80"/>
    </g>

    <!-- wall shelf + books (right) -->
    <g opacity="0.85">
      <line x1="600" y1="150" x2="712" y2="150"/>
      <rect x="612" y="120" width="12" height="30"/>
      <rect x="628" y="112" width="12" height="38"/>
      <path d="M648,150 L644,116 L656,118 L660,150 Z"/>
      <rect x="676" y="108" width="30" height="20" rx="2"/>
    </g>

    <!-- back counter + plant -->
    <line x1="250" y1="214" x2="470" y2="214" opacity="0.7"/>
    <g>
      <path d="M256,214 L284,214 L280,238 L260,238 Z" fill="${BG}"/>
      <g id="plant">
        <path d="M270,214 C268,190 256,182 252,170"/>
        <path d="M270,214 C272,188 286,182 290,168"/>
        <path d="M270,214 C270,186 270,176 270,162"/>
        <path d="M252,170 q-9,-3 -10,-12 q9,2 10,12 Z" stroke="#3ddc97"/>
        <path d="M290,168 q9,-3 10,-12 q-9,2 -10,12 Z" stroke="#3ddc97"/>
        <path d="M270,162 q-2,-10 4,-16 q4,8 -4,16 Z" stroke="#3ddc97"/>
      </g>
    </g>

    <!-- chair back (behind figure) -->
    <g opacity="0.8">
      <line x1="332" y1="252" x2="332" y2="296"/>
      <line x1="430" y1="252" x2="430" y2="296"/>
      <path d="M332,258 q49,-14 98,0"/>
    </g>

    <!-- desk (drawn before figure; top fill occludes the chair behind) -->
    <rect x="250" y="282" width="260" height="13" rx="5" fill="${BG}"/>
    <line x1="270" y1="295" x2="270" y2="384"/>
    <line x1="490" y1="295" x2="490" y2="384"/>

    <!-- figure -->
    <g id="figure">
      <!-- typing forearms (behind laptop) -->
      <g id="typing">
        <path d="M342,222 C348,244 354,256 366,266"/>
        <path d="M418,222 C412,244 406,256 394,266"/>
      </g>
      <!-- torso / plaid shirt (bg fill hides chair + arms roots) -->
      <path d="M372,198 L338,216 L332,282 L428,282 L422,216 L388,198 Z" fill="${BG}"/>
      <g clip-path="url(#shirtClip)" opacity="0.5">
        <line x1="356" y1="200" x2="350" y2="282"/>
        <line x1="380" y1="198" x2="380" y2="282"/>
        <line x1="404" y1="200" x2="410" y2="282"/>
        <line x1="334" y1="232" x2="426" y2="232"/>
        <line x1="333" y1="258" x2="427" y2="258"/>
      </g>
      <path d="M372,200 L380,212 L388,200"/>
      <!-- neck + head -->
      <line x1="372" y1="190" x2="372" y2="200"/>
      <line x1="388" y1="190" x2="388" y2="200"/>
      <circle cx="380" cy="150" r="40" fill="${BG}"/>
      <!-- hair -->
      <path d="M341,150 C340,112 360,104 382,104 C404,104 420,118 420,150
               C414,132 398,124 380,124 C360,124 346,132 341,150 Z" fill="#f5f0e6" fill-opacity="0.14"/>
      <path d="M384,112 C398,116 410,128 414,144"/>
      <!-- glasses -->
      <circle cx="364" cy="154" r="13"/>
      <circle cx="396" cy="154" r="13"/>
      <line x1="377" y1="154" x2="383" y2="154"/>
      <line x1="351" y1="152" x2="343" y2="150"/>
      <line x1="409" y1="152" x2="417" y2="150"/>
      <g id="eyes">
        <circle cx="364" cy="154" r="2.6" fill="#f5f0e6" stroke="none"/>
        <circle cx="396" cy="154" r="2.6" fill="#f5f0e6" stroke="none"/>
      </g>
      <path d="M370,172 q10,7 20,0"/>
    </g>

    <!-- laptop (lid from behind; bg fill occludes the hands) -->
    <g>
      <circle id="logoGlow" cx="382" cy="257" r="16" fill="#ffd23f" stroke="none" opacity="0.16"/>
      <rect x="336" y="232" width="92" height="50" rx="7" fill="${BG}"/>
      <circle id="logo" cx="382" cy="257" r="9" stroke="#ffd23f"/>
      <line x1="330" y1="284" x2="434" y2="284"/>
    </g>

    <!-- mug + steam -->
    <g>
      <rect x="268" y="252" width="30" height="30" rx="4" fill="${BG}"/>
      <path d="M298,260 q12,2 0,14"/>
      <line x1="268" y1="284" x2="298" y2="284"/>
    </g>
    <g id="steam" stroke="#f5f0e6">
      <path class="wisp w1" d="M278,250 q-6,-8 0,-16 q6,-8 0,-16"/>
      <path class="wisp w2" d="M290,250 q6,-8 0,-16 q-6,-8 0,-16"/>
    </g>

    <!-- floating "working" motif -->
    <text id="codeTag" x="452" y="208" fill="#3ddc97" stroke="none"
          font-family="monospace" font-size="19">&lt;/&gt;</text>
  </g>
</svg>`;

export function mountLineArtHero(): void {
  const host = document.getElementById('heroArt');
  if (!host) return;
  host.innerHTML = SCENE;
}
