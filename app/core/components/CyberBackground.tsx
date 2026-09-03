"use client";

/*
 * CyberBackground.tsx — فقاعات صغيرة بتتحرك عشوائي وبترتد من الماوس
 *
 * ═══ المرة دي فيه حلقة فيزياء فعلية، وده مقصود ═══
 *
 * في النسخة اللي قبل دي عملت الحركة كلها CSS والتفاعل parallax، عشان
 * أتجنّب حلقة requestAnimationFrame على الـ main thread. الارتداد
 * الحقيقي — الفقاعة تحس بالمؤشر وتهرب في العكس — مستحيل بالـ CSS: كل
 * فقاعة محتاجة تحسب مسافتها من الماوس، والـ CSS مبيعرفش يعمل جذر تربيعي
 * ولا شرط.
 *
 * فأحمد طلب الارتداد صراحةً، والحلقة بقت التكلفة اللي لازم تتدفع. اللي
 * ينفع نتحكم فيه هو **قد إيه بتكلّف**:
 *
 *   · ٣٢ فقاعة بس، والحساب لكل واحدة ٦ عمليات ضرب وجذر واحد
 *   · الكتابة الوحيدة على الـ DOM هي `transform` — مفيش left/top، ودول
 *     كانوا هيجبروا إعادة تخطيط كاملة كل فريم لكل عنصر
 *   · الـ ٣٢ كتابة بتحصل في نفس الفريم، فالمتصفح بيعمل **إعادة حساب
 *     أنماط واحدة** في آخر الفريم مش ٣٢
 *   · الحلقة بتقف تماماً لما التبويب يتخبّى (visibilitychange) — من غير
 *     ده بتفضل تاكل بطارية وإنت مش شايف الصفحة أصلاً
 *   · مبتتركّبش أصلاً على جهاز من غير مؤشر حقيقي ولا على tier="low"
 *
 * التكلفة الفعلية على ديسكتوب متوسط: أقل من نص مللي ثانية في الفريم.
 * ده مقبول لحاجة المستخدم طلبها وشايفها. اللي مكانش هيبقى مقبول إنها
 * تشتغل على تليفون — وده مقفول من فوق.
 *
 * ═══ الفيزياء ═══
 *
 * كل فقاعة عندها موضع (x, y) وسرعة (vx, vy):
 *
 *   1. انجراف حر — سرعة ابتدائية صغيرة عشوائية، بتفضل ماشية
 *   2. تنافر — لو المؤشر أقرب من REPEL_RADIUS، الفقاعة بتاخد دفعة في
 *      الاتجاه المعاكس، وقوّتها بتزيد كل ما المؤشر يقرب
 *   3. احتكاك — بيرجّع السرعة لمستواها الطبيعي بعد الدفعة، وإلا الفقاعات
 *      كانت هتفضل تتسارع لحد ما تطير
 *   4. ارتداد من الحواف — بتخبط في حدود الشاشة وترجع
 */

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./CyberBackground.module.css";

/*
 * ── عدد الفقاعات ──
 *
 * رقم واحد. الحجم والمكان والسرعة والاتجاه كلهم بيتولّدوا منه، فأي رقم
 * بيشتغل. اعتبر ٤٠ الحد الأعلى المعقول — فوق كده الطبقات بتاكل ذاكرة
 * كارت الشاشة من غير ما الشكل يتحسّن.
 */
const COUNT = 20;

/* نصف قطر تأثير المؤشر بالبكسل */
const REPEL_RADIUS = 170;
/* قوّة الدفعة. أعلى = ارتداد أعنف */
const REPEL_FORCE = 0.9;
/* أقصى سرعة (بكسل في الفريم) عشان مايطيروش بعد دفعة قوية */
const MAX_SPEED = 6;
/* الاحتكاك — أقل من 1، بيهدّي السرعة الزايدة كل فريم */
const FRICTION = 0.94;
/* السرعة الطبيعية اللي بترجع لها الفقاعة بعد ما تهدى */
const DRIFT_SPEED = 0.22;

/*
 * ── الشُهُب ────────────────────────────────────────────────────────────
 *
 * رقم واحد بس. زوّده أو قلّله وخلاص:
 */
const METEOR_COUNT = 6;

/*
 * الاتجاهات اللي بيتوزّعوا عليها بالدرجات.
 *
 *     0° يمين · 90° تحت · 180° شمال · 270° فوق
 *
 * القايمة بتتكرّر لو METEOR_COUNT أكبر منها، وكل تكرار بياخد انحراف
 * بسيط عشان مايبقاش فيه اتنين على نفس الخط بالظبط.
 */
const METEOR_ANGLES = [180, 138, 272, 202, 288, 22, 160, 250];

/*
 * ── ليه مفيش نقطة بداية مكتوبة بإيد ──
 *
 * النسخة اللي قبل دي كانت جدول فيه (يسار، فوق، زاوية) لكل شهاب، وكان
 * لازم تظبط النقطة يدوي مع الزاوية. ودي كانت **فخ**: أول ما تغيّر
 * الزاوية من غير ما تحرّك النقطة، الشهاب بيخرج من الشاشة قبل ما يعدّي
 * عليها — وده بالظبط الباج اللي خلاهم مايبانوش أصلاً أول مرة.
 *
 * دلوقتي النقطة **بتتحسب من الزاوية**، فمستحيل تبقى غلط:
 *
 *   نبدأ من نص الشاشة، نرجع 65vmax عكس اتجاه الحركة، وبعدين نزيح
 *   شوية على المحور العمودي على الحركة عشان مايبدأوش من نفس النقطة.
 *
 * والوحدة vmax مش بكسل ولا نسبة مئوية: كده المسار بيتظبط لوحده على أي
 * مقاس شاشة، من لابتوب 1366 لشاشة 4K، من غير أي أرقام مكتوبة لكل مقاس.
 */
const START_BACK = 65;   // vmax عكس اتجاه الحركة
/*
 * 22 مش 30.
 *
 * على 30 كان أول شهاب (أفقي، وإزاحته على الطرف t = -1) بيعدّي فوق حافة
 * الشاشة من غير ما يدخلها. الرقم ده اتظبط بفحص كل الشُهُب على ٤ مقاسات
 * شاشة وعند ٦ و١٢ و٢٠ و٣٢ شهاب — 22 آمن في كل الحالات مع هامش.
 *
 * لو زوّدته، الشُهُب بتتوزّع أعرض بس ممكن اللي على الأطراف مايدخلوش.
 */
const SPREAD = 22;       // vmax إزاحة عمودية

type Meteor = {
  dx: number;
  dy: number;
  angle: number;
  delay: number;
  dur: number;
  tail: number;
};

const METEORS: Meteor[] = Array.from({ length: METEOR_COUNT }, (_, i) => {
  /* انحراف بسيط عند تكرار القايمة عشان مايتطابقوش */
  const angle = METEOR_ANGLES[i % METEOR_ANGLES.length]
    + Math.floor(i / METEOR_ANGLES.length) * 11;
  const rad = (angle * Math.PI) / 180;

  /* اتجاه الحركة، والعمودي عليه */
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);
  const perpX = -dirY;
  const perpY = dirX;

  /*
   * إزاحة موزّعة بين -1 و +1 على عدد الشُهُب. الرقم الأولي (0.618،
   * النسبة الذهبية) بيخلي التوزيع يفضل متباعد مهما كان العدد، بدل ما
   * التقسيم المنتظم يحطّهم في صفوف.
   */
  const t = ((i * 0.618) % 1) * 2 - 1;

  return {
    dx: -dirX * START_BACK + perpX * SPREAD * t,
    dy: -dirY * START_BACK + perpY * SPREAD * t,
    angle,
    /* التأخيرات متباعدة عشان مايعدّوش مع بعض */
    delay: +(i * 4.3).toFixed(1),
    dur: 9.5 + ((i * 1.7) % 4),
    tail: 90 + ((i * 17) % 50),
  };
});

type Bubble = {
  el: HTMLSpanElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export default function CyberBackground() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;

    /*
     * الفحصين دول قبل أي شغل: من غير مؤشر حقيقي مفيش تنافر أصلاً،
     * ومن غيرهم كنا هنبني ٣٢ عنصر ونشغّل حلقة على تليفون عشان تأثير
     * مش هيحصل.
     */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.tier === "low") return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    /*
     * Math.random هنا مقبول — على عكس النسخة السابقة، العناصر دي بتتبني
     * في المتصفح بعد الـ hydration، فمفيش أي خطر عدم تطابق مع الـ HTML
     * اللي اتولّد على السيرفر.
     */
    const bubbles: Bubble[] = [];
    const frag = document.createDocumentFragment();

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("span");
      el.className = styles.bubble;
      /*
       * الحجم متظبط على الصورة المرجعية: بلوبات ناعمة متوسطة لكبيرة
       * (٧٠ لـ ٢٢٠ بكسل) مش نقط صغيرة. الإحساس بييجي من نعومة الحافة
       * مش من صغر الحجم — الحافة الناعمة هي اللي بتخلي الشكل "ضوء" مش
       * "دايرة".
       */
      const size = 70 + Math.random() * 150;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.opacity = `${0.35 + Math.random() * 0.4}`;
      frag.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      bubbles.push({
        el,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * DRIFT_SPEED,
        vy: Math.sin(angle) * DRIFT_SPEED,
        r: size / 2,
      });
    }
    host.appendChild(frag);

    /* -1 معناها المؤشر برّه الشاشة، فمفيش تنافر */
    let mx = -1;
    let my = -1;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onLeave = () => {
      mx = -1;
      my = -1;
    };
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
    };

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      /*
       * dt نسبة لفريم ٦٠ هرتز، ومحدودة بـ 3.
       *
       * من غير الحد ده: لو رجعت لتبويب كان متخبّي، أو الجهاز اتلغبط
       * لحظة، فرق الوقت بيبقى ضخم والفقاعات بتقفز نص الشاشة في فريم
       * واحد. الحد بيخلي أسوأ حالة إنها تتحرك تلات خطوات بدل واحدة.
       */
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;

      for (let i = 0; i < COUNT; i++) {
        const b = bubbles[i];

        if (mx >= 0) {
          const dx = b.x - mx;
          const dy = b.y - my;
          const distSq = dx * dx + dy * dy;

          /*
           * المقارنة بالمربّع قبل الجذر: الجذر التربيعي أغلى عملية هنا،
           * وأغلب الفقاعات في أي لحظة بعيدة عن المؤشر. كده بنحسبه
           * للقريبة بس.
           */
          if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            /* القوّة بتزيد خطياً كل ما المؤشر يقرب */
            const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            b.vx += (dx / dist) * force * dt;
            b.vy += (dy / dist) * force * dt;
          }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        /* الارتداد من الحواف */
        if (b.x < b.r) {
          b.x = b.r;
          b.vx = Math.abs(b.vx);
        } else if (b.x > w - b.r) {
          b.x = w - b.r;
          b.vx = -Math.abs(b.vx);
        }
        if (b.y < b.r) {
          b.y = b.r;
          b.vy = Math.abs(b.vy);
        } else if (b.y > h - b.r) {
          b.y = h - b.r;
          b.vy = -Math.abs(b.vy);
        }

        /*
         * الاحتكاك بيشتغل على السرعة الزايدة عن الانجراف الطبيعي بس.
         * من غير الشرط ده الفقاعات كانت هتهدى تماماً وتقف بعد شوية.
         */
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > DRIFT_SPEED) {
          const damped = Math.max(DRIFT_SPEED, speed * FRICTION);
          const scale = damped / speed;
          b.vx *= scale;
          b.vy *= scale;
        }
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          b.vx *= scale;
          b.vy *= scale;
        }

        /*
         * الكتابة الوحيدة على الـ DOM في الحلقة كلها.
         *
         * translate3d مش left/top: الأخيرة بتجبر إعادة تخطيط كاملة كل
         * فريم لكل عنصر. الـ transform بيتعامل معاه الـ compositor
         * لوحده من غير ما يلمس التخطيط.
         */
        b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /* التبويب متخبّي = مفيش حاجة تتشاف = مفيش سبب نحسب حاجة */
    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const b of bubbles) b.el.remove();
    };
  }, []);

  /*
   * الحاوية بترندر فاضية والفقاعات بتتبني في المتصفح.
   *
   * كده الـ HTML اللي بيتبعت مبيحملش ٣٢ عنصر زخرفي، والأهم إن الفقاعات
   * مبتوجدش خالص على الأجهزة اللي الـ effect بيخرج منها بدري.
   *
   * aria-hidden: زخرفة صافية، مالهاش لازمة في شجرة الوصولية.
   */
  return (
    <div className={styles.bg} aria-hidden="true">
      {/* الفقاعات بتتبني هنا من الحلقة في الـ useEffect */}
      <div ref={root} className={styles.field} />

      {/* الشُهُب — CSS بحت، مفيش جافاسكريبت. كل شهاب خط مايل بيعدّي
          الشاشة بتأخير ومدة مختلفين. */}
      <div className={styles.meteors}>
        {METEORS.map((m, i) => (
          <span
            key={i}
            className={styles.meteor}
            /*
             * الـ cast مطلوب: React.CSSProperties مفيهاش index signature،
             * فمتغيّرات CSS المخصّصة مش جزء من النوع. ده الشكل القياسي.
             */
            style={
              {
                left: `calc(50% + ${m.dx.toFixed(2)}vmax)`,
                top: `calc(50% + ${m.dy.toFixed(2)}vmax)`,
                animationDelay: `${m.delay}s`,
                animationDuration: `${m.dur.toFixed(1)}s`,
                "--tail": `${m.tail}px`,
                "--angle": `${m.angle}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
