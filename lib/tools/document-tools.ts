import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { uploadFile } from '@/lib/storage/upload'

// Text to DOCX conversion
export async function textToDocx(
  input: { text: string; title?: string; fontSize?: number },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  const { text, title = 'Document', fontSize = 12 } = input
  
  // Create a simple DOCX structure (XML-based)
  // For production, use a library like docx or officegen
  const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:t>${title}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>${text.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`

  const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.docx`
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(docxContent),
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
