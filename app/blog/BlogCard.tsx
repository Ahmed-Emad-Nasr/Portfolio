import React from "react";
import Image from "next/image";

interface BlogCardProps {
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: string;
  category?: string;
  difficulty?: string;
  href: string;
  tags?: readonly string[];
  tools?: readonly string[];
  readTime?: number;
  date?: string;
  screenshots: string[];
  onOpenGallery: () => void;
}

const BlogCard: React.FC<BlogCardProps> = React.memo(
  ({ id, title, description, platform, type, category, difficulty, href, tags, tools, readTime, date, screenshots, onOpenGallery }) => {
    const getThumbnail = (imgPath: string) => {
      if (!imgPath) return imgPath;
      const rel = imgPath.replace(/^Assets\/Cases\//, "").replace(/[\\/]/g, "__").replace(/\.(png|jpg|jpeg)$/i, ".webp");
      return `Assets/Cases/thumbnails/${rel}`;
    };
    const cardScreenshots = screenshots.slice(0, 2);
    const extraScreenshotsCount = Math.max(0, screenshots.length - 2);
    const primaryScreenshot = cardScreenshots[0];
    const secondaryScreenshot = cardScreenshots[1];
    return (
      <article>
        <div>
          <p>{type}</p>
          {screenshots.length > 0 && <span>{screenshots.length} screenshots</span>}
        </div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        <p>{platform}</p>
        <div>
          {difficulty && <span>{difficulty}</span>}
          {category && <span>{category}</span>}
          {readTime && <span>{readTime} min</span>}
        </div>
        {tags && tags.length > 0 && (
          <div>
            {tags.slice(0, 3).map((tag) => (
              <button key={tag} type="button" title={`Search for ${tag}`}>#{tag}</button>
            ))}
            {tags.length > 3 && <span>+{tags.length - 3}</span>}
          </div>
        )}
        {tools && tools.length > 0 && (
          <div>
            {tools.slice(0, 2).map((tool) => (
              <button key={tool} type="button" title={`Filter by ${tool}`}>{tool}</button>
            ))}
            {tools.length > 2 && <span>+{tools.length - 2}</span>}
          </div>
        )}
        {primaryScreenshot && (
          <div>
            <a href={primaryScreenshot} target="_blank" rel="noreferrer" aria-label={`Open main screenshot for ${title}`}>
              <Image
                src={getThumbnail(primaryScreenshot)}
                alt={`${title} main screenshot`}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 991px) 70vw, 40vw"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = primaryScreenshot;
                }}
              />
            </a>
            {secondaryScreenshot && (
              <div>
                <a href={secondaryScreenshot} target="_blank" rel="noreferrer" aria-label={`Open screenshot 2 for ${title}`}>
                  <Image
                    src={getThumbnail(secondaryScreenshot)}
                    alt={`${title} screenshot 2`}
                    fill
                    sizes="(max-width: 560px) 45vw, 18vw"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = secondaryScreenshot;
                    }}
                  />
                </a>
                {extraScreenshotsCount > 0 && <span>+{extraScreenshotsCount}</span>}
              </div>
            )}
          </div>
        )}
        <div>
          <a href={href} target="_blank" rel="noreferrer">View PDF</a>
          <a href={href} download>Download</a>
          {screenshots.length > 0 && (
            <button type="button" onClick={onOpenGallery}>View All Screenshots</button>
          )}
        </div>
      </article>
    );
  }
);

export default BlogCard;
