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

export type RevealOptions = { x?: number; y?: number; duration?: number; delay?: number };

export const rv = ({ x = 0, y = 24, duration = 0.7, delay = 0 }: RevealOptions = {}): string =>
  `${x},${y},${duration},${+delay.toFixed(3)}`;

/* Kept as plain ES5 so it runs as-is in an inline <script>. The easing is
   core/motion.ts EASE. */
export const REVEAL_SCRIPT = `(function(){try{
var w=window,d=document;
if(!("IntersectionObserver"in w)||!d.documentElement.animate||w.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var E="cubic-bezier(0.23,1,0.32,1)",S=w.WeakMap?new WeakMap():null;if(!S)return;
var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){var e=es[i];if(!e.isIntersecting)continue;var el=e.target;io.unobserve(el);var h=S.get(el);
var p=(el.getAttribute("data-reveal")||"").split(","),x=+p[0]||0,y=p[1]===undefined?24:+p[1]||0,t=(+p[2]||0.7)*1000,dl=(+p[3]||0)*1000;
el.animate([{opacity:0,transform:"translate("+x+"px,"+y+"px)"},{opacity:1,transform:"none"}],{duration:t,delay:dl,easing:E,fill:"backwards"});
if(h)h.cancel();}},{rootMargin:"0px 0px -40px 0px"});
var H=[],P=0;
function add(el){if(P||S.has(el))return;var h=el.animate([{opacity:0}],{duration:1,fill:"forwards"});S.set(el,h);H.push(h);io.observe(el);}
w.addEventListener("beforeprint",function(){P=1;for(var i=0;i<H.length;i++)H[i].cancel();io.disconnect();});
function scan(n){if(n.nodeType!==1)return;if(n.hasAttribute("data-reveal"))add(n);if(!n.firstElementChild)return;var l=n.querySelectorAll("[data-reveal]");for(var i=0;i<l.length;i++)add(l[i]);}
scan(d.documentElement);
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j]);}}).observe(d.documentElement,{childList:true,subtree:true});
}catch(e){}})();`;
