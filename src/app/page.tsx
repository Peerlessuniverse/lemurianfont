'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowRightLeft,
  Check,
  Copy,
  Download,
  FileText,
  FileType,
  Image as ImageIcon,
  Languages,
  Minus,
  PenTool,
  Plus,
  RotateCcw,
  Type,
} from 'lucide-react'

const SAMPLE_TEXT = 'Samprazaan!'

const LEMURIAN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const LEMURIAN_DIGITS = '0123456789'.split('')
const LEMURIAN_PUNCTUATION = ['.', ',', '!', '?', ':', ';', "'", '"', 'É', 'Ê']

const FONT_PRESETS = [
  { value: 'lemuria-regular', label: 'Lemurian True Type (Original)' },
  { value: 'lemuria-ancient', label: 'Lemuria Ancient (Lebar)' },
  { value: 'lemuria-classic', label: 'Lemuria Classic (Rapat)' },
  { value: 'lemuria-sacred', label: 'Lemuria Sacred (Bercahaya)' },
] as const

type FontPreset = (typeof FONT_PRESETS)[number]['value']
type TranslationMode = 'latin-to-lemurian' | 'lemurian-to-latin'

export default function Home() {
  const { toast } = useToast()
  const [latinText, setLatinText] = useState(SAMPLE_TEXT)
  const [lemurianText, setLemurianText] = useState(SAMPLE_TEXT)
  const [mode, setMode] = useState<TranslationMode>('latin-to-lemurian')
  const [selectedFont, setSelectedFont] = useState<FontPreset>('lemuria-regular')
  const [fontSize, setFontSize] = useState(30)
  const [swapSpin, setSwapSpin] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    let active = true
    if (typeof document !== 'undefined' && 'fonts' in document) {
      Promise.allSettled([
        document.fonts.load('24px LemurianTrueType'),
        document.fonts.ready,
      ]).then(() => {
        if (active) setFontReady(true)
      })
    }
    return () => {
      active = false
    }
  }, [])

  const handleLatinChange = (value: string) => {
    setLatinText(value)
    setLemurianText(value)
  }

  const handleLemurianChange = (value: string) => {
    setLemurianText(value)
    setLatinText(value)
  }

  const handleSwapMode = () => {
    setSwapSpin((prev) => !prev)
    setMode((prev) =>
      prev === 'latin-to-lemurian' ? 'lemurian-to-latin' : 'latin-to-lemurian'
    )
  }

  const renderLemurianCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const content = lemurianText.trim()
    if (!content) return null

    if ('fonts' in document) {
      await document.fonts.load(`${fontSize}px LemurianTrueType`)
      await document.fonts.ready
    }

    const scale = 2
    const canvasWidth = 1040
    const paddingX = 68
    const paddingY = 68
    const renderFontSize = Math.max(fontSize * 1.35, 34)
    const lineHeight = Math.round(renderFontSize * 1.55)
    const maxWidth = canvasWidth - paddingX * 2

    const measureCanvas = document.createElement('canvas')
    const measureCtx = measureCanvas.getContext('2d')
    if (!measureCtx) return null

    const fontSpec = `${renderFontSize}px "LemurianTrueType", sans-serif`
    measureCtx.font = fontSpec

    const rawParagraphs = content.split(/\r?\n/)
    const wrappedLines: string[] = []

    for (const paragraph of rawParagraphs) {
      // Aksara Lemuria ditulis dari kanan ke kiri (RTL)
      const displayParagraph = Array.from(paragraph).reverse().join('')
      if (!displayParagraph) {
        wrappedLines.push('')
        continue
      }
      const words = displayParagraph.split(' ')
      let currentLine = ''

      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word
        if (measureCtx.measureText(candidate).width <= maxWidth) {
          currentLine = candidate
        } else {
          if (currentLine) wrappedLines.push(currentLine)
          currentLine = word
        }
      }
      if (currentLine) wrappedLines.push(currentLine)
    }

    const canvasHeight = Math.max(280, paddingY * 2 + wrappedLines.length * lineHeight + 48)
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth * scale
    canvas.height = canvasHeight * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.scale(scale, scale)

    const bg = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
    bg.addColorStop(0, '#ffffff')
    bg.addColorStop(0.5, '#f0f9ff')
    bg.addColorStop(1, '#dbeafe')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(22, 22, canvasWidth - 44, canvasHeight - 44, 24)
    ctx.fill()
    ctx.stroke()

    ctx.font = fontSpec
    ctx.fillStyle = '#0c4a6e'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'right'
    if (selectedFont === 'lemuria-sacred') {
      ctx.shadowColor = 'rgba(14, 165, 233, 0.35)'
      ctx.shadowBlur = 12
    }

    const startX = canvasWidth - paddingX
    wrappedLines.forEach((line, index) => {
      ctx.fillText(line, startX, paddingY + index * lineHeight)
    })

    ctx.shadowBlur = 0
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(3, 105, 161, 0.65)'
    ctx.textAlign = 'right'
    ctx.fillText('Aksara Lemuria • Lemurian True Type', canvasWidth - 42, canvasHeight - 42)

    return canvas
  }

  const copyText = async (text: string) => {
    if (!text.trim()) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(true)
      toast({
        title: 'Teks disalin',
        description:
          'Gunakan tombol "Salin Gambar" jika ingin langsung paste ke WhatsApp/medsos agar bentuk aksara tidak berubah.',
      })
      setTimeout(() => setCopiedText(false), 2000)
    } catch {
      toast({
        title: 'Gagal menyalin',
        description: 'Browser menolak akses clipboard.',
        variant: 'destructive',
      })
    }
  }

  const copyImage = async () => {
    if (!lemurianText.trim()) return
    try {
      const canvas = await renderLemurianCanvas()
      if (!canvas) return

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      )
      if (!blob) throw new Error('Blob gagal dibuat')

      if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
        throw new Error('Clipboard gambar tidak didukung browser ini')
      }

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopiedImage(true)
      toast({
        title: 'Gambar Aksara Lemuria disalin!',
        description: 'Langsung tekan Ctrl + V di WhatsApp, Telegram, atau Word.',
      })
      setTimeout(() => setCopiedImage(false), 2200)
    } catch {
      toast({
        title: 'Salin gambar tidak tersedia',
        description: 'Silakan gunakan tombol "Unduh PNG" sebagai gantinya.',
        variant: 'destructive',
      })
    }
  }

  const downloadPng = async () => {
    if (!lemurianText.trim()) return
    try {
      const canvas = await renderLemurianCanvas()
      if (!canvas) return

      const link = document.createElement('a')
      link.download = 'aksara-lemuria.png'
      link.href = canvas.toDataURL('image/png')
      link.click()

      toast({
        title: 'Gambar diunduh',
        description: 'File aksara-lemuria.png berhasil diunduh.',
      })
    } catch {
      toast({
        title: 'Gagal mengunduh gambar',
        description: 'Terjadi kesalahan saat merender gambar PNG.',
        variant: 'destructive',
      })
    }
  }

  const clearAll = () => {
    setLatinText('')
    setLemurianText('')
    toast({
      title: 'Teks dibersihkan',
      description: 'Kolom Latin dan Lemuria telah dikosongkan.',
    })
  }

  const insertCharacter = (char: string) => {
    setLatinText((prev) => prev + char)
    setLemurianText((prev) => prev + char)
  }

  const getLemurianStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      fontFamily: "var(--font-lemurian), 'LemurianTrueType', sans-serif",
      fontSize: `${fontSize}px`,
      direction: 'rtl',
      unicodeBidi: 'bidi-override',
      textAlign: 'right',
    }

    switch (selectedFont) {
      case 'lemuria-ancient':
        return { ...baseStyle, letterSpacing: '0.14em', lineHeight: '1.6' }
      case 'lemuria-classic':
        return { ...baseStyle, letterSpacing: '0.02em', lineHeight: '1.45' }
      case 'lemuria-sacred':
        return {
          ...baseStyle,
          letterSpacing: '0.16em',
          lineHeight: '1.6',
          textShadow: '0 0 14px rgba(14, 165, 233, 0.35)',
        }
      case 'lemuria-regular':
      default:
        return { ...baseStyle, letterSpacing: '0.05em', lineHeight: '1.5' }
    }
  }

  const latinCard = (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 flex flex-col gap-3.5 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 shadow-inner">
            <Languages className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-800 truncate">Tulisan Latin</h2>
            <p className="text-xs text-slate-500 truncate">
              {mode === 'latin-to-lemurian' ? 'Teks sumber (Input)' : 'Hasil terjemahan Latin'}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white/80 border border-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
          {latinText.length} karakter
        </span>
      </div>

      <Textarea
        value={latinText}
        onChange={(e) => handleLatinChange(e.target.value)}
        placeholder="Ketik teks Latin di sini..."
        className="min-h-44 sm:min-h-52 w-full min-w-0 max-w-full [field-sizing:fixed] flex-1 resize-y rounded-2xl bg-white/85 border-sky-200/80 text-slate-800 text-base leading-relaxed p-4 shadow-inner focus-visible:border-sky-400 focus-visible:ring-sky-300/40 placeholder:text-slate-400"
      />
    </div>
  )

  const lemurianCard = (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 flex flex-col gap-3.5 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25">
            <PenTool className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-800 truncate">Tulisan Lemuria</h2>
            <p className="text-xs text-slate-500 truncate">
              {mode === 'lemurian-to-latin' ? 'Teks sumber (Kanan ke Kiri)' : 'Hasil Aksara Lemuria (Kanan ke Kiri)'}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-sky-500/10 border border-sky-300/60 px-3 py-1 text-xs font-semibold text-sky-700">
          Lemurian True Type
        </span>
      </div>

      <Textarea
        value={lemurianText}
        onChange={(e) => handleLemurianChange(e.target.value)}
        placeholder="Hasil Aksara Lemuria akan langsung muncul di sini..."
        className="min-h-44 sm:min-h-52 w-full min-w-0 max-w-full [field-sizing:fixed] flex-1 resize-y rounded-2xl glass-input-sky border-sky-200/90 text-sky-950 p-4 shadow-inner focus-visible:border-sky-400 focus-visible:ring-sky-300/40 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-sky-600/50"
        style={getLemurianStyle()}
      />
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100/90 text-slate-800">
      {/* Ambient Light-Blue Mesh Orbs for Glassmorphism Depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-24 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-sky-300/35 blur-3xl" />
        <div className="absolute top-1/4 -right-28 h-80 w-80 sm:h-[28rem] sm:w-[28rem] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-sky-grid opacity-70" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-5 sm:space-y-6">
        {/* Header */}
        <header className="text-center space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-medium text-sky-700">
            <span
              className={`h-2 w-2 rounded-full ${
                fontReady ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{fontReady ? 'Lemurian True Type • Font Aktif' : 'Memuat Font Lemuria...'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-800 via-sky-700 to-blue-600 bg-clip-text text-transparent pb-1">
            Konversi Aksara Lemuria
          </h1>

          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto px-2">
            Konverter modern dua arah antara tulisan Latin dan Aksara Lemuria dengan font asli,
            pratinjau real-time, serta ekspor gambar siap tempel.
          </p>
        </header>

        {/* Responsive Glass Settings Toolbar */}
        <section className="glass-panel rounded-2xl p-3.5 sm:px-5 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
            {/* Font Style */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100/90 text-sky-600">
                <Type className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 shrink-0">
                Gaya
              </span>
              <Select
                value={selectedFont}
                onValueChange={(val) => setSelectedFont(val as FontPreset)}
              >
                <SelectTrigger className="flex-1 min-w-0 sm:flex-none sm:w-64 bg-white/85 text-slate-800 border-sky-200/80 rounded-xl shadow-xs focus:ring-sky-300/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-sky-100">
                  {FONT_PRESETS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size Stepper */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ukuran Font
              </span>
              <div className="inline-flex items-center gap-1 rounded-xl bg-white/80 border border-sky-200/80 p-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-sky-700 hover:bg-sky-100/80"
                  onClick={() => setFontSize((s) => Math.max(18, s - 2))}
                  aria-label="Perkecil font"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-11 text-center text-xs font-semibold text-sky-900">
                  {fontSize}px
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-sky-700 hover:bg-sky-100/80"
                  onClick={() => setFontSize((s) => Math.min(56, s + 2))}
                  aria-label="Perbesar font"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Google Translate-style Swappable Dual Editor */}
        <section className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3 md:gap-4">
          {/* Left / Top Card */}
          <div className="min-w-0">
            {mode === 'latin-to-lemurian' ? latinCard : lemurianCard}
          </div>

          {/* Centered Swap Button */}
          <div className="flex items-center justify-center -my-2 md:my-0 z-20">
            <button
              type="button"
              onClick={handleSwapMode}
              title={
                mode === 'latin-to-lemurian'
                  ? 'Tukar ke Lemuria → Latin'
                  : 'Tukar ke Latin → Lemuria'
              }
              aria-label="Tukar posisi kotak Latin dan Lemuria"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 ring-4 ring-white/85 hover:from-sky-600 hover:to-blue-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowRightLeft
                className={`h-5 w-5 transition-transform duration-300 rotate-90 md:rotate-0 ${
                  swapSpin ? 'md:rotate-180 rotate-[270deg]' : ''
                }`}
              />
            </button>
          </div>

          {/* Right / Bottom Card */}
          <div className="min-w-0">
            {mode === 'latin-to-lemurian' ? lemurianCard : latinCard}
          </div>
        </section>

        {/* Responsive Action Controls */}
        <section className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button
            onClick={copyImage}
            disabled={!lemurianText.trim()}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25 text-xs sm:text-sm"
          >
            {copiedImage ? (
              <Check className="w-4 h-4 mr-1.5" />
            ) : (
              <ImageIcon className="w-4 h-4 mr-1.5" />
            )}
            {copiedImage ? 'Gambar Disalin!' : 'Salin Gambar'}
          </Button>

          <Button
            onClick={downloadPng}
            disabled={!lemurianText.trim()}
            className="rounded-xl glass-pill text-sky-900 hover:bg-white/95 border-sky-200/80 text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-1.5 text-sky-600" />
            Unduh PNG
          </Button>

          <Button
            onClick={() => copyText(mode === 'latin-to-lemurian' ? lemurianText : latinText)}
            disabled={!lemurianText.trim()}
            className="rounded-xl glass-pill text-sky-900 hover:bg-white/95 border-sky-200/80 text-xs sm:text-sm"
          >
            {copiedText ? (
              <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 mr-1.5 text-sky-600" />
            )}
            {copiedText ? 'Tersalin!' : 'Salin Teks'}
          </Button>

          <Button
            asChild
            className="rounded-xl glass-pill text-sky-900 hover:bg-white/95 border-sky-200/80 text-xs sm:text-sm"
          >
            <a href="/fonts/LemurianTrueType-Regular.ttf" download="LemurianTrueType-Regular.ttf">
              <FileType className="w-4 h-4 mr-1.5 text-sky-600" />
              Unduh Font (.ttf)
            </a>
          </Button>

          <Button
            onClick={() => {
              setLatinText(SAMPLE_TEXT)
              setLemurianText(SAMPLE_TEXT)
            }}
            className="rounded-xl glass-pill text-sky-900 hover:bg-white/95 border-sky-200/80 text-xs sm:text-sm"
          >
            <FileText className="w-4 h-4 mr-1.5 text-sky-500" />
            Contoh
          </Button>

          <Button
            onClick={clearAll}
            className="rounded-xl glass-pill text-rose-600 hover:bg-rose-50/90 border-rose-200/80 text-xs sm:text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>
        </section>

        {/* Interactive Character Reference Grid */}
        <section className="glass-panel rounded-3xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                Panduan Karakter Aksara Lemuria
              </h2>
              <p className="text-xs text-slate-500">
                Klik kartu karakter di bawah untuk langsung menyisipkan ke editor
              </p>
            </div>
            <span className="text-xs font-medium text-sky-700 bg-sky-100/80 px-3 py-1 rounded-full">
              46 Karakter Tersedia
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700/80 mb-2.5">
                Huruf (A – Z)
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-9 lg:grid-cols-13 gap-2">
                {LEMURIAN_LETTERS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => insertCharacter(ch)}
                    className="group flex flex-col items-center justify-center rounded-2xl bg-white/80 hover:bg-gradient-to-br hover:from-sky-50 hover:to-blue-100/90 border border-sky-100 hover:border-sky-300 p-2 sm:p-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                    title={`Sisipkan huruf ${ch}`}
                  >
                    <span
                      className="text-xl sm:text-2xl text-sky-900 group-hover:text-blue-700 leading-none mb-1.5 transition-colors"
                      style={{
                        fontFamily: "var(--font-lemurian), 'LemurianTrueType', sans-serif",
                      }}
                    >
                      {ch}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-sky-700">
                      {ch}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700/80 mb-2.5">
                  Angka (0 – 9)
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {LEMURIAN_DIGITS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => insertCharacter(ch)}
                      className="group flex flex-col items-center justify-center rounded-2xl bg-white/80 hover:bg-gradient-to-br hover:from-sky-50 hover:to-blue-100/90 border border-sky-100 hover:border-sky-300 p-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                      title={`Sisipkan angka ${ch}`}
                    >
                      <span
                        className="text-lg sm:text-xl text-sky-900 group-hover:text-blue-700 leading-none mb-1 transition-colors"
                        style={{
                          fontFamily: "var(--font-lemurian), 'LemurianTrueType', sans-serif",
                        }}
                      >
                        {ch}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-sky-700">
                        {ch}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700/80 mb-2.5">
                  Tanda Baca &amp; Khusus
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {LEMURIAN_PUNCTUATION.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => insertCharacter(ch)}
                      className="group flex flex-col items-center justify-center rounded-2xl bg-white/80 hover:bg-gradient-to-br hover:from-sky-50 hover:to-blue-100/90 border border-sky-100 hover:border-sky-300 p-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                      title={`Sisipkan simbol ${ch}`}
                    >
                      <span
                        className="text-lg sm:text-xl text-sky-900 group-hover:text-blue-700 leading-none mb-1 transition-colors"
                        style={{
                          fontFamily: "var(--font-lemurian), 'LemurianTrueType', sans-serif",
                        }}
                      >
                        {ch}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-sky-700">
                        {ch}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Footer */}
        <footer className="glass-panel rounded-3xl p-4 sm:p-6 text-center max-w-3xl mx-auto">
          <h3 className="text-base font-semibold text-slate-800 mb-1.5">
            Tentang Aksara Lemuria
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Aksara Lemuria ditulis dari <strong className="text-sky-800">kanan ke kiri</strong> dan
            ditampilkan menggunakan font asli <strong className="text-sky-800">Lemurian True Type</strong>.
            Gunakan tombol panah bolak-balik di tengah untuk menukar posisi Latin dan Lemuria, serta
            tombol <strong className="text-sky-800">Salin Gambar</strong> atau{' '}
            <strong className="text-sky-800">Unduh PNG</strong> agar bentuk aksara tetap terjaga saat
            dibagikan.
          </p>
        </footer>
      </div>
    </div>
  )
}
