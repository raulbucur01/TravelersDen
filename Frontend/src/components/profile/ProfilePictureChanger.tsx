import React, { useState } from "react";

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
    <div className="flex flex-col items-center gap-4">
      <img
        src={preview || "/assets/icons/profile-placeholder.svg"}
        alt="Profile Preview"
        className="h-24 w-24 rounded-full object-cover border border-dm-light-3"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="profile-pic-upload"
      />
      <label
        htmlFor="profile-pic-upload"
        className="cursor-pointer px-4 py-2 bg-dm-dark-3 text-white rounded-lg hover:bg-dm-dark-4"
      >
        Choose Image
      </label>
    </div>
  );
};

export default ProfilePictureChanger;
