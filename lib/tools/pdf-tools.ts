import { PDFDocument } from 'pdf-lib'
import { uploadFile, downloadFile } from '@/lib/storage/upload'

export async function mergePdf(
  input: { pdfUrls: string[]; outputFilename?: string },
  userId: string,
  executionId: string
) {
  const { pdfUrls, outputFilename } = input
  
  // Create new PDF document
  const mergedPdf = await PDFDocument.create()

  // Download and merge PDFs
  for (const url of pdfUrls) {
    const pdfBytes = await downloadFile(url)
    const pdf = await PDFDocument.load(pdfBytes)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  // Save merged PDF
  const mergedPdfBytes = await mergedPdf.save()
  
  // Upload to Supabase Storage
  const filename = outputFilename || `merged-${Date.now()}.pdf`
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(mergedPdfBytes),
    filename,
    'application/pdf',
    'outputs'
  )

  return {
    outputUrl: result.publicUrl,
    filename,
    pageCount: mergedPdf.getPageCount(),
    size: result.size,
  }
}

export async function splitPdf(
  input: { pdfUrl: string; ranges?: Array<{ start: number; end: number }> },
  userId: string,
  executionId: string
): Promise<{ files: Array<{ url: string; filename: string; pageCount: number }> }> {
  const { pdfUrl, ranges } = input
  
  // Download PDF
  const pdfBytes = await downloadFile(pdfUrl)
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const totalPages = pdfDoc.getPageCount()
  
  const results: Array<{ url: string; filename: string; pageCount: number }> = []
  
  if (ranges && ranges.length > 0) {
    // Split by specified ranges
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      const newPdf = await PDFDocument.create()
      
      const startPage = Math.max(0, range.start - 1)
      const endPage = Math.min(totalPages, range.end)
      
      const copiedPages = await newPdf.copyPages(
        pdfDoc, 
        Array.from({ length: endPage - startPage }, (_, idx) => startPage + idx)
      )
      copiedPages.forEach((page) => newPdf.addPage(page))
      
      const newPdfBytes = await newPdf.save()
      const filename = `split-${i + 1}-pages-${range.start}-${range.end}-${Date.now()}.pdf`
      
      const result = await uploadFile(
        userId,
        executionId,
        Buffer.from(newPdfBytes),
        filename,
        'application/pdf',
        'outputs'
      )
      
      results.push({
        url: result.publicUrl,
        filename,
        pageCount: endPage - startPage
      })
    }
  } else {
    // Split each page into separate file
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create()
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
      newPdf.addPage(copiedPage)
      
      const newPdfBytes = await newPdf.save()
      const filename = `split-page-${i + 1}-${Date.now()}.pdf`
      
      const result = await uploadFile(
        userId,
        executionId,
        Buffer.from(newPdfBytes),
        filename,
        'application/pdf',
        'outputs'
      )
      
      results.push({
        url: result.publicUrl,
        filename,
        pageCount: 1
      })
    }
  }
  
  return { files: results }
}

export async function pdfToWord(
  input: { pdfUrl: string; preserveFormatting: boolean },
  userId: string,
  executionId: string
): Promise<{ outputUrl: string; filename: string }> {
  // PDF to Word conversion is complex and typically requires third-party services
  // Options: CloudConvert API, Adobe PDF Services, or Aspose
  
  // Mock implementation - in production, integrate with a service
  const { pdfUrl, preserveFormatting } = input
  const pdfBytes = await downloadFile(pdfUrl)
  
  // For now, create a simple text file as placeholder
  const textContent = `[PDF to Word Conversion Placeholder]\n\n` +
    `Source PDF size: ${pdfBytes.length} bytes\n` +
    `Preserve formatting: ${preserveFormatting}\n\n` +
    `To implement this feature, integrate with:\n` +
    `- CloudConvert API (https://cloudconvert.com)\n` +
    `- Adobe PDF Services API\n` +
    `- Aspose.PDF\n` +
    `- LibreOffice via command line`
  
  const filename = `converted-${Date.now()}.txt`
  const result = await uploadFile(
    userId,
    executionId,
    Buffer.from(textContent),
    filename,
    'text/plain',
    'outputs'
  )
  
  return {
    outputUrl: result.publicUrl,
    filename
  }
}
