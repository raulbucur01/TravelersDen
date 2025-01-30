import { useCallback, useEffect, useRef, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui/button";

type FileUploaderProps = {
  fieldChange: (FILES: File[]) => void;
  mediaUrls?: { url: string; type: string }[]; // Optional for existing media during editing
  onUpdate?: (updatedFiles: {
    newFiles: File[];
    deletedFiles: string[];
  }) => void; // sent to parent for update
};

const FileUploader = ({
  fieldChange,
  mediaUrls = [],
  onUpdate,
}: FileUploaderProps) => {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [fileObjects, setFileObjects] = useState<any[]>(
    mediaUrls.length ? mediaUrls.map(() => undefined) : []
  );

  const [fileUrls, setFileUrls] = useState<string[]>(
    mediaUrls.length ? mediaUrls.map((media) => media.url) : []
  );
  const [mimeTypes, setMimeTypes] = useState<string[]>(
    mediaUrls.length ? mediaUrls.map((media) => media.type) : []
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (onUpdate) {
      onUpdate({ newFiles, deletedFiles });
    }
  }, [newFiles, deletedFiles]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (fileUrls.length >= 6) return; // Prevent exceeding limit
      const newFileObjects = acceptedFiles.slice(0, 6 - fileUrls.length); // Limit to 6 files
      const newFileUrls = newFileObjects.map((file) =>
        URL.createObjectURL(file)
      );
      const newMimeTypes = newFileObjects.map((file) => file.type);

      setFileObjects((prev: any) => [...prev, ...newFileObjects]);
      setNewFiles((prev) => [...prev, ...newFileObjects]);
      setFileUrls((prev) => [...prev, ...newFileUrls]);
      setMimeTypes((prev) => [...prev, ...newMimeTypes]);
      fieldChange([...newFiles, ...newFileObjects]);
    },
    [newFiles, fileUrls, fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
    multiple: true, // Allow multiple file uploads
  });

  const navigateFiles = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentIndex((prev) => (prev - 1 + fileUrls.length) % fileUrls.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % fileUrls.length);
    }
  };

  const handleDelete = () => {
    const fileUrlToDelete = fileUrls[currentIndex];

    if (mediaUrls.some((media) => media.url === fileUrlToDelete)) {
      // File was originally in mediaUrls → Track it for deletion
      setDeletedFiles((prev) => [...prev, fileUrlToDelete]);
    } else {
      // File was newly added → Remove from newFiles
      setNewFiles((prev) =>
        prev.filter((file) => file !== fileObjects[currentIndex])
      );
    }

    // Update file lists
    setFileUrls((prev) => prev.filter((_, index) => index !== currentIndex));
    setMimeTypes((prev) => prev.filter((_, index) => index !== currentIndex));
    setFileObjects((prev: any) =>
      prev.filter((_: any, index: any) => index !== currentIndex)
    );

    // Adjust currentIndex if needed
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));

    fieldChange([
      ...newFiles.filter((file) => file !== fileObjects[currentIndex]),
    ]);
  };

  // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  // console.log("newFiles", newFiles);
  // console.log("deletedFiles", deletedFiles);
  // console.log("fileUrls", fileUrls);
  // console.log("fileObjects", fileObjects);
  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dm-dark rounded-xl cursor-pointer w-full h-[400px]"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrls.length > 0 ? (
        <div className="relative w-full">
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            {mimeTypes[currentIndex].startsWith("video") ? (
              <video
                onClick={(e) => e.stopPropagation()}
                src={fileUrls[currentIndex]}
                controls
                className="w-[500px] h-[400px] object-cover"
              />
            ) : (
              <img
                onClick={(e) => e.stopPropagation()}
                src={fileUrls[currentIndex]}
                alt={`file-${currentIndex}`}
                className="w-[500px] h-[400px] object-cover"
              />
            )}
          </div>

          {currentIndex != 0 && (
            <div className="absolute inset-y-0 lg:left-10 left-2 flex items-center opacity-30 hover:opacity-70">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering dropzone on click
                  navigateFiles("prev");
                }}
                className="bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full"
              >
                <img
                  src="/assets/icons/left-arrow.png"
                  alt="left-arrow"
                  className="w-10 h-auto"
                />
              </button>
            </div>
          )}

          {currentIndex != fileUrls.length - 1 && (
            <div className="absolute inset-y-0 lg:right-10 right-2 flex items-center opacity-30 hover:opacity-70">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering dropzone on click
                  navigateFiles("next");
                }}
                className="bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full"
              >
                <img
                  src="/assets/icons/right-arrow.png"
                  alt="right-arrow"
                  className="w-10 h-auto"
                />
              </button>
            </div>
          )}

          {/* Dots */}
          <div className="absolute bottom-11 right-0 left-0">
            <div className="flex items-center justify-center gap-2">
              {fileUrls &&
                fileUrls.length > 1 &&
                fileUrls.map((_, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    className={`w-2 h-2 bg-white rounded-full cursor-pointer ${
                      currentIndex === i
                        ? "p-1 bg-opacity-100"
                        : "bg-opacity-50"
                    }`}
                  />
                ))}
            </div>
          </div>

          {/* Delete button */}
          <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering dropzone on click
                handleDelete();
              }}
              className="bg-dm-dark hover:bg-dm-secondary text-dm-light py-1 px-1 rounded-md shadow-lg"
            >
              <img src="/assets/icons/delete.svg" alt="delete" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-center flex-col">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file-upload"
          />
          <h3 className="base-medium text-dm-light mb-2 mt-6">
            Drag photos or videos here
          </h3>
          <p className="text-dm-secondary small-regular mb-6">
            SVG, PNG, JPG, MP4 (up to 6)
          </p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
