/**
 * Technical-drawing frame: a hairline inset from the viewport edge, corner registration crosses and a dashed
 * ruler along the top and bottom. Pure CSS, fixed, pointer-events none; mix-blend-mode difference keeps it
 * visible on both ink and white sections. (Idea from the heronaiapp.com study, docs/redesign/heron-analysis.md.)
 */
export function SheetFrame() {
  return (
    <div aria-hidden className="sheet-frame">
      <span className="sheet-cross sheet-cross-tl">+</span>
      <span className="sheet-cross sheet-cross-tr">+</span>
      <span className="sheet-cross sheet-cross-bl">+</span>
      <span className="sheet-cross sheet-cross-br">+</span>
    </div>
  );
}
