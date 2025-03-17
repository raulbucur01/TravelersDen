import React, { useState } from "react";
import { Camera } from "lucide-react";

interface ProfilePictureChangerProps {
  currentImage: string;
  onImageChange: (file: File | null) => void;
}

const ProfilePictureChanger = ({
  currentImage,
  onImageChange,
}: ProfilePictureChangerProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Generate preview
      onImageChange(file); // Pass file to parent component
    }
  };

  return (
    <div className="relative w-40 h-40">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="profile-pic-upload"
      />
      {/* Clickable Image */}
      <label htmlFor="profile-pic-upload" className="cursor-pointer relative">
        <img
          src={preview || "/assets/icons/profile-placeholder.svg"}
          alt="Profile Preview"
          className="w-40 h-40 rounded-full object-cover border border-dm-secondary"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
          <Camera className="text-white w-10 h-10" />
        </div>
      </label>
    </div>
  );
};

export default ProfilePictureChanger;
