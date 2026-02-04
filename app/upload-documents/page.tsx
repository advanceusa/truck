"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, CheckCircle, FileImage } from "lucide-react"

export default function UploadDocumentsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")

  const [uploadStatus, setUploadStatus] = useState<Record<string, "idle" | "uploading" | "done">>({
    idCardFront: "idle",
    idCardBack: "idle",
    billFront: "idle",
    billBack: "idle",
  })

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({
    idCardFront: "",
    idCardBack: "",
    billFront: "",
    billBack: "",
  })

  const [fileNames, setFileNames] = useState<Record<string, string>>({
    idCardFront: "",
    idCardBack: "",
    billFront: "",
    billBack: "",
  })

  const idCardFrontRef = useRef<HTMLInputElement>(null)
  const idCardBackRef = useRef<HTMLInputElement>(null)
  const billFrontRef = useRef<HTMLInputElement>(null)
  const billBackRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Get email from customerEmail (set by bank modal)
    const email = sessionStorage.getItem("customerEmail")
    if (email) {
      setCustomerEmail(email)
    }
  }, [])

  const uploadToBlob = async (file: File, fieldName: string) => {
    setUploadStatus((prev) => ({ ...prev, [fieldName]: "uploading" }))

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fieldName", fieldName)

      const response = await fetch("/api/upload-blob", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.url) {
        setImageUrls((prev) => ({ ...prev, [fieldName]: result.url }))
        setFileNames((prev) => ({ ...prev, [fieldName]: file.name }))
        setUploadStatus((prev) => ({ ...prev, [fieldName]: "done" }))
      } else {
        setUploadStatus((prev) => ({ ...prev, [fieldName]: "idle" }))
        alert("Failed to upload file. Please try again.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus((prev) => ({ ...prev, [fieldName]: "idle" }))
      alert("Failed to upload file. Please try again.")
    }
  }

  const handleFileChange = async (field: string, file: File | null) => {
    if (file) {
      await uploadToBlob(file, field)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    console.log("[v0] Submitting documents for email:", customerEmail)
    console.log("[v0] Image URLs:", imageUrls)

    try {
      const response = await fetch("/api/upload-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          idCardFront: imageUrls.idCardFront,
          idCardBack: imageUrls.idCardBack,
          billFront: imageUrls.billFront,
          billBack: imageUrls.billBack,
        }),
      })

      const result = await response.json()

      if (result.success) {
        sessionStorage.removeItem("customerEmail")
        router.push("/success")
      } else {
        alert("There was an error uploading your documents. Please try again.")
      }
    } catch (error) {
      console.error("Error uploading documents:", error)
      alert("There was an error uploading your documents. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadFields = [
    { key: "idCardFront", label: "ID Card Front", ref: idCardFrontRef },
    { key: "idCardBack", label: "ID Card Back", ref: idCardBackRef },
    { key: "billFront", label: "Utility Bill Front", ref: billFrontRef },
    { key: "billBack", label: "Utility Bill Back", ref: billBackRef },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/lending-tree-logo.png"
                alt="LendingTree"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Application</span>
              </div>
              <div className="h-px w-12 bg-emerald-600" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Bank Details</span>
              </div>
              <div className="h-px w-12 bg-emerald-600" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="text-sm font-medium text-emerald-600">Documents</span>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center border-b bg-gray-50">
              <CardTitle className="text-2xl font-bold text-gray-900">Upload Your Documents</CardTitle>
              <p className="text-gray-600 mt-2">
                Please upload clear photos of your ID and a recent utility bill for verification.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uploadFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
                      <input
                        type="file"
                        ref={field.ref}
                        accept="image/*"
                        onChange={(e) => handleFileChange(field.key, e.target.files?.[0] || null)}
                        className="hidden"
                      />
<button
                        type="button"
                        onClick={() => field.ref.current?.click()}
                        disabled={uploadStatus[field.key] === "uploading"}
                        className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                          uploadStatus[field.key] === "done"
                            ? "border-emerald-500 bg-emerald-50"
                            : uploadStatus[field.key] === "uploading"
                              ? "border-gray-300 bg-gray-50 cursor-wait"
                              : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        {uploadStatus[field.key] === "uploading" ? (
                          <>
                            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                            <span className="text-sm text-gray-500">Uploading...</span>
                          </>
                        ) : uploadStatus[field.key] === "done" ? (
                          <>
                            <FileImage className="h-8 w-8 text-emerald-600" />
                            <span className="text-sm text-emerald-600 font-medium text-center px-4 truncate max-w-full">
                              {fileNames[field.key]}
                            </span>
                            <span className="text-xs text-gray-500">Click to change</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-500">Click to upload</span>
                            <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Make sure all documents are clearly visible and not blurry. 
                    Your personal information should be readable.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading Documents...
                    </>
                  ) : (
                    "Complete Application"
                  )}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Your documents are encrypted and securely stored. We never share your information.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
