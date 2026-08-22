import { useState, useEffect } from "react";
import { getAnnouncement } from "../api/announcement";

function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    getAnnouncement().then((res) => setAnnouncement(res.data)).catch(() => {});
  }, []);

  if (!announcement || !announcement.isActive || !announcement.message) return null;

  // Repeat the message enough times to guarantee the track overflows the
  // viewport, then duplicate that whole block once for a seamless -50% loop.
  const block = Array(10).fill(announcement.message);
  const items = [...block, ...block];

  return (
    <div className="bg-rose-500 py-2 overflow-hidden">
      <div className="flex w-max animate-announcement">
        {items.map((text, i) => (
          <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
            <span className="text-white text-xs font-medium tracking-wide">{text}</span>
            <span className="text-white/60 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default AnnouncementBanner;