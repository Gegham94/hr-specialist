import {BehaviorSubject} from "rxjs";
import {AddedNewVacancyNotification} from "../../interfaces/notifications.interface";

export interface BookedDate{
  date: string;
  bookedHours: string[];
}

export const BookedDates: BookedDate[] = [
  {
    "date": "2023-05-22",
    "bookedHours": [
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
    ]
  },
  {
    "date": "2023-05-23",
    "bookedHours": [
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "13:00",
      "13:30",
      "14:00",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00"
    ]
  },
  {
    "date": "2023-05-24",
    "bookedHours": ["11:00", "14:00", "16:00"]
  },
  {
    "date": "2023-05-25",
    "bookedHours": ["9:00", "13:00", "15:00"]
  }
];

export const NotificationData: BehaviorSubject<AddedNewVacancyNotification> =
  new BehaviorSubject<AddedNewVacancyNotification>({
  count: 1,
  result: [
    {
      createdAt: "2023.05.15",
      info: {
        content: "Создал новую вакансию на позицию...",
      },
      recipientUuid: "xxxxxxxxxxxxxxx",
      type: "job-request",
      updatedAt: new Date("2023.05.17"),
      uuid: "yyyyyyyyyyyyyy",
      viewed: false,
    }
  ],
  unviewedCount: 1,
});
