import { CustomSelect, type CustomSelectOption } from "@/shared/ui/CustomSelect";

export type FilterOption<T extends string> = CustomSelectOption<T>;

interface AdminFilterSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  label: string;
  className?: string;
}

export function AdminFilterSelect<T extends string>({ value, onChange, options, label, className = "" }: AdminFilterSelectProps<T>) {
  return <CustomSelect value={value} onValueChange={onChange} options={options} ariaLabel={label} className={className} />;
}
