const mongoose = require("mongoose")

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      default: "",
    },

    invoiceNumber: {
      type: String,
      default: "",
    },

    vendorName: {
      type: String,
      default: "",
    },

    date: {
      type: String,
      default: "",
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
      default: "",
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