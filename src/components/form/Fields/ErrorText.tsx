import React from "react";

type ErrorTextProps = {
  message?: string;
};

const ErrorText: React.FC<ErrorTextProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-500">{message}</p>;
};

export default ErrorText;
