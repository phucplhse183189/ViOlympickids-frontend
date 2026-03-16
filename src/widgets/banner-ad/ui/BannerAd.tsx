import React from 'react';
import './BannerAd.css';

interface BannerAdProps {
  position: 'left' | 'right';
  image: string;
  link: string;
  alt?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({ position, image, link, alt }) => {
  return (
    <div className={`banner-ad banner-ad-${position}`}>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img src={image} alt={alt || 'Banner quảng cáo'} />
      </a>
    </div>
  );
};

export default BannerAd;
