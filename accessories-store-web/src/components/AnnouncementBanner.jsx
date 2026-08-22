import { useState, useEffect } from "react";
import { getAnnouncement } from "../api/announcement";

function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    getAnnouncement().then((res) => setAnnouncement(res.data)).catch(() => {});
  }, []);

  if (!announcement || !announcement.isActive) return null;

  return (
    <div className="bg-rose-500 text-white text-sm text-center px-4 py-2.5">
      {announcement.message}
    </div>
  );
}

export default AnnouncementBanner;