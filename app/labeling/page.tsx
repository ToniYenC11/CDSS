"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: "positive" | "negative";
}

export default function LabelingPage() {
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [showLabelSelect, setShowLabelSelect] = useState(false);
  const [pendingBoxIndex, setPendingBoxIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sample image name - in real implementation, this would come from props or API
  const imageName = "cervical_sample_001.jpg";

  // Calculate image size based on fullscreen state
  const imageSize = isFullscreen ? 1000 : 800;

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

  const handleSubmit = () => {
    toast.success(`Proper annotation/diagnosis done for ${imageName}`);

    // Redirect to main page after a short delay
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Labeling</h1>
            <p className="text-muted-foreground mt-2">
              Click and drag to create bounding boxes for annotation
              {showLabelSelect && (
                <span className="block text-orange-600 font-medium mt-1">
                  Please label the current bounding box before creating new ones
                </span>
              )}
            </p>
          </div>
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

        <div className="flex flex-col items-center space-y-6">
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
                src="/placeholder.svg?height=1000&width=1000"
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
              Click and drag on the image to create bounding boxes. After
              creating a box, you must select whether it's positive or negative
              before creating new boxes. Hover over a labeled box and click the
              "×" to remove it.
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
              Submit Annotations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
