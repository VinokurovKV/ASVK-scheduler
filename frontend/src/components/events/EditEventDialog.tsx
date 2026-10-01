import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateEvent } from "../../api/events";
import type { Event } from "../../types/Event";
import {
  EventFormDialog,
  type EventFormValues,
} from "./EventFormDialog";

interface EditEventDialogProps {
  event: Event;
  onClose: () => void;
  onUpdated: (event: Event) => void;
}

export const EditEventDialog = ({
  event,
  onClose,
  onUpdated,
}: EditEventDialogProps) => {
  const queryClient = useQueryClient();

  const updateEventMutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      updateEvent(event.id, {
        ...values,
        description: values.description || null,
      }),
    onSuccess: async (updatedEvent) => {
      await queryClient.invalidateQueries({
        queryKey: ["events"],
      });

      onUpdated(updatedEvent);
    },
  });

  return (
    <EventFormDialog
      open
      heading="Редактирование"
      submitLabel="Сохранить изменения"
      pendingLabel="Сохранение..."
      errorMessage="Не удалось сохранить изменения"
      initialValues={{
        title: event.title,
        description: event.description ?? "",
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        format: event.format,
        repeatInterval: event.repeatInterval,
        room: event.room ?? "",
        meetingUrl: event.meetingUrl ?? "",
      }}
      isPending={updateEventMutation.isPending}
      isError={updateEventMutation.isError}
      onSubmit={(values) => updateEventMutation.mutate(values)}
      onClose={onClose}
    />
  );
};
