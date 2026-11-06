/** Four L-shaped corner ticks for a bordered box (styles: .nav-corner in globals.css). The parent must be position: relative. */
export function Corners() {
  return (
    <>
      <i aria-hidden className="nav-corner nav-corner-tl" />
      <i aria-hidden className="nav-corner nav-corner-tr" />
      <i aria-hidden className="nav-corner nav-corner-bl" />
      <i aria-hidden className="nav-corner nav-corner-br" />
    </>
  );
}
