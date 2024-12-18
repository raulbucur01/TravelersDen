import { useCallback, useRef, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui/button";

type FileUploaderProps = {
  fieldChange: (FILES: File[]) => void;
  mediaUrls?: string[]; // Optional for existing media during editing
};

const FileUploader = ({ fieldChange, mediaUrls = [] }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>(
    mediaUrls.length ? mediaUrls : []
  );
  const [mimeTypes, setMimeTypes] = useState<string[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, 6); // Limit to 6 files
      const newFileUrls = [
        ...fileUrls,
        ...acceptedFiles.map((file) => URL.createObjectURL(file)),
      ].slice(0, 6);

      const newMimeTypes = [
        ...fileUrls,
        ...acceptedFiles.map((file) => file.type),
      ];

      setFiles(newFiles);
      setFileUrls(newFileUrls);
      fieldChange(newFiles);
      setMimeTypes(newMimeTypes);
    },
    [files, fileUrls, fieldChange]
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
    // Remove the current file from the arrays
    const updatedFiles = files.filter((_, index) => index !== currentIndex);
    const updatedFileUrls = fileUrls.filter(
      (_, index) => index !== currentIndex
    );
    const updatedMimeTypes = mimeTypes.filter(
      (_, index) => index !== currentIndex
    );

    // Update state and notify parent component
    setFiles(updatedFiles);
    setFileUrls(updatedFileUrls);
    fieldChange(updatedFiles);
    setMimeTypes(updatedMimeTypes);

    // Adjust currentIndex if necessary
    if (updatedFileUrls.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
    }
  };

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
                className="w-full h-[400px] object-contain "
              />
            ) : (
              <img
                onClick={(e) => e.stopPropagation()}
                src={fileUrls[currentIndex]}
                alt={`file-${currentIndex}`}
                className="w-[500px] h-[400px] object-contain"
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

          {/* Delete and reselect button */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering dropzone on click
                handleDelete();
              }}
              className="bg-dm-dark hover:bg-dm-secondary text-dm-light py-2 px-4 rounded-md shadow-lg"
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
