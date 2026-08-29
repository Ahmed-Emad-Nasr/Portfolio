/*
 * core/icons/Icon.tsx
 *
 * بديل <FontAwesomeIcon /> — نفس النتيجة البصرية، من غير الـ 94 كيلوبايت
 * بتاعة محرّك FontAwesome (شوف التعليق في icon-data.ts).
 *
 * Server Component عن قصد: مفيش "use client". الأيقونة SVG ثابت مفيهوش
 * أي تفاعل، فمفيش سبب تتحمّل في المتصفح — بتترندر لـ markup وقت الـ build
 * وخلاص. (لو استوردها client component، بتشتغل جوّاه عادي — بس ساعتها
 * الجدول بيتحزم معاه.)
 *
 * الأبعاد بتيجي من `1em` عشان الأيقونة تتبع حجم الخط بتاع اللي حواليها،
 * زي FontAwesome بالظبط.
 */

import { ICONS, type IconName } from "./icon-data";

type IconProps = {
  name: IconName;
  className?: string;
  /** لو الأيقونة معناها مهم، اكتب هنا نص بديل — غير كده بتتخفي عن قارئ الشاشة */
  title?: string;
};

export default function Icon({ name, className, title }: IconProps) {
  const [width, height, path] = ICONS[name];

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      /* fill="currentColor" بيخلي الأيقونة تاخد لون النص المحيط بيها من
         غير أي قاعدة CSS إضافية — نفس سلوك FontAwesome. */
      fill="currentColor"
      width="1em"
      height="1em"
      /* الأيقونات هنا كلها زخرفية بجانب نص مكتوب. لو واحدة منها هي المعنى
         الوحيد، مرّر title وهي بتتحوّل لـ role="img" باسم. */
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  );
}

export type { IconName };
