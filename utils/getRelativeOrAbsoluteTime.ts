import dayjs from "dayjs";

export default function getRelativeOrAbsoluteTime(time: dayjs.Dayjs) {
  if (Math.abs(dayjs().diff(time, "hours")) < 48) {
    // @ts-ignore
    return time.from(dayjs());
  }
  return time.format("DD MMM, YYYY");
}
