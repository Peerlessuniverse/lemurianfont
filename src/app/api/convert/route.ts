import { NextRequest, NextResponse } from 'next/server'

// Pemetaan karakter Latin ke simbol Unicode legacy (Old Italic, Old Turkic, Psalter Pahlavi)
const latinToLegacyUnicode: Record<string, string> = {
  'a': '𐌀', 'b': '𐌁', 'c': '𐌂', 'd': '𐌃', 'e': '𐌄', 'f': '𐌅', 'g': '𐌆', 'h': '𐌇',
  'i': '𐌉', 'j': '𐌊', 'k': '𐌋', 'l': '𐌌', 'm': '𐌍', 'n': '𐌎', 'o': '𐌏', 'p': '𐌐',
  'q': '𐌑', 'r': '𐌒', 's': '𐌓', 't': '𐌔', 'u': '𐌕', 'v': '𐌖', 'w': '𐌗', 'x': '𐌘',
  'y': '𐌙', 'z': '𐌚',
  'A': '𐰀', 'B': '𐰁', 'C': '𐰂', 'D': '𐰃', 'E': '𐰄', 'F': '𐰅', 'G': '𐰆', 'H': '𐰇',
  'I': '𐰈', 'J': '𐰉', 'K': '𐰊', 'L': '𐰋', 'M': '𐰌', 'N': '𐰍', 'O': '𐰎', 'P': '𐰏',
  'Q': '𐰐', 'R': '𐰑', 'S': '𐰒', 'T': '𐰓', 'U': '𐰔', 'V': '𐰕', 'W': '𐰖', 'X': '𐰗',
  'Y': '𐰘', 'Z': '𐰙',
  ' ': ' ', '.': '𐹹', ',': '𐹺', '!': '𐹻', '?': '𐹼', ':': '𐹽', ';': '𐹾',
  '0': '𐹠', '1': '𐹡', '2': '𐹢', '3': '𐹣', '4': '𐹤', '5': '𐹥', '6': '𐹦', '7': '𐹧', '8': '𐹨', '9': '𐹩'
}

// Pemetaan balik dari simbol Unicode legacy ke karakter Latin standar
const legacyUnicodeToLatin: Record<string, string> = Object.fromEntries(
  Object.entries(latinToLegacyUnicode).map(([latin, legacy]) => [legacy, latin])
)

/**
 * Mengonversi teks dengan iterasi berbasis Unicode code point (Array.from)
 * agar surrogate pair tidak terpecah, dan menormalkan simbol Unicode legacy ke Latin
 * yang didukung langsung oleh font LemurianTrueType-Regular.
 */
function normalizeToStandardChars(text: string): string {
  return Array.from(text)
    .map((char) => legacyUnicodeToLatin[char] ?? char)
    .join('')
}

export async function POST(request: NextRequest) {
  try {
    const { text, direction } = await request.json()

    if (typeof text !== 'string' || !text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (direction !== 'latin-to-lemurian' && direction !== 'lemurian-to-latin') {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }

    // Font LemurianTrueType memetakan glyph Aksara Lemuria langsung ke karakter Latin/ASCII,
    // sekaligus tetap mendukung decoding teks Unicode legacy pada kedua arah.
    const result = normalizeToStandardChars(text)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}