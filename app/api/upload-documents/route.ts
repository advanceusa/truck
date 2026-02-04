import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    console.log("[v0] Upload documents API - email:", data.email)
    console.log("[v0] Upload documents API - idCardFront:", data.idCardFront ? "has URL" : "empty")
    console.log("[v0] Upload documents API - idCardBack:", data.idCardBack ? "has URL" : "empty")
    console.log("[v0] Upload documents API - billFront:", data.billFront ? "has URL" : "empty")
    console.log("[v0] Upload documents API - billBack:", data.billBack ? "has URL" : "empty")
    
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_URL
    
    if (!GOOGLE_SHEETS_URL) {
      console.log("[v0] No Google Sheets URL configured")
      return NextResponse.json({ success: true, message: "No webhook configured" })
    }

    // Now we're sending blob URLs (not base64), so we can use GET request
    const params = new URLSearchParams()
    params.append("action", "updateDocuments")
    params.append("email", data.email || "")
    params.append("idCardFront", data.idCardFront || "")
    params.append("idCardBack", data.idCardBack || "")
    params.append("billFront", data.billFront || "")
    params.append("billBack", data.billBack || "")

    const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`
    
    console.log("[v0] Sending to Google Sheets with action=updateDocuments")

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    })
    
    console.log("[v0] Google Sheets response status:", response.status)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ success: true })
  }
}
