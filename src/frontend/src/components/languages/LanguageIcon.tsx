import { useState } from 'react';
import { Globe } from 'lucide-react';

interface LanguageIconProps {
  languageId: bigint;
  languageName: string;
  className?: string;
  size?: number;
}

export default function LanguageIcon({
  languageId,
  languageName,
  className = 'h-6 w-6',
  size = 24,
}: LanguageIconProps) {
  const [imageError, setImageError] = useState(false);
  const iconPath = `/assets/generated/language-icon-${languageId}.dim_128x128.png`;

  if (imageError) {
    return <Globe className={className} />;
  }

  return (
    <img
      src={iconPath}
      alt={`${languageName} icon`}
      className={className}
      style={{ width: size, height: size }}
      onError={() => setImageError(true)}
    />
  );
}
