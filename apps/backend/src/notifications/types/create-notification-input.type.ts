export type CreateNotificationInput = {
    userId: string;
    title: string;
    message: string;
    ticketId?: string;
    projectId?: number;
  };