import React, { useState, useEffect } from "react";
import { useOverlayStore } from "../hooks/useOverlayStore";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdSearch,
  MdAutoAwesome,
  MdPlayCircleOutline,
  MdMovieFilter,
  MdCheck
} from "react-icons/md";
import MediaUploader from "../components/overlay/MediaUploader";
import ParticleConfigPanel from "../components/overlay/ParticleConfigPanel";
import VideoConfigPanel from "../components/overlay/VideoConfigPanel";
import OverlayPlayer from "../components/OverlayPlayer";
import { SOCKET_URL } from "../utils/constant";

// --- OverlayModal ---
const OverlayModal = ({ initial, onSave, onClose }) => {
  const { uploadOverlayMedia } = useOverlayStore();
  
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "particles");
  const [duration, setDuration] = useState(initial?.duration ?? 5);
  const [mediaUrl, setMediaUrl] = useState(initial?.media_url || null);
  
  const [particleConfig, setParticleConfig] = useState(initial?.particle_config || {});
  const [videoConfig, setVideoConfig] = useState(initial?.video_config || {});
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError("");
    const res = await uploadOverlayMedia(file);
    if (res.success) {
      setMediaUrl(res.path);
    } else {
      setError(res.error || "Upload failed");
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!name) {
      setError("Vui lòng nhập tên hiệu ứng");
      return;
    }

    const payload = {
      name,
      type,
      duration: Number(duration) || 5,
      media_url: mediaUrl,
      preview_color: type === "particles" ? particleConfig.color || "#d946ef" : "#06b6d4"
    };

    if (type === "particles") {
      payload.particle_config = particleConfig;
    } else if (type === "video") {
      if (!mediaUrl) {
        setError("Vui lòng upload video cho hiệu ứng này");
        return;
      }
      payload.video_config = videoConfig;
    }

    const res = await onSave(payload);
    if (!res.success) setError(res.error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#13141f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] shrink-0">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <MdAutoAwesome className="text-[#06b6d4] w-6 h-6" />
            {initial ? "Sửa Overlay" : "Thêm Overlay Mới"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <MdClose size={22} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
          {error && <div className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl border border-red-500/20">{error}</div>}

          {/* Type Selection (Only on create) */}
          {!initial && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("particles")}
                className={`py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  type === "particles" ? "border-[#d946ef] bg-[#d946ef]/10 text-[#d946ef]" : "border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                <MdAutoAwesome size={28} />
                <span className="font-bold">Particles (Hạt Rơi)</span>
              </button>
              <button
                onClick={() => setType("video")}
                className={`py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  type === "video" ? "border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4]" : "border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                <MdMovieFilter size={28} />
                <span className="font-bold">Video (Trong suốt)</span>
              </button>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-white/30 mb-2 block">Tên hiệu ứng</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d946ef]/60"
                placeholder="VD: Mưa hoa hồng..."
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-white/30 mb-2 block">Thời gian hiển thị mặc định (giây)</label>
              <input
                type="number"
                min={1} max={30}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d946ef]/60"
              />
            </div>
          </div>

          {/* Uploader */}
          <MediaUploader
             value={mediaUrl}
             type={type}
             onUpload={handleUpload}
             isUploading={isUploading}
          />

          {/* Config Panel based on Type */}
          <div className="mt-2">
            <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase tracking-widest">
              Bảng điều khiển thông số ({type})
            </label>
            {type === "particles" ? (
              <ParticleConfigPanel config={particleConfig} onChange={setParticleConfig} />
            ) : (
              <VideoConfigPanel config={videoConfig} onChange={setVideoConfig} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.05] shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white font-semibold">
            Hủy
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white font-bold hover:brightness-110 shadow-[0_0_15px_rgba(217,70,239,0.4)]">
            <MdCheck size={20} /> Lưu Overlay
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Delete Confirm ---
const DeleteConfirm = ({ overlay, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
    <div className="w-full max-w-sm bg-[#13141f] border border-white/10 rounded-3xl p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mx-auto mb-4">
         <MdDelete size={32} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Xóa Overlay</h3>
      <p className="text-sm text-gray-400 mb-6">Bạn có chắc chắn muốn xóa hiệu ứng "{overlay.name}"? Hành động này không thể hoàn tác.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5">Hủy</button>
        <button onClick={() => onConfirm(overlay.id)} className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-bold">Xóa Xong</button>
      </div>
    </div>
  </div>
);

// --- OverlayPage Component ---
const OverlayPage = () => {
  const { overlays, fetchOverlays, addOverlay, updateOverlay, deleteOverlay, toggleActive, loading } = useOverlayStore();
  const [modal, setModal] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchOverlays();
  }, [fetchOverlays]);

  const filtered = overlays.filter((o) => {
    if (activeTab === "particles" && o.type !== "particles") return false;
    if (activeTab === "video" && o.type !== "video") return false;
    return o.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-full h-full text-white overflow-y-auto p-4 sm:p-8 flex flex-col font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h4 className="text-[10px] font-bold text-[#0ea5e9] tracking-widest uppercase mb-1">Dynamic Engine</h4>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Quản lý Overlay</h1>
          <p className="text-sm text-gray-400">Tạo hình ảnh và video hiệu ứng để đính kèm vào phần Quà Tặng.</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#3b82f6] text-white font-bold shadow-[0_4px_15px_rgba(14,165,233,0.3)] hover:scale-[1.02] transition-all"
        >
          <MdAdd size={20} /> Tạo Overlay Mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 relative">
        <div className="relative flex-1 md:max-w-md">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:border-[#0ea5e9]/50 focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex bg-white/[0.02] p-1 rounded-xl border border-white/5 w-max">
          <button onClick={() => setActiveTab("all")} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-[#0ea5e9] text-white' : 'text-gray-400 hover:text-white'}`}>Tất cả</button>
          <button onClick={() => setActiveTab("particles")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'particles' ? 'bg-[#d946ef] text-white' : 'text-gray-400 hover:text-white'}`}><MdAutoAwesome/> Hạt Rơi</button>
          <button onClick={() => setActiveTab("video")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'video' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}><MdMovieFilter/> Video</button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 pb-20">
        {loading ? (
          <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center mt-24 text-gray-500 font-medium">Chưa có Overlay nào. Cùng tạo ngay nhé!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((overlay) => {
              const isVideo = overlay.type === "video";
              const isParticle = !isVideo;
              return (
                <div key={overlay.id} className={`bg-[#151624] border rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${overlay.active ? (isVideo ? "border-[#3b82f6]/30 hover:border-[#3b82f6]" : "border-[#d946ef]/30 hover:border-[#d946ef]") : "border-white/5 opacity-60"}`}>
                  {/* Thumbnail / Header */}
                  <div className="h-32 bg-black/40 relative flex items-center justify-center p-4 border-b border-white/5">
                    {overlay.media_url ? (
                       isVideo ? (
                         <video src={`${SOCKET_URL}${overlay.media_url}`} className="h-full w-full object-contain mix-blend-screen opacity-80" />
                       ) : (
                         <img src={`${SOCKET_URL}${overlay.media_url}`} className="h-full w-full object-contain filter drop-shadow-lg" />
                       )
                    ) : (
                       <MdAutoAwesome size={40} className="text-gray-600" />
                    )}
                    <div className="absolute top-3 right-3">
                       <button onClick={() => toggleActive(overlay.id)} className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${overlay.active ? (isVideo ? "bg-[#3b82f6]" : "bg-[#d946ef]") : "bg-white/20"}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${overlay.active ? "translate-x-4" : "translate-x-0"}`} />
                       </button>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[9px] font-bold tracking-widest uppercase border border-white/10">
                      {isVideo ? <span className="text-[#3b82f6] flex items-center gap-1"><MdMovieFilter/> VIDEO</span> : <span className="text-[#d946ef] flex items-center gap-1"><MdAutoAwesome/> PARTICLE</span>}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-1 truncate">{overlay.name}</h3>
                    <p className="text-xs text-gray-400 mb-4">{overlay.duration} giây</p>
                    
                    <div className="mt-auto grid grid-cols-3 gap-2">
                       <button onClick={() => setPreviewData(overlay)} className="col-span-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-semibold border border-white/5 transition-colors">
                          <MdPlayCircleOutline size={18}/> Preview
                       </button>
                       <div className="col-span-1 flex gap-2">
                         <button onClick={() => setModal({ mode: "edit", data: overlay })} className="flex-1 flex items-center justify-center rounded-xl bg-white/5 hover:bg-[#06b6d4]/20 hover:text-[#06b6d4] text-gray-400 border border-white/5 transition-colors">
                           <MdEdit />
                         </button>
                         <button onClick={() => setDeleteTarget(overlay)} className="flex-1 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 transition-colors">
                           <MdDelete />
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <OverlayModal
          initial={modal.data}
          onSave={async (data) => {
            const res = modal.mode === "add" ? await addOverlay(data) : await updateOverlay(modal.data.id, data);
            if (res.success) {
              setModal(null);
              fetchOverlays(); // ensure fresh data
            }
            return res;
          }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
         <DeleteConfirm 
            overlay={deleteTarget}
            onConfirm={async (id) => {
               await deleteOverlay(id);
               setDeleteTarget(null);
            }}
            onClose={() => setDeleteTarget(null)}
         />
      )}

      {previewData && (
         <OverlayPlayer isPreview={true} previewData={previewData} onClosePreview={() => setPreviewData(null)} />
      )}
    </div>
  );
};

export default OverlayPage;
