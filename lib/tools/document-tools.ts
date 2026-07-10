import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { uploadFile } from '@/lib/storage/upload'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

// Text to DOCX conversion
export async function textToDocx(
  input: { text: string; title?: string; fontSize?: number },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  const { text, title = 'Document', fontSize = 12 } = input
  
  // Split text into paragraphs
  const paragraphs = text.split('\n').filter(line => line.trim())
  
  // Create document with title and content
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title as heading
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
        }),
        // Content paragraphs
        ...paragraphs.map(para => 
          new Paragraph({
            children: [
              new TextRun({
                text: para,
                size: fontSize * 2, // docx uses half-points
              }),
            ],
          })
        ),
      ],
    }],
  })
  
  // Generate DOCX file as buffer
  const buffer = await Packer.toBuffer(doc)
  
  const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.docx`
  const result = await uploadFile(
    userId,
    executionId,
    buffer,
    filename,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'outputs'
  )

  return {
    outputUrl: result.publicUrl,
    filename
  }
}

// Markdown to PDF conversion
export async function markdownToPdf(
  input: { markdown: string; title?: string; pageSize?: string },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  const { markdown, title = 'Document', pageSize = 'A4' } = input
  
  // Create PDF from markdown
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { height } = page.getSize()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let yPosition = height - 50
  const lineHeight = 20
  const fontSize = 12
  
  // Parse markdown (basic implementation)
  const lines = markdown.split('\n')
  
  for (const line of lines) {
    if (yPosition < 50) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595, 842])
      yPosition = newPage.getSize().height - 50
    }
    
    let currentFont = font
    let currentSize = fontSize
    let text = line
    
    // Handle headers
    if (line.startsWith('# ')) {
      currentFont = boldFont
      currentSize = 24
      text = line.substring(2)
    } else if (line.startsWith('## ')) {
      currentFont = boldFont
      currentSize = 18
      text = line.substring(3)
    } else if (line.startsWith('### ')) {
      currentFont = boldFont
      currentSize = 14
      text = line.substring(4)
    }
    
    // Handle bold text (simple **text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '$1')
    
    if (text.trim()) {
      page.drawText(text, {
        x: 50,
        y: yPosition,
        size: currentSize,
        font: currentFont,
        color: rgb(0, 0, 0),
      })
    }
    
    yPosition -= lineHeight
  }
  
  const pdfBytes = await pdfDoc.save()
  const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
  
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(pdfBytes),
    filename,
    'application/pdf',
    'outputs'
  )
  
  return {
    outputUrl: result.publicUrl,
    filename
  }
}

// Generate Receipt
export async function generateReceipt(
  input: {
    receiptNumber: string
    date: string
    items: Array<{ description: string; quantity: number; price: number }>
    total: number
    from: { name: string; address?: string; email?: string }
    to: { name: string; address?: string; email?: string }
  },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  const { receiptNumber, date, items, total, from, to } = input
  
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let yPosition = height - 50
  
  // Header
  page.drawText('RECEIPT', {
    x: width / 2 - 40,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  yPosition -= 40
  
  // Receipt details
  page.drawText(`Receipt #: ${receiptNumber}`, { x: 50, y: yPosition, size: 12, font })
  page.drawText(`Date: ${date}`, { x: 400, y: yPosition, size: 12, font })
  yPosition -= 30
  
  // From
  page.drawText('From:', { x: 50, y: yPosition, size: 12, font: boldFont })
  yPosition -= 15
  page.drawText(from.name, { x: 50, y: yPosition, size: 10, font })
  yPosition -= 12
  if (from.address) {
    page.drawText(from.address, { x: 50, y: yPosition, size: 10, font })
    yPosition -= 12
  }
  if (from.email) {
    page.drawText(from.email, { x: 50, y: yPosition, size: 10, font })
    yPosition -= 20
  } else {
    yPosition -= 8
  }
  
  // To
  page.drawText('To:', { x: 50, y: yPosition, size: 12, font: boldFont })
  yPosition -= 15
  page.drawText(to.name, { x: 50, y: yPosition, size: 10, font })
  yPosition -= 12
  if (to.address) {
    page.drawText(to.address, { x: 50, y: yPosition, size: 10, font })
    yPosition -= 12
  }
  if (to.email) {
    page.drawText(to.email, { x: 50, y: yPosition, size: 10, font })
    yPosition -= 30
  } else {
    yPosition -= 18
  }
  
  // Items header
  page.drawText('Description', { x: 50, y: yPosition, size: 10, font: boldFont })
  page.drawText('Qty', { x: 350, y: yPosition, size: 10, font: boldFont })
  page.drawText('Price', { x: 400, y: yPosition, size: 10, font: boldFont })
  page.drawText('Total', { x: 480, y: yPosition, size: 10, font: boldFont })
  yPosition -= 15
  
  // Draw line
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  yPosition -= 10
  
  // Items
  for (const item of items) {
    const itemTotal = item.quantity * item.price
    page.drawText(item.description.substring(0, 40), { x: 50, y: yPosition, size: 10, font })
    page.drawText(item.quantity.toString(), { x: 350, y: yPosition, size: 10, font })
    page.drawText(`$${item.price.toFixed(2)}`, { x: 400, y: yPosition, size: 10, font })
    page.drawText(`$${itemTotal.toFixed(2)}`, { x: 480, y: yPosition, size: 10, font })
    yPosition -= 15
  }
  
  // Total
  yPosition -= 10
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  yPosition -= 20
  
  page.drawText('TOTAL:', { x: 400, y: yPosition, size: 14, font: boldFont })
  page.drawText(`$${total.toFixed(2)}`, { x: 480, y: yPosition, size: 14, font: boldFont })
  
  // Footer
  yPosition = 100
  page.drawText('Thank you for your business!', {
    x: width / 2 - 80,
    y: yPosition,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  const pdfBytes = await pdfDoc.save()
  const filename = `receipt-${receiptNumber}-${Date.now()}.pdf`
  
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(pdfBytes),
    filename,
    'application/pdf',
    'outputs'
  )
  
  return {
    outputUrl: result.publicUrl,
    filename
  }
}

// HTML to PDF conversion
export async function htmlToPdf(
  input: { html: string; title?: string; pageSize?: string },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  const { html, title = 'Document', pageSize = 'A4' } = input
  
  // Basic HTML to PDF conversion
  // For production, use libraries like puppeteer or html-pdf
  // This is a simplified version that strips HTML and converts to PDF
  
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const { height } = page.getSize()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  // Strip HTML tags (basic)
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n\s*\n/g, '\n')
    .trim()
  
  let yPosition = height - 50
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (line.trim() && yPosition > 50) {
      page.drawText(line.substring(0, 80), {
        x: 50,
        y: yPosition,
        size: 12,
        font,
      })
      yPosition -= 20
    }
  }
  
  const pdfBytes = await pdfDoc.save()
  const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
  
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(pdfBytes),
    filename,
    'application/pdf',
    'outputs'
  )
  
  return {
    outputUrl: result.publicUrl,
    filename
  }
}

// JSON to Excel (simplified CSV format)
export async function jsonToExcel(
  input: { data: Array<Record<string, any>>; sheetName?: string },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  const { data, sheetName = 'Sheet1' } = input
  
  if (!data || data.length === 0) {
    throw new Error('No data provided')
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ]
  
  const csv = csvRows.join('\n')
  const filename = `${sheetName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`
  
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(csv),
    filename,
    'text/csv',
    'outputs'
  )
  
  return {
    outputUrl: result.publicUrl,
    filename
  }
}

// ─── DOCX to Markdown ────────────────────────────────────────────────────────
export async function docxToMarkdown(
  input: { docxUrl: string; includeHeadings?: boolean },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string; markdown: string }> {
  const PizZip = (await import('pizzip')).default
  const { downloadFile } = await import('@/lib/storage/upload')

  const docxBuffer = await downloadFile(input.docxUrl)
  const zip = new PizZip(docxBuffer)

  // Extract word/document.xml
  const documentXml = zip.file('word/document.xml')
  if (!documentXml) throw new Error('Invalid DOCX: word/document.xml not found')

  const xmlContent = documentXml.asText()

  // Parse XML into markdown lines
  const lines: string[] = []
  const paragraphRegex = /<w:p[ >]([\s\S]*?)<\/w:p>/g
  let paraMatch: RegExpExecArray | null

  while ((paraMatch = paragraphRegex.exec(xmlContent)) !== null) {
    const paraXml = paraMatch[1]

    // Detect heading style
    const styleMatch = paraXml.match(/<w:pStyle w:val="([^"]+)"/)
    const style = styleMatch ? styleMatch[1].toLowerCase() : ''

    // Extract all text runs
    const textRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g
    let textMatch: RegExpExecArray | null
    let lineText = ''
    while ((textMatch = textRegex.exec(paraXml)) !== null) {
      lineText += textMatch[1]
    }

    if (!lineText.trim()) {
      lines.push('')
      continue
    }

    // Map heading styles
    if (style.includes('heading1') || style === 'title') {
      lines.push(`# ${lineText}`)
    } else if (style.includes('heading2')) {
      lines.push(`## ${lineText}`)
    } else if (style.includes('heading3')) {
      lines.push(`### ${lineText}`)
    } else {
      lines.push(lineText)
    }
  }

  const markdown = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  const filename = `converted-${Date.now()}.md`

  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(markdown, 'utf-8'),
    filename,
    'text/markdown',
    'outputs'
  )

  return { outputUrl: result.publicUrl, filename, markdown }
}

// ─── CSV to JSON ─────────────────────────────────────────────────────────────
export async function csvToJson(
  input: { csv: string; delimiter?: string },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string; data: Record<string, string>[]; rowCount: number }> {
  const { csv, delimiter = ',' } = input

  const lines = csv.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))

  const data: Record<string, string>[] = lines.slice(1).map(line => {
    // Handle quoted values
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] ?? ''
      return obj
    }, {} as Record<string, string>)
  })

  const json = JSON.stringify(data, null, 2)
  const filename = `csv-to-json-${Date.now()}.json`

  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(json),
    filename,
    'application/json',
    'outputs'
  )

  return { outputUrl: result.publicUrl, filename, data, rowCount: data.length }
}

// ─── Excel / CSV URL to JSON ──────────────────────────────────────────────────
export async function excelToJson(
  input: { fileUrl: string; delimiter?: string },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string; data: Record<string, string>[]; rowCount: number }> {
  const { downloadFile } = await import('@/lib/storage/upload')
  const fileBuffer = await downloadFile(input.fileUrl)
  const csvText = fileBuffer.toString('utf-8')
  return csvToJson({ csv: csvText, delimiter: input.delimiter }, userId, executionId)
}

// ─── DOCX Template Filler ────────────────────────────────────────────────────
export async function docxTemplateFiller(
  input: { templateUrl: string; variables: Record<string, string> },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  const PizZip = (await import('pizzip')).default
  const Docxtemplater = (await import('docxtemplater')).default
  const { downloadFile } = await import('@/lib/storage/upload')

  const templateBuffer = await downloadFile(input.templateUrl)
  const zip = new PizZip(templateBuffer)

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render(input.variables)

  const outputBuffer = doc.getZip().generate({ type: 'nodebuffer' }) as Buffer
  const filename = `filled-template-${Date.now()}.docx`

  const result = await uploadFile(
    userId,
    executionId,
    outputBuffer,
    filename,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'outputs'
  )

  return { outputUrl: result.publicUrl, filename }
}

