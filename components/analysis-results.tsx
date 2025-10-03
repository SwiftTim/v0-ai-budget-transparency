"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, TrendingUp, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface AnalysisResultsProps {
  summary: string
  keyInsights: string[]
  transparencyScore: number
  flaggedIssues: string[]
  county: string
  budgetYear: string
  fileName: string
}

export function AnalysisResults({
  summary,
  keyInsights,
  transparencyScore,
  flaggedIssues,
  county,
  budgetYear,
  fileName,
}: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-2"
    if (score >= 60) return "text-chart-4"
    if (score >= 40) return "text-chart-5"
    return "text-chart-3"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Improvement"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Analysis Complete</CardTitle>
              <CardDescription className="mt-1.5">
                {county} County Budget Report - {budgetYear}
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              {fileName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${getScoreColor(transparencyScore)}`} />
                  <h3 className="font-semibold">Transparency Score</h3>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getScoreColor(transparencyScore)}`}>{transparencyScore}</p>
                  <p className="text-sm text-muted-foreground">{getScoreLabel(transparencyScore)}</p>
                </div>
              </div>
              <Progress value={transparencyScore} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Executive Summary
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
            </div>

            {keyInsights.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                    Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-chart-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {flaggedIssues.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-chart-3" />
                    Flagged Issues
                  </h3>
                  <ul className="space-y-2">
                    {flaggedIssues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-chart-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
