export const workdayStartHour = "10:00";
export const workDayEndHour = "19:00";
export const interviewPeriod = 30; // Assuming each interview lasts for 30 minutes

export function GetInterviewCounts(): number {
  const startTimeParts = workdayStartHour.split(":");
  const endTimeParts = workDayEndHour.split(":");

  const startHour = parseInt(startTimeParts[0], 10);
  const startMinute = parseInt(startTimeParts[1], 10);

  const endHour = parseInt(endTimeParts[0], 10);
  const endMinute = parseInt(endTimeParts[1], 10);

  const totalMinutes = (endHour - startHour) * 60 + (endMinute - startMinute);
  return Math.floor(totalMinutes / interviewPeriod);
}

export function GetInterviewHours(): string[] {
  const startTimeParts = workdayStartHour.split(":");
  const endTimeParts = workDayEndHour.split(":");

  const startHour = parseInt(startTimeParts[0], 10);
  const startMinute = parseInt(startTimeParts[1], 10);

  const endHour = parseInt(endTimeParts[0], 10);
  const endMinute = parseInt(endTimeParts[1], 10);

  const interviewHours: string[] = [];

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    const formattedHour = currentHour.toString().padStart(2, "0");
    const formattedMinute = currentMinute.toString().padStart(2, "0");
    const interviewHour = `${formattedHour}:${formattedMinute}`;
    interviewHours.push(interviewHour);

    // Increment the current time by the interview period
    currentMinute += interviewPeriod;
    if (currentMinute >= 60) {
      currentHour++;
      currentMinute -= 60;
    }
  }

  return interviewHours;
}
