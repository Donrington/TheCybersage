/**
 * Dashes used as punctuation make writing read as machine-made, so the assistant never shows them. The system prompt
 * asks the model not to write them; this is the backstop for the odd one that slips through, applied to the stream
 * before it reaches the page.
 *
 *   em dash (and a spaced en dash, a spaced hyphen, or "--")  ->  a comma
 *   an en dash between two numbers                            ->  " to "
 *
 * Hyphens inside words (full-stack, end-to-end) are left alone.
 */
export function stripDashes(text: string): string {
  return text
    .replace(/(\d)\s*–\s*(\d)/g, '$1 to $2')
    .replace(/\s*—\s*|\s+–\s+|[ \t]+-{1,2}[ \t]+|[ \t]*--+[ \t]*/g, ', ')
    .replace(/,(\s*)([.,!?;:])/g, '$2');
}

/**
 * The same thing for a stream. A dash, the space around it, the character before it and any number after it can
 * arrive in different chunks, so the end of each chunk that could still become part of a dash is held back until the
 * next one shows what follows (and released by flush() when the stream ends).
 */
export function createDashFilter() {
  let hold = '';
  return {
    push(chunk: string): string {
      const s = hold + chunk;
      // Hold: a dash with its neighbours (and digits after it, for a year range such as 2016-2021), or trailing
      // whitespace, or a trailing digit that a dash may be about to follow.
      const m = /(?:\S?\s*[–—-]+\s*\d*|\s+|\d)$/.exec(s);
      const cut = m ? m.index : s.length;
      hold = s.slice(cut);
      return stripDashes(s.slice(0, cut));
    },
    flush(): string {
      const out = stripDashes(hold).replace(/,\s*$/, '.');
      hold = '';
      return out;
    },
  };
}
