"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Search, Calendar, MapPin, TrendingUp, AlertTriangle } from "lucide-react"

const mockDocuments = [
  {
    id: 1,
    title: "Nairobi County Budget 2024",
    county: "Nairobi",
    year: "2024",
    uploadDate: "2024-01-15",
    size: "2.4 MB",
    pages: 156,
    transparencyScore: 85,
    keyInsights: ["Infrastructure allocation increased by 15%", "Healthcare budget reduced by 8%"],
    issues: ["Missing procurement details", "Unclear revenue projections"],
  },
  {
    id: 2,
    title: "Mombasa County Budget 2024",
    county: "Mombasa",
    year: "2024",
    uploadDate: "2024-01-20",
    size: "1.8 MB",
    pages: 124,
    transparencyScore: 72,
    keyInsights: ["Port development prioritized", "Tourism sector investment doubled"],
    issues: ["Incomplete expenditure breakdown", "Missing audit reports"],
  },
  {
    id: 3,
    title: "Kisumu County Budget 2023",
    county: "Kisumu",
    year: "2023",
    uploadDate: "2023-12-10",
    size: "2.1 MB",
    pages: 142,
    transparencyScore: 68,
    keyInsights: ["Agriculture focus increased", "Education infrastructure improved"],
    issues: ["Vague project descriptions", "Missing timeline details"],
  },
]

export function DocumentList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCounty, setSelectedCounty] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<(typeof mockDocuments)[0] | null>(null)

  const counties = ["All Counties", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Machakos"]
  const years = ["All Years", "2024", "2023", "2022", "2021"]

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.county.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCounty = !selectedCounty || selectedCounty === "All Counties" || doc.county === selectedCounty
    const matchesYear = !selectedYear || selectedYear === "All Years" || doc.year === selectedYear

    return matchesSearch && matchesCounty && matchesYear
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-chart-2/10 text-chart-2 border-chart-2/20"
    if (score >= 60) return "bg-chart-3/10 text-chart-3 border-chart-3/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Documents</CardTitle>
          <CardDescription>Search and filter budget documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{doc.county}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{doc.year}</span>
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getScoreColor(doc.transparencyScore)}>{doc.transparencyScore}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{doc.pages} pages</span>
                <span>{doc.size}</span>
                <span>Uploaded {doc.uploadDate}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Key Insights</span>
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {doc.keyInsights.slice(0, 2).map((insight, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="text-chart-2 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {doc.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span>Issues Found</span>
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {doc.issues.slice(0, 2).map((issue, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-destructive mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>No documents found matching your criteria</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedDocument.title}</CardTitle>
              <CardDescription>Detailed analysis and insights</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Document Info</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>County: {selectedDocument.county}</p>
                  <p>Year: {selectedDocument.year}</p>
                  <p>Pages: {selectedDocument.pages}</p>
                  <p>Size: {selectedDocument.size}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Transparency Score</h4>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{selectedDocument.transparencyScore}%</div>
                  <Badge className={getScoreColor(selectedDocument.transparencyScore)}>
                    {selectedDocument.transparencyScore >= 80
                      ? "Excellent"
                      : selectedDocument.transparencyScore >= 60
                        ? "Good"
                        : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Upload Date</h4>
                <p className="text-sm text-muted-foreground">{selectedDocument.uploadDate}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <span>Key Insights</span>
                </h4>
                <ul className="space-y-2">
                  {selectedDocument.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-chart-2 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span>Issues Identified</span>
                </h4>
                <ul className="space-y-2">
                  {selectedDocument.issues.map((issue, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-destructive mt-1">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
