import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      const newValue = [...value, trimmedTag];
      onChange(newValue);
    }
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    const newValue = value.filter((t) => t !== tag);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap p-2 border border-gray-300 rounded-md bg-white min-h-[42px]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => {
        if (!disabled && inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      {value.map((tag) => (
        <div
          key={tag}
          className="inline-flex items-center bg-gray-100 text-sm px-2 py-1 rounded-md m-1"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              className="ml-1 text-gray-400 hover:text-gray-600"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      <input
        ref={inputRef}
        type="text"
        className="flex-1 min-w-[80px] border-0 p-1 focus:ring-0 focus:outline-none"
        placeholder={value.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        disabled={disabled}
      />
    </div>
  );
}
