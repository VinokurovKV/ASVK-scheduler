import { Box, FormHelperText, Typography } from "@mui/material";

import { useRef } from "react";

interface TimeInputProps {
  label: string;

  hours: string;
  minutes: string;

  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;

  error?: boolean;
  helperText?: string;
}

const onlyTwoDigits = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 2);
};

export const TimeInput = ({
  label,
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  error = false,
  helperText,
}: TimeInputProps) => {
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  const focusInputNearPointer = (
    input: HTMLInputElement,
    pointerX: number,
  ) => {
    const inputRect = input.getBoundingClientRect();
    const position =
      pointerX < inputRect.left + inputRect.width / 2 ? 0 : input.value.length;

    input.focus();
    input.setSelectionRange(position, position);
  };

  const handleContainerPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.target instanceof HTMLInputElement) {
      return;
    }

    const hoursInput = hoursRef.current;
    const minutesInput = minutesRef.current;

    if (!hoursInput || !minutesInput) {
      return;
    }

    event.preventDefault();

    const hoursRect = hoursInput.getBoundingClientRect();
    const minutesRect = minutesInput.getBoundingClientRect();
    const hoursCenter = hoursRect.left + hoursRect.width / 2;
    const minutesCenter = minutesRect.left + minutesRect.width / 2;
    const nearestInput =
      Math.abs(event.clientX - hoursCenter) <=
      Math.abs(event.clientX - minutesCenter)
        ? hoursInput
        : minutesInput;

    focusInputNearPointer(nearestInput, event.clientX);
  };

  const handleHoursKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "ArrowRight" &&
      event.currentTarget.selectionStart === hours.length
    ) {
      event.preventDefault();

      minutesRef.current?.focus();
      minutesRef.current?.setSelectionRange(0, 0);
    }
  };

  const handleMinutesKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "ArrowLeft" && event.currentTarget.selectionStart === 0) {
      event.preventDefault();

      hoursRef.current?.focus();

      const position = hours.length;

      hoursRef.current?.setSelectionRange(position, position);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
      }}
    >
      <Box
        onPointerDown={handleContainerPointerDown}
        sx={{
          position: "relative",

          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",

          height: 56,

          px: 1.75,

          border: "1px solid",
          borderColor: error ? "error.main" : "rgba(0, 0, 0, 0.23)",

          borderRadius: 1,
          cursor: "text",

          "&:focus-within": {
            borderWidth: 2,

            borderColor: error ? "error.main" : "primary.main",
          },
        }}
      >
        <Typography
          component="span"
          sx={{
            position: "absolute",
            top: -9,
            left: 12,

            px: 0.5,

            backgroundColor: "background.paper",

            color: error ? "error.main" : "text.secondary",

            fontSize: "0.75rem",
          }}
        >
          {label}
        </Typography>

        <input
          ref={hoursRef}
          value={hours}
          onChange={(event) => onHoursChange(onlyTwoDigits(event.target.value))}
          onKeyDown={handleHoursKeyDown}
          inputMode="numeric"
          aria-label={`${label}: часы`}
          placeholder="00"
          style={{
            width: "2.25ch",
            boxSizing: "content-box",
            padding: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            font: "inherit",
            fontSize: "1rem",
            fontVariantNumeric: "tabular-nums",
            textAlign: "right",
          }}
        />

        <Typography
          component="span"
          sx={{
            display: "inline-flex",
            justifyContent: "center",
            flexShrink: 0,
            width: "0.75ch",
            mx: 0.25,
            p: 0,
            fontSize: "1rem",
            lineHeight: 1,
          }}
        >
          :
        </Typography>

        <input
          ref={minutesRef}
          value={minutes}
          onChange={(event) =>
            onMinutesChange(onlyTwoDigits(event.target.value))
          }
          onKeyDown={handleMinutesKeyDown}
          inputMode="numeric"
          aria-label={`${label}: минуты`}
          placeholder="00"
          style={{
            width: "2.25ch",
            boxSizing: "content-box",
            padding: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            font: "inherit",
            fontSize: "1rem",
            fontVariantNumeric: "tabular-nums",
            textAlign: "left",
          }}
        />
      </Box>

      {helperText && (
        <FormHelperText
          error={error}
          sx={{
            mx: 1.75,
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};
