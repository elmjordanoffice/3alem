"use client";
import * as React from "react";

/** Opens the browser's print dialog once the page and its fonts are ready (the PDF fallback). */
export function AutoPrint() {
  React.useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.print();
    };
    document.fonts.ready.then(() => setTimeout(go, 300));
    const t = setTimeout(go, 2500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
