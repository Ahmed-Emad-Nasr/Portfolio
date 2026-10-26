/*
 * core/reveal.ts — scroll entrances without a React component per element.
 *
 * Usage:  <div data-reveal={rv({ y: 32, delay: 0.1 })} …>
 *
 * The entrance runs in one small inline script (REVEAL_SCRIPT, injected at
 * the top of <body> in layout.tsx): an IntersectionObserver plays a Web
 * Animations API fade/slide when the element first scrolls into view. It
 * replaces ~40 framer-motion `whileInView` components and the FadeIn
 * wrapper, each of which had to download, hydrate and register its own
 * observer before the page could show anything — and which were rendered
 * at opacity 0 in the server HTML, so content stayed invisible until
 * hydration finished. Now:
 *
 *  · nothing waits for React — the script runs while the HTML is parsed;
 *  · the DOM is never mutated (no classes, no inline styles), so hydration
 *    never sees a mismatch and no style is left behind after the entrance
 *    (hover transforms keep working);
 *  · printing (the CV) reveals everything first — nothing below the fold
 *    prints blank;
 *  · reduced motion, or a browser without IntersectionObserver / WAAPI,
 *    simply sees the content — nothing is hidden by CSS, so a failed
 *    script can never leave the page blank.
 *
 * Format of the attribute: "x,y,duration,delay" (px, px, s, s).
 */

type RevealOptions = { x?: number; y?: number; duration?: number; delay?: number };

export const rv = ({ x = 0, y = 24, duration = 0.7, delay = 0 }: RevealOptions = {}): string =>
  `${x},${y},${duration},${+delay.toFixed(3)}`;

/*
 * The choreography (tuned to match the hero's own entrance — globals.css,
 * .hero-content):
 *
 *  · late start: an element waits until it is ~15% inside the screen, so a
 *    section is seen arriving instead of having finished before the reader
 *    got there;
 *  · slow, long ease-out: each component's own values (data-reveal) are
 *    scaled to the hero's tempo — ~1–1.35 s, travel up to 56 px, the hero's
 *    quart-out curve;
 *  · one after another: everything that comes into view in the same frame
 *    is sorted top-to-bottom and staggered 110 ms apart, so a grid of cards
 *    cascades instead of popping in together (and the compositor gets a few
 *    layers at a time, not thirty). A component's own index delay is capped
 *    at 0.45 s — card 30 of a grid used to wait 2.4 s after scrolling in;
 *  · phones run at 0.8× of that, a little brisker under a thumb.
 *
 * Transform and opacity only: the compositor animates them off the main
 * thread, so the cascade cannot stutter the scroll.
 *
 * Kept as plain ES5 so it runs as-is in an inline <script>.
 */
export const REVEAL_SCRIPT = `(function(){try{
var w=window,d=document;
if(!("IntersectionObserver"in w)||!d.documentElement.animate||w.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var E="cubic-bezier(0.165,0.84,0.44,1)",S=w.WeakMap?new WeakMap():null;if(!S)return;
var M=w.innerWidth<768?0.8:1;
function cl(v,a,b){return v<a?a:v>b?b:v}
function sc(v,k){var s=v<0?-1:1,a=Math.abs(v)*k;return a?s*cl(a,a,56):0}
var io=new IntersectionObserver(function(es){var b=[];for(var i=0;i<es.length;i++){if(!es[i].isIntersecting)continue;b.push(es[i].target);io.unobserve(es[i].target);}
if(!b.length)return;b.sort(function(a,c){return a.compareDocumentPosition(c)&4?-1:1});
for(var j=0;j<b.length;j++){var el=b[j],h=S.get(el);
var p=(el.getAttribute("data-reveal")||"").split(","),x=+p[0]||0,y=p[1]===undefined?24:+p[1]||0,t=+p[2]||0.7,dl=+p[3]||0;
var dur=cl(t*1.6,0.95,1.35)*M*1000,del=(0.06+Math.min(dl,0.45)*1.2+Math.min(j,7)*0.11)*M*1000;
el.animate([{opacity:0,transform:"translate("+sc(x,1.4)+"px,"+sc(y,1.8)+"px)"},{opacity:1,transform:"none"}],{duration:dur,delay:del,easing:E,fill:"backwards"});
if(h)h.cancel();}},{rootMargin:"0px 0px -15% 0px"});
var H=[],P=0;
function add(el){if(P||S.has(el))return;var h=el.animate([{opacity:0}],{duration:1,fill:"forwards"});S.set(el,h);H.push(h);io.observe(el);}
w.addEventListener("beforeprint",function(){P=1;for(var i=0;i<H.length;i++)H[i].cancel();io.disconnect();});
function scan(n){if(n.nodeType!==1)return;if(n.hasAttribute("data-reveal"))add(n);if(!n.firstElementChild)return;var l=n.querySelectorAll("[data-reveal]");for(var i=0;i<l.length;i++)add(l[i]);}
scan(d.documentElement);
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j]);}}).observe(d.documentElement,{childList:true,subtree:true});
}catch(e){}})();`;
