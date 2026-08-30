"use client";

/*
 * global-error.tsx — آخر خط دفاع
 *
 * error.tsx بيمسك الأخطاء اللي بتحصل جوه الصفحات. بس لو الخطأ حصل في
 * app/layout.tsx نفسه، الـ boundary ده مبيتركّبش أصلاً — لأنه بيعيش
 * جوه الـ layout اللي وقع.
 *
 * global-error.tsx بيحل ده: بيستبدل الـ document كله، عشان كده هو
 * الملف الوحيد في المشروع اللي بيرندر <html> و<body> بإيده.
 *
 * ملاحظة: مبيستخدمش globals.css ولا أي CSS module. لو الـ layout وقع،
 * الأرجح إن حاجة في سلسلة التحميل مكسورة — فالستايل هنا inline عشان
 * يشتغل حتى لو مفيش أي stylesheet وصل.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          background: "#000",
          color: "#fff",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, color: "#bc002d", letterSpacing: "0.3em", fontSize: "0.85rem" }}>
          FATAL
        </p>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
          The site failed to load
        </h1>
        <p style={{ margin: 0, maxWidth: "42ch", lineHeight: 1.6, color: "#a59f90" }}>
          Something went wrong before the page could render. Reloading usually
          fixes it.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            padding: "0.7rem 1.6rem",
            background: "transparent",
            color: "#ffd700",
            border: "1px solid #ffd700",
            borderRadius: "2px",
            font: "inherit",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
        {error.digest && (
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6a6a6a" }}>
            Error reference: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
