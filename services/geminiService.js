const { GoogleGenerativeAI } = require("@google/generative-ai")
const fs = require("fs")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
})

const extractDocumentData = async (filePath, mimeType) => {
  const fileData = fs.readFileSync(filePath).toString("base64")

  const prompt = `
You are a document data extraction assistant.

Analyze the uploaded business document and extract the important information.

Return ONLY valid JSON.

Use this structure:

{
  "documentType": "",
  "invoiceNumber": "",
  "vendorName": "",
  "date": "",
  "subtotal": "",
  "tax": "",
  "total": ""
}

Rules:
- If a field is not available, return an empty string.
- Do not guess missing information.
- Keep the values exactly as they appear in the document when possible.
- documentType can be Invoice, Receipt, Bill, Contract, or Other.
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

