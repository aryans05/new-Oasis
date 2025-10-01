"use client";

type Country = {
  name: { common: string; official: string };
  flags: { png: string; svg: string };
};

type SelectCountryProps = {
  countries?: Country[]; // optional, default []
  value?: string; // optional (controlled input)
  defaultValue?: string; // optional (uncontrolled input)
  name: string;
  id: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; // optional
};

export default function SelectCountry({
  countries = [],
  value,
  defaultValue,
  name,
  id,
  className,
  onChange,
}: SelectCountryProps) {
  return (
    <select
      name={name}
      id={id}
      value={value} // controlled (if passed)
      defaultValue={defaultValue} // fallback if uncontrolled
      className={className}
      onChange={onChange}
    >
      <option value="">Select country...</option>

      {countries.map((c) => (
        <option key={c.name.common} value={c.name.common}>
          {c.name.common} {/* if you want flag, see note below */}
        </option>
      ))}
    </select>
  );
}
