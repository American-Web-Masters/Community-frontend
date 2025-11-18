export function localInputToUTC(localString) {
    // localString example: "2025-11-17T22:15"
    const [datePart, timePart] = localString.split("T");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Create a date in LOCAL time (not UTC)
    const localDate = new Date(year, month - 1, day, hour, minute);

    return localDate.toISOString(); // auto converts to UTC
}
