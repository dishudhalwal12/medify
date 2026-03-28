"use client";

import { KeyboardEvent, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ListEditor({
  label,
  values,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  helper?: string;
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();

    if (!value || values.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }

    onChange([...values, value]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addItem();
  }

  function removeItem(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        {helper ? <p className="mt-1 text-sm text-gray-500">{helper}</p> : null}
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => removeItem(value)}
              className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ef] px-3 py-2 text-sm font-medium text-gray-700"
            >
              {value}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] bg-[#f7f4ef] px-4 py-3 text-sm text-gray-500">
          Nothing added yet.
        </div>
      )}
    </div>
  );
}
