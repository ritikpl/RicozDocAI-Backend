const express = require("express")
const fs = require("fs")
const upload = require("../middleware/uploadMiddleware")
const { extractDocumentData } = require("../services/geminiService")
const cloudinary = require("../config/cloudinary")

const router = express.Router()

router.post("/", upload.single("document"), async (req, res) => {
  let cloudinaryPublicId = null

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded",
      })
    }

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "ricozdocai-documents",
    })

    cloudinaryPublicId = uploadResult.public_id

    // Extract data using Gemini from temporary local file
    const extractedData = await extractDocumentData(
      req.file.path,
      req.file.mimetype
    )

    // Remove temporary local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(200).json({
      success: true,
      message: "Document uploaded and processed successfully",
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
      extractedData,
    })
  } catch (error) {
    console.error("Cloudinary error details:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
       error: error.error,
       })

    // Remove temporary local file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: "Document processing failed",
      error: error.message,
    })
  }
})

module.exports = router


