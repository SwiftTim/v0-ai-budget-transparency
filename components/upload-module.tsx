"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CircleCheck as CheckCircle, CircleAlert as AlertCircle, X } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSuccessNotification, useErrorNotification } from "@/components/toast-notifications"
import { AnalysisResults } from "@/components/analysis-results"
import { createBudgetUpload, updateUploadStatus, createBudgetAnalysis } from "@/lib/supabase"
import { extractTextWithOCR, analyzeWithNLP } from "@/lib/ocr-nlp-processor"

export function UploadModule() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [county, setCounty] = useState("")
  const [year, setYear] = useState("")
  const [processingStep, setProcessingStep] = useState("")
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string
    keyInsights: string[]
    transparencyScore: number
    flaggedIssues: string[]
    fileName: string
  } | null>(null)

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

      const oversizedFiles = droppedFiles.filter((file) => file.size > 100 * 1024 * 1024)
      const validFiles = droppedFiles.filter((file) => file.size <= 100 * 1024 * 1024)

      if (oversizedFiles.length > 0) {
        showError("File too large", `Some files exceed 100MB limit and were not added.`)
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
        showSuccess("Files added", `${validFiles.length} budget report(s) ready for upload`)
      } else if (droppedFiles.length > 0 && oversizedFiles.length === 0) {
        showError("Invalid file type", "Please upload PDF files only.")
      }
    },
    [showSuccess, showError],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((file) => file.type === "application/pdf")
      const oversizedFiles = selectedFiles.filter((file) => file.size > 100 * 1024 * 1024)
      const validFiles = selectedFiles.filter((file) => file.size <= 100 * 1024 * 1024)

      if (oversizedFiles.length > 0) {
        showError("File too large", `${oversizedFiles.length} file(s) exceed 100MB limit and were not added.`)
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
        showSuccess("Files selected", `${validFiles.length} budget report(s) ready for upload`)
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processUpload = async () => {
    if (!county || !year || files.length === 0) {
      showError("Missing information", "Please upload file first, then select year and county.")
      return
    }

    setUploading(true)
    setProgress(0)
    setAnalysisResult(null)

    try {
      const file = files[0]

      setProcessingStep("Uploading to database...")
      setProgress(10)

      const upload = await createBudgetUpload({
        file_name: file.name,
        file_size: file.size,
        file_url: `uploads/${file.name}`,
        county: county,
        budget_year: year,
        user_id: null,
      })

      if (!upload) throw new Error("Failed to create upload record")

      await updateUploadStatus(upload.id, "processing")
      setProgress(25)

      setProcessingStep("Extracting text with OCR...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const extractedText = await extractTextWithOCR(file)
      setProgress(50)

      setProcessingStep("Analyzing content with NLP...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const analysis = await analyzeWithNLP(extractedText)
      setProgress(75)

      setProcessingStep("Saving analysis results...")
      await createBudgetAnalysis({
        upload_id: upload.id,
        extracted_text: extractedText,
        summary: analysis.summary,
        key_insights: analysis.keyInsights,
        transparency_score: analysis.transparencyScore,
        flagged_issues: analysis.flaggedIssues,
      })

      await updateUploadStatus(upload.id, "completed")
      setProgress(100)

      await new Promise((resolve) => setTimeout(resolve, 500))

      setAnalysisResult({
        summary: analysis.summary,
        keyInsights: analysis.keyInsights,
        transparencyScore: analysis.transparencyScore,
        flaggedIssues: analysis.flaggedIssues,
        fileName: file.name,
      })

      showSuccess("Analysis complete", "Budget report has been analyzed successfully.")
    } catch (error) {
      showError("Upload failed", error instanceof Error ? error.message : "An error occurred during processing.")
    } finally {
      setUploading(false)
      setProgress(0)
      setProcessingStep("")
      setFiles([])
    }
  }

  return (
    <div className="space-y-6">
      {analysisResult ? (
        <>
          <AnalysisResults
            summary={analysisResult.summary}
            keyInsights={analysisResult.keyInsights}
            transparencyScore={analysisResult.transparencyScore}
            flaggedIssues={analysisResult.flaggedIssues}
            county={county}
            budgetYear={year}
            fileName={analysisResult.fileName}
          />
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setAnalysisResult(null)
                setCounty("")
                setYear("")
              }}
              variant="outline"
            >
              Analyze Another Report
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">

            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
                <CardDescription>Select year and county after uploading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Budget Year</Label>
                  <Select value={year} onValueChange={setYear} disabled={uploading || files.length === 0}>
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
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Select value={county} onValueChange={setCounty} disabled={uploading || files.length === 0}>
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
              <CardTitle>Step 1: Upload Budget Report</CardTitle>
              <CardDescription>Upload PDF file up to 100MB, then select year and county</CardDescription>
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
              <p className="text-lg font-medium">Drop budget report files here</p>
              <p className="text-sm text-muted-foreground">Maximum file size: 100MB per file</p>
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
                onClick={processUpload}
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
                    Analyze Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
      )}
    </div>
  )
}
