"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FC } from 'react';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  // Add more languages as needed by Gemini API capabilities
];

export const LanguageSelector: FC<LanguageSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <Select onValueChange={onChange} defaultValue={value} disabled={disabled}>
      <SelectTrigger className="w-full md:w-[280px]">
        <SelectValue placeholder="Select input language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
