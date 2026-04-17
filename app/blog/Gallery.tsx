import React from "react";

interface GalleryProps {
  title: string;
  screenshots: string[];
  index: number;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}

const Gallery: React.FC<GalleryProps> = ({ title, screenshots, index, onClose, onNavigate }) => {
  // Keyboard navigation and accessibility can be added here
  const handlePrev = React.useCallback(() => onNavigate(-1), [onNavigate]);
  const handleNext = React.useCallback(() => onNavigate(1), [onNavigate]);
  const handleClose = React.useCallback(() => onClose(), [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Gallery for ${title}`}> 
      <button onClick={handleClose} aria-label="Close gallery">Close</button>
      <div>
        <button onClick={handlePrev} aria-label="Previous screenshot">Prev</button>
        <img src={screenshots[index]} alt={`${title} screenshot ${index + 1}`} loading="lazy" />
        <button onClick={handleNext} aria-label="Next screenshot">Next</button>
      </div>
      <p>{index + 1} / {screenshots.length}</p>
    </div>
  );
};

export default React.memo(Gallery);
