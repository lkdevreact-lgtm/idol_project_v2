import React from "react";
import { MdAdd, MdCloudUpload } from "react-icons/md";
import { SOCKET_URL } from "../../utils/constant";

const MediaUploader = ({ value, type = "particles", onUpload, isUploading }) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);
  };

  const isVideo = value && value.endsWith(".webm");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-white/30 block">
        {type === "particles" ? "Biểu tượng hạt rơi (PNG/WEBP)" : "Video hiệu ứng (.WEBM)"}
      </label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`w-full relative rounded-2xl overflow-hidden border-2 border-dashed transition-all group flex flex-col items-center justify-center cursor-pointer
          ${value ? "border-transparent bg-white/[0.05]" : "border-white/10 hover:border-[#d946ef]/50 bg-white/[0.02]"}
          ${isVideo ? "h-48" : "h-32"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={type === "particles" ? "image/png,image/webp,image/gif" : "video/webm"}
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#d946ef] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-[#d946ef] animate-pulse">Đang tải lên...</span>
          </div>
        ) : value ? (
          <div className="w-full h-full relative group">
            {isVideo ? (
              <video 
                src={`${SOCKET_URL}${value}`} 
                autoPlay 
                loop 
                muted 
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <img 
                src={`${SOCKET_URL}${value}`} 
                className="w-full h-full object-contain p-4 drop-shadow-2xl" 
                alt="Particle preview" 
              />
            )}
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white text-sm font-bold border border-white/20">
                <MdCloudUpload size={18} /> Thay đổi
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-[#d946ef]/20 text-[#d946ef]">
              <MdAdd size={24} />
            </div>
            <span className="text-sm font-semibold">Tải file lên</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
