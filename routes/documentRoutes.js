const express = require("express")
const Document = require("../models/Document")
const ExcelJS = require("exceljs")
const fs = require("fs")
const router = express.Router()

// Get document statistics
router.get("/stats", async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments()

    res.status(200).json({
      success: true,
      stats: {
        totalDocuments,
        processed: totalDocuments,
        pendingReview: 0,
      },
    })
  } catch (error) {
    console.error("Fetch document stats error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch document statistics",
      error: error.message,
    })
  }
})

// Get recent documents
router.get("/recent", async (req, res) => {
  try {
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .limit(5)

    res.status(200).json({
      success: true,
      documents,
    })
  } catch (error) {
    console.error("Fetch recent documents error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent documents",
      error: error.message,
    })
  }
})

// Get all documents
router.get("/", async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      documents,
    })
  } catch (error) {
    console.error("Fetch documents error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    })
  }
})

// Export documents to Excel
router.get("/export/excel", async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Documents")

    worksheet.columns = [
      { header: "Document Type", key: "documentType", width: 18 },
      { header: "Invoice Number", key: "invoiceNumber", width: 20 },
      { header: "Vendor Name", key: "vendorName", width: 35 },
      { header: "Date", key: "date", width: 20 },
      { header: "Subtotal", key: "subtotal", width: 15 },
      { header: "Tax", key: "tax", width: 15 },
      { header: "Total", key: "total", width: 15 },
      { header: "File Name", key: "originalName", width: 30 },
    ]

    documents.forEach((document) => {
      worksheet.addRow({
        documentType: document.documentType,
        invoiceNumber: document.invoiceNumber,
        vendorName: document.vendorName,
        date: document.date,
        subtotal: document.subtotal,
        tax: document.tax,
        total: document.total,
        originalName: document.originalName,
      })
    })

    worksheet.getRow(1).font = {
      bold: true,
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ricoz-documents.xlsx"'
    )

    await workbook.xlsx.write(res)

    res.end()
  } catch (error) {
    console.error("Excel export error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to export documents",
      error: error.message,
    })
  }
})

// Get single document
router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      })
    }

    res.status(200).json({
      success: true,
      document,
    })
  } catch (error) {
    console.error("Fetch document error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    })
  }
})

// Delete document
router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      })
    }

    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath)
    }

    await Document.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Document and uploaded file deleted successfully",
    })
  } catch (error) {
    console.error("Document delete error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    })
    
  }
})



// Save document
router.post("/", async (req, res) => {
  try {
    const document = new Document(req.body)

    const savedDocument = await document.save()

    res.status(201).json({
      success: true,
      message: "Document saved successfully",
      document: savedDocument,
    })
  } catch (error) {
    console.error("Document save error:", error)

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please fill all required document fields",
        error: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to save document",
      error: error.message,
    })
  }
})

module.exports = router
