const mongoose = require("mongoose")

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      trim: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    vendorName: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
    },

    subtotal: {
      type: String,
      default: "",
    },

    tax: {
      type: String,
      default: "",
    },

    total: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    filePath: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
       default: "",
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Document = mongoose.model("Document", documentSchema)

module.exports = Document