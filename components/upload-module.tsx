"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSuccessNotification, useErrorNotification } from "@/components/toast-notifications"

export function UploadModule() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [county, setCounty] = useState("")
  const [year, setYear] = useState("")
  const [processingStep, setProcessingStep] = useState("")

  const showSuccess = useSuccessNotification()
  const showError = useErrorNotification()

  const counties = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Machakos",
    "Kiambu",
    "Meru",
    "Nyeri",
    "Eldoret",
    "Thika",
    "Malindi",
    "Kitale",
  ]

  const years = ["2024", "2023", "2022", "2021", "2020"]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")

      if (droppedFiles.length > 0) {
        setFiles((prev) => [...prev, ...droppedFiles])
        showSuccess("Files added", `${droppedFiles.length} PDF file(s) ready for upload`)
      } else {
        showError("Invalid file type", "Please upload PDF files only.")
      }
    },
    [showSuccess, showError],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((file) => file.type === "application/pdf")
      if (selectedFiles.length > 0) {
        setFiles((prev) => [...prev, ...selectedFiles])
        showSuccess("Files selected", `${selectedFiles.length} PDF file(s) ready for upload`)
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const simulateUpload = async () => {
    if (!county || !year || files.length === 0) {
      showError("Missing information", "Please select county, year, and upload at least one file.")
      return
    }

    setUploading(true)
    setProgress(0)

    const steps = [
      "Uploading files...",
      "Extracting text with OCR...",
      "Analyzing content with AI...",
      "Generating transparency scores...",
      "Finalizing results...",
    ]

    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      setProcessingStep(steps[stepIndex])

      const stepProgress = (stepIndex / steps.length) * 100
      const nextStepProgress = ((stepIndex + 1) / steps.length) * 100

      // Animate progress within each step
      for (let i = stepProgress; i <= nextStepProgress; i += 2) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Pause between steps
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    setUploading(false)
    setProgress(0)
    setProcessingStep("")
    setFiles([])
    setCounty("")
    setYear("")

    showSuccess("Upload successful", `${files.length} document(s) uploaded and processed successfully.`)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>Provide details about the budget documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Select value={county} onValueChange={setCounty} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Budget Year</Label>
              <Select value={year} onValueChange={setYear} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Pipeline</CardTitle>
            <CardDescription>AI-powered document analysis steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-chart-1" />
                </div>
                <div>
                  <p className="font-medium text-sm">OCR Text Extraction</p>
                  <p className="text-xs text-muted-foreground">Extract text from PDF documents</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <p className="font-medium text-sm">AI Summarization</p>
                  <p className="text-xs text-muted-foreground">Generate key insights and summaries</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-chart-3" />
                </div>
                <div>
                  <p className="font-medium text-sm">Transparency Analysis</p>
                  <p className="text-xs text-muted-foreground">Identify transparency issues</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>Drag and drop PDF files or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop PDF files here</p>
              <p className="text-sm text-muted-foreground">or click to browse your files</p>
              <Input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <Button variant="outline" asChild disabled={uploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Selected Files ({files.length})</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm font-medium">{processingStep}</span>
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={simulateUpload}
              disabled={uploading || files.length === 0 || !county || !year}
              className="min-w-32"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
