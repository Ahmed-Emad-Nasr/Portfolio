"use client";

/*
 * global-error.tsx — the last line of defence
 *
 * error.tsx catches errors that happen inside pages. But if the error
 * happens in app/layout.tsx itself, that boundary never mounts — because it
 * lives inside the layout that failed.
 *
 * global-error.tsx solves that: it replaces the entire document, which is
 * why it is the only file in the project that renders <html> and <body>
 * itself.
 *
 * Note: it uses neither globals.css nor any CSS module. If the layout
 * failed, something in the loading chain is most likely broken — so the
 * styling here is inline, to work even if no stylesheet arrived.
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
