"use client";

import { useState, useEffect } from "react";
import { differenceInCalendarDays } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Settings {
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestsPerBooking: number;
}

interface DateSelectorProps {
  cabinId: string;
  settings: Settings;
  bookedDates: (string | Date)[];
  selectedDate?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  regularPrice?: number;
  discount?: number;
}

function DateSelector({
  cabinId,
  settings,
  bookedDates = [],
  regularPrice = 100,
  discount = 0,
  selectedDate,
  onChange,
}: DateSelectorProps) {
  const [range, setRange] = useState<DateRange | undefined>(selectedDate);

  useEffect(() => {
    if (onChange) onChange(range);
  }, [range, onChange]);

  const resetRange = () => setRange(undefined);

  const numNights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  const cabinPrice = numNights * (regularPrice - discount);

  const disabledDays = bookedDates.map((d) =>
    typeof d === "string" ? new Date(d) : d
  );

  return (
    <div className="flex flex-col justify-between h-full">
      <DayPicker
        className="pt-4 place-self-center"
        mode="range"
        selected={range}
        onSelect={setRange}
        fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={1}
        disabled={disabledDays}
      />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-baseline gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span>/night</span>
          </p>

          {numNights > 0 && (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl flex items-center gap-1">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          )}
        </div>

        {range && (range.from || range.to) && (
          <button
            type="button"
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default DateSelector;
