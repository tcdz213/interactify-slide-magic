
import React from 'react';

interface PopularTag {
  name: string;
  link: string;
}

interface PopularTagsProps {
  label: string;
  tags: PopularTag[];
}

const PopularTags: React.FC<PopularTagsProps> = ({ label, tags }) => {
  return (
    <div 
      className="flex flex-wrap gap-2 mt-4 justify-center"
      aria-label="Popular categories"
    >
      <span className="text-sm">{label}</span>
      {tags.map((tag) => (
        <a
          key={tag.name}
          href={tag.link}
          className="text-sm px-3 py-1 rounded-full bg-background border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
          aria-label={`Search ${tag.name} category`}
        >
          {tag.name}
        </a>
      ))}
    </div>
  );
};

export default PopularTags;
