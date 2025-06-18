//app/database/page.tsx

"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CaseData {
  CaseID: number;
  PatientID: string;
  Date: string;
  Diagnosis: string;
  Confidence: string;
}

function getConfidenceBadge(confidence: string) {
  const numericConfidence = parseFloat(confidence.replace("%", "")) / 100;
  if (numericConfidence >= 0.9) return "default";
  if (numericConfidence >= 0.8) return "secondary";
  return "outline";
}

function formatConfidence(confidence: string) {
  // Remove % if it exists and ensure it's properly formatted
  const cleaned = confidence.replace("%", "");
  return `${cleaned}%`;
}

function getDiagnosisBadge(diagnosis: string) {
  switch (diagnosis.toLowerCase()) {
    case "positive":
      return <Badge variant="destructive">{diagnosis}</Badge>;
    case "negative":
      return <Badge variant="secondary">{diagnosis}</Badge>;
    case "not annotated":
      return <Badge variant="outline">{diagnosis}</Badge>;
    default:
      return <Badge>{diagnosis}</Badge>;
  }
}

export default function DatabasePage() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("http://localhost:8000/list/");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCases(data.forms || []);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load cases from database");
        toast.error("Failed to load cases from database");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Case Database</h1>
            <p className="text-muted-foreground mt-2">Loading cases...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Case Database</h1>
            <p className="text-muted-foreground mt-2">Error loading cases</p>
          </div>
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Case Database</h1>
          <p className="text-muted-foreground mt-2">
            View all processed cases and their diagnostic results (
            {cases.length} cases)
          </p>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No cases found in the database.
            </p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Upload your first case
            </Link>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((case_) => (
                  <TableRow key={case_.CaseID}>
                    <TableCell>
                      <Link
                        href={`/receipt/${case_.CaseID}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-bold"
                      >
                        CASE-{case_.CaseID.toString().padStart(3, "0")}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {case_.PatientID}
                    </TableCell>
                    <TableCell>{case_.Date}</TableCell>
                    <TableCell>{getDiagnosisBadge(case_.Diagnosis)}</TableCell>
                    <TableCell>
                      <Badge variant={getConfidenceBadge(case_.Confidence)}>
                        {formatConfidence(case_.Confidence)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
