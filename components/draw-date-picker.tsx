"use client";

import {
  ChakraProvider,
  DatePicker,
  Portal,
  defaultSystem,
} from "@chakra-ui/react";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import { Icon } from "@/components/icons";
import { PluginRegistry, Timepicker } from "timepicker-ui-react";
import { WheelPlugin } from "timepicker-ui/plugins/wheel";

if (!PluginRegistry.has(WheelPlugin.name)) {
  PluginRegistry.register(WheelPlugin);
}

type Locale = "en" | "pt-BR";

export function DrawDatePicker({
  locale,
  value,
  onChange,
  label,
}: {
  locale: Locale;
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const [datePart, timePart = "19:00"] = value.split("T");
  const [hour = "19", minute = "00"] = timePart.split(":");
  const hourNumber = Number(hour);
  const pickerValue =
    locale === "pt-BR"
      ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
      : `${hourNumber % 12 || 12}:${minute.padStart(2, "0")} ${hourNumber < 12 ? "AM" : "PM"}`;
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(datePart)
    ? [parseDate(datePart)]
    : [];

  return (
    <ChakraProvider value={defaultSystem}>
      <div className="draw-date-picker">
        <div className="draw-date-picker-control">
          <label htmlFor="draw-date">
            {locale === "pt-BR" ? "Data" : "Date"}
          </label>
          <DatePicker.Root
            locale={locale === "pt-BR" ? "pt-BR" : "en-US"}
            timeZone={getLocalTimeZone()}
            openOnClick
            closeOnSelect
            value={selectedDate}
            onValueChange={({ value: dates }) => {
              const nextDate = dates[0]?.toString() ?? "";
              onChange(nextDate ? `${nextDate}T${timePart}` : "");
            }}
          >
            <DatePicker.Control>
              <DatePicker.Input
                id="draw-date"
                aria-label={locale === "pt-BR" ? label : "Date and time"}
                placeholder={locale === "pt-BR" ? "Selecione uma data" : "Select a date"}
                required
              />
              <DatePicker.IndicatorGroup>
                <DatePicker.Trigger aria-label={locale === "pt-BR" ? "Abrir calendário" : "Open calendar"}>
                  <Icon name="calendar" size={18} />
                </DatePicker.Trigger>
              </DatePicker.IndicatorGroup>
            </DatePicker.Control>
            <Portal>
              <DatePicker.Positioner>
                <DatePicker.Content className="draw-calendar">
                  <DatePicker.View view="day">
                    <DatePicker.Header />
                    <DatePicker.DayTable />
                  </DatePicker.View>
                  <DatePicker.View view="month">
                    <DatePicker.Header />
                    <DatePicker.MonthTable />
                  </DatePicker.View>
                  <DatePicker.View view="year">
                    <DatePicker.Header />
                    <DatePicker.YearTable />
                  </DatePicker.View>
                </DatePicker.Content>
              </DatePicker.Positioner>
            </Portal>
          </DatePicker.Root>
        </div>
        <div className="draw-time-field">
          <label htmlFor="draw-time">{locale === "pt-BR" ? "Horário" : "Time"}</label>
          <Timepicker
            id="draw-time"
            className="draw-time-input"
            aria-label={locale === "pt-BR" ? "Horário" : "Time"}
            placeholder={locale === "pt-BR" ? "Selecione o horário" : "Select time"}
            value={pickerValue}
            required
            options={{
              clock: {
                type: locale === "pt-BR" ? "24h" : "12h",
                autoSwitchToMinutes: true,
              },
              ui: { theme: "m3-green", mode: "compact-wheel", editable: true, cssClass: "somos-timepicker" },
              wheel: {
                placement: "auto"
              },
              labels:
                locale === "pt-BR"
                  ? {
                      clockTitle: "Selecione o horário",
                      keyboardTitle: "Digite o horário",
                      hour: "Hora",
                      minute: "Minuto",
                      ok: "Confirmar",
                      cancel: "Cancelar",
                    }
                  : undefined,
            }}
            onUpdate={(time) => {
              if (!time.hour || !time.minutes) return;
              const selectedHour = Number(time.hour);
              const hour24 =
                locale === "pt-BR"
                  ? selectedHour
                  : (selectedHour % 12) + (time.type === "PM" ? 12 : 0);
              const selectedTime = `${String(hour24).padStart(2, "0")}:${time.minutes.padStart(2, "0")}`;
              onChange(datePart ? `${datePart}T${selectedTime}` : `T${selectedTime}`);
            }}
          />
        </div>
        <input type="hidden" name="drawAt" value={value} />
      </div>
    </ChakraProvider>
  );
}
