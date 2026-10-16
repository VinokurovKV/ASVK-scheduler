import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEvent } from "../../api/events";
import type { Calendar } from "../../types/Event";
import {
  EventFormDialog,
  type EventFormValues,
} from "./EventFormDialog";

interface CreateEventDialogProps {
  open: boolean;
  initialDate: Date;
  calendars: Calendar[];
  onClose: () => void;
}

export const CreateEventDialog = ({
  open,
  initialDate,
  calendars,
  onClose,
}: CreateEventDialogProps) => {
  const queryClient = useQueryClient();

  const start = new Date(initialDate);
  start.setHours(10, 0, 0, 0);

  const end = new Date(initialDate);
  end.setHours(11, 0, 0, 0);

  const createEventMutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      createEvent({
        ...values,
        description: values.description || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["events"],
      });

      onClose();
    },
  });

  return (
    <EventFormDialog
      open={open}
      heading="Новое событие"
      submitLabel="Создать событие"
      pendingLabel="Создание..."
      errorMessage="Не удалось создать событие"
      initialValues={{
        title: "",
        description: "",
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        eventType: "MEETING",
        format: "OFFLINE",
        repeatInterval: "WEEK",
        room: "",
        meetingUrl: "",
        calendarId:
          calendars.find((calendar) => calendar.type === "PERSONAL")?.id,
      }}
      calendarOptions={calendars}
      isPending={createEventMutation.isPending}
      isError={createEventMutation.isError}
      onSubmit={(values) => createEventMutation.mutate(values)}
      onClose={onClose}
    />
  );
};
