export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  RICHTEXT = "richText",
  PHONE_INPUT = "phoneInput",
  SELECT = "select",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  SWITCH = "switch",
  DATE_PICKER = "datePicker",
  TAGS_INPUT = "tagsInput",
  IMAGE_UPLOAD = "imageUpload",
}

export const OPT_LENGTH = 6;

export const DATE_YEAR_MIN = 1970;
export const DATE_DEFAULT_FORMAT = "yyyy-MM-dd"; // 2022-08-11
export const DATETIME_DEFAULT_FORMAT = "yyyy-MM-dd h:mm a"; // 2022-08-11 1:00 PM
export const DATE_DISPLAY_FORMAT = "PPP";

export const MAX_UPLOAD_FILE_SIZE = 5242880; // 5MB
export const DEFAULT_MAX_FILES = 5;
export const DEFAULT_MIN_FILE = 1;

export enum UploaderType {
  MULTIPLE_ANY = "multiple_any",
  SINGLE_ANY = "single_any",
  SINGLE_DOCUMENT = "single_document",
  MULTIPLE_DOCUMENT = "multiple_documents",
  SINGLE_IMAGE = "single_image",
  MULTIPLE_IMAGE = "multiple_images",
}

export const AcceptedFileTypes = {
  document: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc", ".docx"],
    "application/vnd.ms-excel": [".xls", ".xlsx"],
    "text/csv": [".csv"],
  },
  image: { "image/*": [".jpg", ".jpeg", ".png", ".heic", ".heif"] },
  default: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc", ".docx"],
    "application/vnd.ms-excel": [".xls", ".xlsx"],
    "text/csv": [".csv"],
    "text/plain": [".txt"],
    "image/*": [".jpg", ".jpeg", ".png", ".heic", ".heif"],
  },
};
