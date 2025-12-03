import React from "react";

type ColorTheme = {
  name: string;
  preview: string;
  border: string;
};

type ColorThemeSelectorProps = {
  themes: Record<string, ColorTheme>;
  selected: string;
  onSelect: (key: string) => void;
};

export default function ColorThemeSelector({
  themes,
  selected,
  onSelect,
}: ColorThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Object.entries(themes).map(([key, theme]) => (
        <div
          key={key}
          onClick={() => onSelect(key)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            selected === key
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div
            className="w-full h-8 rounded-lg mb-2"
            style={{
              backgroundColor: theme.preview,
              border: `1px solid ${theme.border}`,
            }}
          />
          <p className="text-sm font-medium text-center">{theme.name}</p>
        </div>
      ))}
    </div>
  );
}
