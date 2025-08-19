"use client";

import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import {
  DATE_DEFAULT_FORMAT,
  DATE_DISPLAY_FORMAT,
  DATE_YEAR_MIN,
  FormFieldType,
} from "@/constants";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/globals/custom-calendar";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/globals/rich-text-editor";
import { TagsInput } from "@/components/globals/tags-input";
import ImageUpload from "@/components/globals/image-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldType;
  name: string;
  options?: Array<string>;
  feedbackOptions?: { label: string; value: string; icon: string }[];
  dynamicOptions?: { label: string; value: string; imageUrl?: string }[];
  label?: string;
  type?: string | number;
  placeholder?: string;
  description?: string | React.ReactNode;
  dateFormat?: string;
  showTimeSelect?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  isRequired?: boolean;
  className?: string;
  autoFocus?: boolean;
  renderedValue?: string | string[];
  onCreate?: (value: string) => void;
  renderSkeleton?: (field: any) => React.ReactNode;
  onChange?: (value: any) => void;
  imageCount?: number;
  maxSize?: number;
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const {
    fieldType,
    placeholder,
    disabled,
    description,
    type,
    options,
    dynamicOptions,
    feedbackOptions,
    label,
    autoFocus,
    renderedValue,
    onCreate,
    onChange,
    imageCount,
    maxSize,
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  switch (fieldType) {
    case FormFieldType.INPUT:
      return (
        <>
          <FormControl>
            <div className="shad-input-outer">
              {/* Input field */}
              <Input
                type={
                  type === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : type
                }
                placeholder={placeholder}
                className="h-10"
                disabled={disabled}
                {...field}
                autoFocus={autoFocus}
                onChange={(event) => {
                  let value = event.target.value;
                  // Handle number type and ensure empty values do not result in NaN
                  if (type === "number") {
                    value = value === "" ? "" : String(parseFloat(value));
                  }
                  field.onChange(value); // Trigger field onChange with the processed value
                }}
              />

              {/* Toggle visibility for password fields */}
              {type === "password" && (
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={toggleShowPassword}
                  className="floating-right-btn"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" /> // Icon to indicate password visibility is off
                  ) : (
                    <Eye className="w-4 h-4 opacity-50" /> // Icon to indicate password visibility is on
                  )}
                </button>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
        </>
      );

    case FormFieldType.TEXTAREA:
      return (
        <>
          <FormControl>
            <div className="shad-input-outer">
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                className="shad-input"
                autoFocus={autoFocus}
              />
            </div>
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
        </>
      );

    case FormFieldType.RICHTEXT:
      return (
        <>
          <FormControl>
            <RichTextEditor
              placeholder={placeholder}
              disabled={disabled}
              value={field.value}
              onChangeAction={field.onChange}
            />
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
        </>
      );

    case FormFieldType.TAGS_INPUT:
      return (
        <>
          <FormControl>
            <div className="shad-input-outer">
              <TagsInput
                placeholder={placeholder}
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value || []}
                // className="shad-input"
                autoFocus={autoFocus}
              />
            </div>
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
        </>
      );

    case FormFieldType.IMAGE_UPLOAD:
      return (
        <>
          <FormControl>
            <div className="shad-input-outer">
              <ImageUpload
                onImageUpload={(url) => field.onChange(url)}
                defaultValue={field.value}
                imageCount={imageCount || 1}
                maxSize={maxSize || 4}
              />
            </div>
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
        </>
      );

    case FormFieldType.SELECT:
      return (
        <>
          <FormControl>
            <Select
              onValueChange={(value) => {
                if (onChange) {
                  onChange(value);
                } else {
                  field.onChange(value);
                }
              }}
              value={field.value || renderedValue}
            >
              <SelectTrigger
                disabled={disabled}
                className={cn(
                  "shad-select-trigger w-full !border bg-transparent !border-[#c9c9cf]",
                  !field.value && "text-muted-foreground"
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent>
                {dynamicOptions && dynamicOptions.length > 0
                  ? dynamicOptions.map((option) => (
                      <SelectItem className='pl-2' key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.imageUrl && (
                            <Avatar className="size-6">
                              <AvatarImage
                                className="object-contain"
                                src={option.imageUrl || ""}
                              />
                              <AvatarFallback>
                                {option.label.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))
                  : options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
        </>
      );

    case FormFieldType.DATE_PICKER:
      return (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "shad-input",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {field.value ? (
                    format(field.value, DATE_DISPLAY_FORMAT)
                  ) : (
                    <span>Select a date</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout="dropdown-buttons"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) =>
                  date && field.onChange(format(date, DATE_DEFAULT_FORMAT))
                }
                fromYear={DATE_YEAR_MIN}
                toYear={new Date().getFullYear()}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
        </>
      );

    case FormFieldType.RADIO:
      return (
        <FormControl>
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="radio-group flex items-center space-x-2"
            disabled={disabled}
          >
            {options &&
              options.map((option) => (
                <FormItem
                  key={option}
                  className="radio-item flex gap-1.5 items-center"
                >
                  <FormControl>
                    <RadioGroupItem value={option} />
                  </FormControl>
                  <FormLabel
                    className={cn(
                      "!my-auto font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {option}
                  </FormLabel>
                </FormItem>
              ))}
          </RadioGroup>
        </FormControl>
      );

    case FormFieldType.CHECKBOX:
      return (
        <div className="items-top flex space-x-2">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="grid gap-1.5 leading-none">
            <FormLabel>{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
        </div>
      );

    default:
      break;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, fieldType, label, name, isRequired, className } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="space-y-1">
            {fieldType !== FormFieldType.CHECKBOX && label && (
              <FormLabel>
                {label}
                {isRequired === true ? (
                  <span className="text-red-700 text-xs"> *</span>
                ) : isRequired === false ? (
                  <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                ) : (
                  ""
                )}
              </FormLabel>
            )}
            <RenderField field={field} props={props} />
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
