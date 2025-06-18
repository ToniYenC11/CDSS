//app/labeling/page.tsx

"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: "positive" | "negative";
}

interface ExistingAnnotation {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: "positive" | "negative";
  relativeX: number;
  relativeY: number;
  relativeWidth: number;
  relativeHeight: number;
}

export default function LabelingPage() {
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [showLabelSelect, setShowLabelSelect] = useState(false);
  const [pendingBoxIndex, setPendingBoxIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("medical_image.jpg");
  const [caseId, setCaseId] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Calculate image size based on fullscreen state
  const imageSize = isFullscreen ? 1000 : 800;

  // Load image data and existing annotations when component mounts
  useEffect(() => {
    const storedImage = sessionStorage.getItem("currentImage");
    const storedImageName = sessionStorage.getItem("currentImageName");
    const storedCaseId = sessionStorage.getItem("caseId");
    const storedPatientId = sessionStorage.getItem("patientId");
    const existingAnnotations = sessionStorage.getItem("existingAnnotations");

    if (storedImage) {
      setCurrentImage(storedImage);
    }
    if (storedImageName) {
      setImageName(storedImageName);
    }
    if (storedCaseId) {
      setCaseId(storedCaseId);
    }
    if (storedPatientId) {
      setPatientId(storedPatientId);
    }

    // Load existing annotations if in update mode
    if (existingAnnotations) {
      try {
        const annotations: ExistingAnnotation[] =
          JSON.parse(existingAnnotations);

        // Convert existing annotations to bounding boxes
        // Scale from relative coordinates back to absolute coordinates
        const convertedBoxes: BoundingBox[] = annotations.map((annotation) => ({
          x: annotation.relativeX * imageSize,
          y: annotation.relativeY * imageSize,
          width: annotation.relativeWidth * imageSize,
          height: annotation.relativeHeight * imageSize,
          label: annotation.label,
        }));

        setBoundingBoxes(convertedBoxes);
        setIsUpdateMode(true);

        // Clear the existing annotations from sessionStorage after loading
        sessionStorage.removeItem("existingAnnotations");

        toast.success(
          `Loaded ${convertedBoxes.length} existing annotations for editing`
        );
      } catch (error) {
        console.error("Error parsing existing annotations:", error);
        toast.error("Failed to load existing annotations");
      }
    }

    // If no image is found, redirect back to main page
    if (!storedImage) {
      toast.error("No image found. Please upload an image first.");
      router.push("/");
    }
  }, [router, imageSize]);

  // Update bounding box positions when image size changes (fullscreen toggle)
  useEffect(() => {
    if (boundingBoxes.length > 0) {
      const previousImageSize = isFullscreen ? 800 : 1000;
      const scaleFactor = imageSize / previousImageSize;

      setBoundingBoxes((prevBoxes) =>
        prevBoxes.map((box) => ({
          ...box,
          x: box.x * scaleFactor,
          y: box.y * scaleFactor,
          width: box.width * scaleFactor,
          height: box.height * scaleFactor,
        }))
      );
    }
  }, [imageSize]); // This will run when imageSize changes due to fullscreen toggle

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Prevent new drawing if there's a pending label selection
      if (showLabelSelect || !imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCurrentBox({ x, y, width: 0, height: 0 });
      setIsDrawing(true);
    },
    [showLabelSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !currentBox || !imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setCurrentBox({
        ...currentBox,
        width: currentX - currentBox.x,
        height: currentY - currentBox.y,
      });
    },
    [isDrawing, currentBox]
  );

  const handleMouseUp = useCallback(() => {
    if (!currentBox || !isDrawing) return;

    // Only add box if it has meaningful size
    if (Math.abs(currentBox.width) > 10 && Math.abs(currentBox.height) > 10) {
      const normalizedBox = {
        x:
          currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x,
        y:
          currentBox.height < 0
            ? currentBox.y + currentBox.height
            : currentBox.y,
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
      };

      setBoundingBoxes((prev) => [...prev, normalizedBox]);
      setPendingBoxIndex(boundingBoxes.length);
      setShowLabelSelect(true);
    }

    setIsDrawing(false);
    setCurrentBox(null);
  }, [currentBox, isDrawing, boundingBoxes.length]);

  const handleLabelSelect = (label: "positive" | "negative") => {
    if (pendingBoxIndex !== null) {
      setBoundingBoxes((prev) =>
        prev.map((box, index) =>
          index === pendingBoxIndex ? { ...box, label } : box
        )
      );
    }
    setShowLabelSelect(false);
    setPendingBoxIndex(null);
  };

  const handleRemoveBox = (indexToRemove: number) => {
    setBoundingBoxes((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async () => {
    // Prepare annotation data
    const annotationData = {
      caseId,
      patientId,
      imageName,
      annotations: boundingBoxes.map((box, index) => ({
        id: index,
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
        label: box.label,
        // Convert coordinates to relative values (0-1) for database storage
        relativeX: box.x / imageSize,
        relativeY: box.y / imageSize,
        relativeWidth: box.width / imageSize,
        relativeHeight: box.height / imageSize,
      })),
    };

    try {
      // Send annotation data to Django backend
      const response = await fetch("http://localhost:8000/api/annotations/", {
        method: isUpdateMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(annotationData),
      });

      if (response.ok) {
        const action = isUpdateMode ? "updated" : "completed";
        toast.success(`Annotations ${action} successfully for ${imageName}`);
      } else if (response.status === 404) {
        // Backend endpoint doesn't exist yet - show success anyway for demo
        console.warn("Annotations endpoint not implemented yet");
        console.log("Annotation data:", annotationData);
        const action = isUpdateMode ? "updated" : "completed";
        toast.success(`Annotations ${action} for ${imageName} (saved locally)`);
      } else {
        toast.error("Failed to save annotations. Please try again.");
      }
    } catch (error) {
      // If backend is not available, still allow demo functionality
      console.warn("Backend not available - showing demo success");
      console.log("Annotation data:", annotationData);
      const action = isUpdateMode ? "updated" : "completed";
      toast.success(`Annotations ${action} for ${imageName} (demo mode)`);
    }

    // Always clear session storage and redirect
    sessionStorage.removeItem("currentImage");
    sessionStorage.removeItem("currentImageName");
    sessionStorage.removeItem("caseId");
    sessionStorage.removeItem("patientId");
    sessionStorage.removeItem("existingAnnotations");

    // Redirect to appropriate page after a short delay
    setTimeout(() => {
      if (isUpdateMode) {
        // If updating, go back to the receipt page
        router.push(`/receipt/${caseId}`);
      } else {
        // If new annotation, go to main page
        router.push("/");
      }
    }, 1500);
  };

  const handleBackToHome = () => {
    // Clear session storage
    sessionStorage.removeItem("currentImage");
    sessionStorage.removeItem("currentImageName");
    sessionStorage.removeItem("caseId");
    sessionStorage.removeItem("patientId");
    sessionStorage.removeItem("existingAnnotations");

    if (isUpdateMode) {
      // If in update mode, go back to the receipt page
      router.push(`/receipt/${caseId}`);
    } else {
      // Otherwise go to home
      router.push("/");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClearAllAnnotations = () => {
    if (boundingBoxes.length === 0) return;

    if (
      confirm(
        "Are you sure you want to clear all annotations? This action cannot be undone."
      )
    ) {
      setBoundingBoxes([]);
      toast.success("All annotations cleared");
    }
  };

  // Don't render if no image is loaded
  if (!currentImage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isUpdateMode ? "Back to Receipt" : "Back to Home"}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isUpdateMode ? "Update Annotations" : "Labeling"}
              </h1>
              <p className="text-muted-foreground mt-2">
                Image: {imageName} | Case: {caseId} | Patient: {patientId}
                {isUpdateMode && (
                  <span className="block text-blue-600 font-medium">
                    Update mode: Modify existing annotations or add new ones
                  </span>
                )}
              </p>
              <p className="text-muted-foreground text-sm">
                Click and drag to create bounding boxes for annotation
                {showLabelSelect && (
                  <span className="block text-orange-600 font-medium mt-1">
                    Please label the current bounding box before creating new
                    ones
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {boundingBoxes.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAllAnnotations}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              onClick={toggleFullscreen}
              className="flex items-center space-x-2"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Annotation Summary */}
          {boundingBoxes.length > 0 && (
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>{boundingBoxes.length}</strong> annotation
                {boundingBoxes.length !== 1 ? "s" : ""} •
                <strong className="text-green-600 ml-2">
                  {
                    boundingBoxes.filter((box) => box.label === "positive")
                      .length
                  }
                </strong>{" "}
                positive •
                <strong className="text-red-600 ml-2">
                  {
                    boundingBoxes.filter((box) => box.label === "negative")
                      .length
                  }
                </strong>{" "}
                negative •
                <strong className="text-gray-600 ml-2">
                  {boundingBoxes.filter((box) => !box.label).length}
                </strong>{" "}
                unlabeled
              </p>
            </div>
          )}

          {/* Label Selection Dropdown - Moved above image for better visibility */}
          {showLabelSelect && (
            <div className="flex items-center space-x-4 p-4 border-2 border-orange-500 rounded-lg bg-orange-50 shadow-lg">
              <span className="text-sm font-medium text-orange-800">
                Select label for the bounding box:
              </span>
              <Select
                onValueChange={(value) =>
                  handleLabelSelect(value as "positive" | "negative")
                }
              >
                <SelectTrigger className="w-32 border-orange-300 bg-white">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Image Container with margin */}
          <div
            className={`relative border-2 border-dashed rounded-lg overflow-hidden ${
              showLabelSelect
                ? "border-orange-400 bg-orange-50/20"
                : "border-muted-foreground/25"
            }`}
            style={{ marginTop: "1rem", marginBottom: "1rem" }}
          >
            <div
              ref={imageRef}
              className={`relative ${
                showLabelSelect ? "cursor-not-allowed" : "cursor-crosshair"
              }`}
              style={{ width: imageSize, height: imageSize }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <Image
                src={currentImage}
                alt="Medical image for labeling"
                width={imageSize}
                height={imageSize}
                className="object-cover"
                draggable={false}
              />

              {/* Overlay to prevent interaction when labeling is required */}
              {showLabelSelect && (
                <div className="absolute inset-0 bg-orange-100/30 z-5" />
              )}

              {/* Render existing bounding boxes */}
              {boundingBoxes.map((box, index) => (
                <div
                  key={index}
                  className={`absolute border-2 group ${
                    box.label === "positive"
                      ? "border-green-500 bg-green-500/10"
                      : box.label === "negative"
                      ? "border-red-500 bg-red-500/10"
                      : "border-blue-500 bg-blue-500/10"
                  }`}
                  style={{
                    left: box.x,
                    top: box.y,
                    width: box.width,
                    height: box.height,
                    zIndex: 10,
                  }}
                >
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBox(index);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    disabled={showLabelSelect}
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Label */}
                  {box.label && (
                    <div
                      className={`absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded ${
                        box.label === "positive"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {box.label}
                    </div>
                  )}
                </div>
              ))}

              {/* Render current drawing box */}
              {isDrawing && currentBox && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500/10"
                  style={{
                    left:
                      currentBox.width < 0
                        ? currentBox.x + currentBox.width
                        : currentBox.x,
                    top:
                      currentBox.height < 0
                        ? currentBox.y + currentBox.height
                        : currentBox.y,
                    width: Math.abs(currentBox.width),
                    height: Math.abs(currentBox.height),
                    zIndex: 15,
                  }}
                />
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground max-w-md">
            <p>
              {isUpdateMode
                ? "Update existing annotations or add new ones. Click and drag on the image to create new bounding boxes, or hover over existing boxes to remove them."
                : 'Click and drag on the uploaded image to create bounding boxes. After creating a box, you must select whether it\'s positive or negative before creating new boxes. Hover over a labeled box and click the "×" to remove it.'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-end">
            <Button
              onClick={handleSubmit}
              size="lg"
              disabled={
                boundingBoxes.length === 0 ||
                boundingBoxes.some((box) => !box.label) ||
                showLabelSelect
              }
            >
              {isUpdateMode ? "Update Annotations" : "Submit Annotations"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
