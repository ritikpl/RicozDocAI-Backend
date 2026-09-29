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

    customerName: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: String,
      default: "",
      trim: true,
    },

    items: {
      type: [
        {
          description: { type: String, default: "" },
          quantity: { type: String, default: "" },
          unit: { type: String, default: "" },
          unitPrice: { type: String, default: "" },
          amount: { type: String, default: "" },
          discount: { type: String, default: "" },

          cgstRate: { type: String, default: "" },
          cgstAmount: { type: String, default: "" },

          sgstRate: { type: String, default: "" },
          sgstAmount: { type: String, default: "" },

          igstRate: { type: String, default: "" },
          igstAmount: { type: String, default: "" },

          otherTaxRate: { type: String, default: "" },
          otherTaxAmount: { type: String, default: "" },
        },
      ],
      default: [],
    },

    subtotal: {
      type: String,
      default: "",
    },

    discount: {
      type: String,
      default: "",
    },

    charges: {
      shippingCharge: {
        type: String,
        default: "",
      },

      deliveryCharge: {
        type: String,
        default: "",
      },

      insuranceCharge: {
        type: String,
        default: "",
      },

      otherCharges: {
        type: String,
        default: "",
      },
    },

    taxes: {
      cgst: {
        rate: {
          type: String,
          default: "",
        },
        amount: {
          type: String,
          default: "",
        },
      },

      sgst: {
        rate: {
          type: String,
          default: "",
        },
        amount: {
          type: String,
          default: "",
        },
      },

      igst: {
        rate: {
          type: String,
          default: "",
        },
        amount: {
          type: String,
          default: "",
        },
      },

      otherTax: {
        rate: {
          type: String,
          default: "",
        },
        amount: {
          type: String,
          default: "",
        },
      },

      totalTax: {
        type: String,
        default: "",
      },
    },

    payment: {
      totalAmount: {
        type: String,
        default: "",
      },

      advancePaid: {
        type: String,
        default: "",
      },

      paidAmount: {
        type: String,
        default: "",
      },

      dueAmount: {
        type: String,
        default: "",
      },

      paymentMethod: {
        type: String,
        default: "",
      },
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