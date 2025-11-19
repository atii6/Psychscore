import React from "react";
import ReactQuill from "react-quill";

type Props = {
  canEdit: boolean;
  setQuillRef: React.Dispatch<React.SetStateAction<ReactQuill | null>>;
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
  onChange?: (val: string) => void;
};

function QuillEditor({
  canEdit,
  setQuillRef,
  placeholder,
  readOnly,
  value,
  onChange,
}: Props) {
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
      ["link"],
    ],
  };

  return (
    <ReactQuill
      ref={setQuillRef}
      value={value}
      onChange={onChange}
      modules={canEdit ? quillModules : { toolbar: false }}
      theme="snow"
      placeholder={placeholder}
      style={{ minHeight: "400px" }}
      readOnly={readOnly}
    />
  );
}

export default QuillEditor;
