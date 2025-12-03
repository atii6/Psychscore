import React from "react";
import { Label } from "@/components/ui/label";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type RichTextEditorCardProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  classname?: string;
};

export default function RichTextEditorCard({
  label,
  value,
  onChange,
  placeholder,
  classname,
}: RichTextEditorCardProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block text-[var(--text-primary)]">
        {label}
      </Label>
      <div className="border rounded-lg">
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          className={classname}
        />
      </div>
    </div>
  );
}
