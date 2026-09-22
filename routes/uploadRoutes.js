const express = require("express")
const upload = require("../middleware/uploadMiddleware")
const { extractDocumentData } = require("../services/geminiService")

const router = express.Router()

router.post("/", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded",
      })
    }

    const extractedData = await extractDocumentData(
      req.file.path,
      req.file.mimetype
    )

    res.status(200).json({
      success: true,
      message: "Document uploaded and processed successfully",
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
      extractedData,
    })
  } catch (error) {
  console.error("Document processing error:", error)
  if (req.file?.path) {
    const fs = require("fs")

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
  }

   res.status(500).json({
    success: false,
    message: "Document processing failed",
    error: error.message,
  })
  }
})

module.exports = router

