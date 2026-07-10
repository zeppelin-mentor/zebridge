import PptxGenJS from 'pptxgenjs'
import { uploadFile } from '@/lib/storage/upload'

interface SlideInput {
  title: string
  content?: string
  bullets?: string[]
  layout?: 'title-only' | 'title-content' | 'title-bullets'
}

// ─── Generate PPTX Presentation ──────────────────────────────────────────────
export async function generatePptx(
  input: {
    presentationTitle: string
    author?: string
    slides: SlideInput[]
    theme?: 'dark' | 'light' | 'corporate'
  },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string; slideCount: number }> {
  const { presentationTitle, author = 'ZeBridge', slides, theme = 'corporate' } = input

  const pptx = new PptxGenJS()

  // Theme colors
  const themes = {
    dark: { bg: '0B0F19', title: '4ADE80', body: 'CBD5E1', accent: '38BDF8' },
    light: { bg: 'FFFFFF', title: '0F172A', body: '374151', accent: '4ADE80' },
    corporate: { bg: 'F8FAFC', title: '1E293B', body: '475569', accent: '4F46E5' },
  }
  const colors = themes[theme]

  pptx.author = author
  pptx.title = presentationTitle
  pptx.layout = 'LAYOUT_WIDE'

  for (const slideData of slides) {
    const slide = pptx.addSlide()

    // Background
    slide.background = { color: colors.bg }

    // Title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.4,
      w: '90%',
      h: 1.2,
      fontSize: 32,
      bold: true,
      color: colors.title,
      fontFace: 'Calibri',
    })

    // Content paragraph
    if (slideData.content) {
      slide.addText(slideData.content, {
        x: 0.5,
        y: 1.8,
        w: '90%',
        h: 3.5,
        fontSize: 18,
        color: colors.body,
        fontFace: 'Calibri',
        align: 'left',
        valign: 'top',
        wrap: true,
      })
    }

    // Bullet points
    if (slideData.bullets && slideData.bullets.length > 0) {
      const bulletItems = slideData.bullets.map((b) => ({
        text: b,
        options: { bullet: true, fontSize: 18, color: colors.body, fontFace: 'Calibri' },
      }))
      slide.addText(bulletItems, {
        x: 0.5,
        y: slideData.content ? 4.2 : 1.8,
        w: '90%',
        h: 2.5,
      })
    }

    // Accent bar at bottom
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 6.8,
      w: '100%',
      h: 0.2,
      fill: { color: colors.accent },
      line: { color: colors.accent },
    })
  }

  const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer
  const filename = `${presentationTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pptx`

  const result = await uploadFile(
    userId,
    executionId,
    buffer,
    filename,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'outputs'
  )

  return {
    outputUrl: result.publicUrl,
    filename,
    slideCount: slides.length,
  }
}
