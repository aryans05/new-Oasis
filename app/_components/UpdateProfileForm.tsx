"use client";

import { useState } from "react";
import SubmitButton from "./SubmitButton";

type Country = {
  name: { common: string; official: string };
  flags: { png: string; svg: string };
};

type Guest = {
  id: string;
  fullName: string;
  email: string;
  nationality: string;
  nationalID: string;
  countryFlag: string;
};

type Props = {
  guest: Guest;
  countries: Country[];
  onSubmit: (formData: FormData) => Promise<void>;
};

export default function UpdateProfileForm({
  guest,
  countries,
  onSubmit,
}: Props) {
  const { id, fullName, email, nationality, nationalID, countryFlag } = guest;
  const [flag, setFlag] = useState(countryFlag || "");
  const [nationalIDValue, setNationalIDValue] = useState(nationalID || "");

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.selectedOptions[0];
    const flagUrl = selected.getAttribute("data-flag") || "";
    setFlag(flagUrl);
  }

  function handleNationalIDChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;

    // remove all non-digits
    value = value.replace(/\D/g, "");

    // restrict to max 10 digits
    if (value.length > 10) value = value.slice(0, 10);

    setNationalIDValue(value);
  }

  return (
    <form
      action={onSubmit}
      className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
    >
      {/* Hidden guest id & flag */}
      <input type="hidden" name="id" value={id || ""} />
      <input type="hidden" name="countryFlag" value={flag || ""} />

      {/* Full name */}
      <div className="space-y-2">
        <label>Full name</label>
        <input
          disabled
          defaultValue={fullName}
          name="fullName"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label>Email address</label>
        <input
          disabled
          defaultValue={email}
          name="email"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      {/* Nationality */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="nationality">Where are you from?</label>
          {flag && (
            <img src={flag} alt="Country flag" className="h-5 rounded-sm" />
          )}
        </div>

        <select
          name="nationality"
          id="nationality"
          defaultValue={nationality || ""}
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          onChange={handleCountryChange}
        >
          <option value="">Select country...</option>
          {countries.map((c) => (
            <option
              key={c.name.common}
              value={c.name.common}
              data-flag={c.flags.png}
            >
              {c.name.common}
            </option>
          ))}
        </select>
      </div>

      {/* National ID */}
      <div className="space-y-2">
        <label htmlFor="nationalID">National ID number</label>
        <input
          name="nationalID"
          value={nationalIDValue}
          onChange={handleNationalIDChange}
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          placeholder="Enter 10-digit ID"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end items-center gap-6">
        <SubmitButton pendingLabel="Updating...">Update profile</SubmitButton>
      </div>
    </form>
  );
}
