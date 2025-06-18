//app/page.tsx

"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ScreeningPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType = ["image/png", "image/jpeg"].includes(file.type);
    if (!isValidType) {
      toast.error("Only PNG and JPG formats are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`http://localhost:8000/upload/`, {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();

        // Store image data in sessionStorage for the labeling page
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          sessionStorage.setItem("currentImage", imageDataUrl);
          sessionStorage.setItem("currentImageName", file.name);
          sessionStorage.setItem("caseId", data.CaseID);
          sessionStorage.setItem("patientId", data.PatientID);
        };
        reader.readAsDataURL(file);

        toast.success(
          `Upload complete: CASE ${data.CaseID}, Patient (${data.PatientID})`
        );

        // Navigate to labeling page after a short delay
        setTimeout(() => {
          router.push("/labeling");
        }, 1500);
      } else {
        const text = await res.text();
        console.error("Unexpected response format:", text);
        toast.error("Upload failed. See console for details.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
          Clinical Decision Support System
        </h1>

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 md:p-16 hover:border-muted-foreground/50 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-16 w-16 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Upload Medical Data</h3>
              <p className="text-muted-foreground">
                Drag and drop your files here or click to browse
              </p>
            </div>
            <Button size="lg" className="mt-4" onClick={handleUploadClick}>
              Choose Files
            </Button>
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          Supported formats: PNG or JPG (Max size: 50MB)
        </p>
      </div>
    </div>
  );
}
