const { GoogleGenerativeAI } = require("@google/generative-ai")
const fs = require("fs")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
})

const extractDocumentData = async (filePath, mimeType) => {
  const fileData = fs.readFileSync(filePath).toString("base64")

  const prompt = `
You are a production-grade business document understanding and data extraction assistant.

Analyze the ENTIRE uploaded PDF or image carefully from the first page to the last page.

The uploaded file may contain:
- One document
- Multiple separate documents
- One invoice/bill spanning multiple pages
- Multiple invoices/bills with different page counts

Your task is to identify EVERY actual business document in the complete uploaded file and extract all relevant financial and business information.

==================================================
DOCUMENT GROUPING AND PAGE BOUNDARIES
==================================================

IMPORTANT:

Do NOT use a fixed page count to determine document boundaries.

There is NO maximum page limit for a single document.

A single invoice, bill, receipt, or other business document may contain:
- 1 page
- 2 pages
- 3 pages
- 5 pages
- 10 pages
- or any larger number of pages.

Never split a document simply because it contains more pages.

Never assume:
- 1 page = 1 document
- 3 pages = 1 document
- 5 pages = 1 document
- or any other fixed page-to-document relationship.

Determine document boundaries using the content and structure of the pages.

Use multiple signals together, including:

- Vendor or supplier name
- Invoice number
- Bill number
- Receipt number
- Document title or heading
- Invoice date
- Due date
- Customer / buyer information
- Customer address
- Page numbering such as "Page 1 of 5", "Page 2 of 5"
- "Continued", "Continuation", "Next Page", or similar text
- Repeated invoice/reference numbers
- Repeated vendor information
- Continuation of product/item tables
- Continuation of quantities, prices, totals, taxes, or other financial information
- Consistent document formatting
- Consistent customer/vendor details
- Logical continuation of the document content

If several consecutive pages clearly belong to the same invoice or bill, combine ALL those pages into ONE document.

For example:

Pages 1-3 = Invoice A
Pages 4-8 = Invoice B
Pages 9-15 = Invoice C

This is only an example.

Do NOT assume these page ranges for other files.

If one invoice contains 20 pages and all 20 pages belong to the same invoice, return ONE document containing information collected from all 20 pages.

If a new invoice number, vendor, document heading, customer, or other strong document boundary indicates a new document, create a new document.

If vendor information is repeated on continuation pages, do NOT automatically treat that repetition as a new document.

Page numbering such as "Page 1 of 7", "Page 2 of 7", etc. should be treated as evidence that pages may belong to the same document.

Always analyze the ENTIRE file.

Never stop after finding the first document.

==================================================
OUTPUT FORMAT
==================================================

If the file contains ONE actual document, return ONE JSON object.

If the file contains MULTIPLE actual documents, return a JSON ARRAY containing one object for each actual document.

Never return only the first document when additional documents are present.

Never create duplicate documents for continuation pages.

Each document must follow this structure:

{
  "documentType": "",
  "invoiceNumber": "",
  "vendorName": "",
  "customerName": "",
  "date": "",
  "dueDate": "",

  "items": [
    {
      "description": "",
      "quantity": "",
      "unit": "",
      "unitPrice": "",
      "amount": "",
      "discount": "",
      "cgstRate": "",
      "cgstAmount": "",
      "sgstRate": "",
      "sgstAmount": "",
      "igstRate": "",
      "igstAmount": "",
      "otherTaxRate": "",
      "otherTaxAmount": ""
    }
  ],

  "subtotal": "",
  "discount": "",

  "charges": {
    "shippingCharge": "",
    "deliveryCharge": "",
    "insuranceCharge": "",
    "otherCharges": ""
  },

  "taxes": {
    "cgst": {
      "rate": "",
      "amount": ""
    },
    "sgst": {
      "rate": "",
      "amount": ""
    },
    "igst": {
      "rate": "",
      "amount": ""
    },
    "otherTax": {
      "rate": "",
      "amount": ""
    },
    "totalTax": ""
  },

  "payment": {
    "totalAmount": "",
    "advancePaid": "",
    "paidAmount": "",
    "dueAmount": "",
    "paymentMethod": ""
  },

  "total": ""
}

==================================================
DOCUMENT INFORMATION
==================================================

Extract when available:

- Document type
- Invoice number
- Bill number
- Vendor/supplier name
- Customer/buyer name
- Invoice date
- Due date

Do not guess missing values.

If a value is not present anywhere in the document, return an empty string.

==================================================
ITEM / PRODUCT EXTRACTION
==================================================

Extract individual products or services whenever they are visible.

For each item extract:

- Description
- Quantity
- Unit
- Unit price
- Amount
- Item-level discount
- CGST rate and amount
- SGST rate and amount
- IGST rate and amount
- Other tax rate and amount

If different products have different GST rates, preserve the GST information for each individual item.

Do not assume that every item has the same GST rate.

If an item-level field is not available, return an empty string.

If no item table exists, return an empty items array.

==================================================
AMOUNTS AND CHARGES
==================================================

Extract separately when present:

- Subtotal
- Discount
- Shipping charge
- Delivery charge
- Insurance charge
- Other charges

Do not combine these charges into subtotal unless the document itself explicitly does so.

Preserve the original values as shown on the document.

==================================================
GST AND TAX EXTRACTION
==================================================

Extract Indian GST information accurately.

Possible taxes include:

- CGST
- SGST
- IGST
- Other taxes

Extract both the tax rate and tax amount whenever available.

Examples:

CGST 9% = 4500

should become:

"cgst": {
  "rate": "9%",
  "amount": "4500"
}

SGST 9% = 4500

should become:

"sgst": {
  "rate": "9%",
  "amount": "4500"
}

IGST 18% = 9000

should become:

"igst": {
  "rate": "18%",
  "amount": "9000"
}

If a bill contains multiple tax lines, preserve the information accurately.

Do not invent CGST, SGST, IGST, or other taxes.

Do not assume that CGST and SGST are always present.

Do not assume that IGST is always present.

If the document contains another tax such as cess or another clearly identified tax, put it in otherTax.

Calculate nothing unless the document itself provides enough information and the calculation is unambiguous.

Prefer the actual values printed on the document.

==================================================
PAYMENT INFORMATION
==================================================

Extract payment information when available.

Possible payment information includes:

- Total amount
- Advance payment
- Amount already paid
- Balance due
- Payment method

Examples of payment methods may include:

- Cash
- UPI
- Paytm
- PhonePe
- Google Pay
- Bank Transfer
- NEFT
- RTGS
- Cheque
- Card
- Credit
- Other

If the document says:

Total = 50000
Advance = 30000
Balance Due = 20000

extract:

"payment": {
  "totalAmount": "50000",
  "advancePaid": "30000",
  "paidAmount": "30000",
  "dueAmount": "20000",
  "paymentMethod": ""
}

Do not assume that advancePaid and paidAmount are different if the document indicates they represent the same payment.

If payment information is not present, return empty strings.

==================================================
MULTI-PAGE DATA COMBINATION
==================================================

When a document spans multiple pages:

- Combine information from ALL pages belonging to that document.
- Do not create separate objects for continuation pages.
- Product tables may continue across pages.
- Taxes may appear on a later page.
- The final total may appear only on the final page.
- Payment information may appear on a later page.
- Vendor information may appear on the first page.
- Invoice number may appear on the first page.
- Additional items may appear on middle pages.
- Final totals may appear on the last page.

Combine all of this information into the SAME document object.

Example:

Page 1:
Vendor + Invoice Number

Page 2:
Products

Page 3:
More Products + CGST + SGST

Page 4:
Shipping + Insurance + Total + Payment

If all four pages belong to the same invoice, return ONE document object containing information from all four pages.

==================================================
DATA ACCURACY RULES
==================================================

- Analyze every page.
- Do not ignore later pages.
- Do not stop after the first document.
- Do not guess missing information.
- Do not invent values.
- Keep values as they appear in the document whenever possible.
- Preserve invoice numbers exactly.
- Preserve vendor names exactly when possible.
- Preserve dates as shown in the document.
- Preserve monetary values as shown.
- Do not merge separate documents.
- Do not split one document into multiple documents.
- Do not use page count as a document boundary.
- Use document content and structure to determine boundaries.

==================================================
FINAL OUTPUT RULE
==================================================

Return ONLY valid JSON.

Do NOT return:
- Markdown
- Code fences
- Explanations
- Comments
- Additional text

For multiple documents, return:

[
  {
    ...
  },
  {
    ...
  }
]

For a single document, return:

{
  ...
}
`

  const result = await model.generateContent([
    {
      inlineData: {
        data: fileData,
        mimeType: mimeType,
      },
    },
    prompt,
  ])

  const response = result.response.text()

  const cleanedResponse = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()

  const parsedData = JSON.parse(cleanedResponse)

  return parsedData
}

module.exports = {
  extractDocumentData,
}

