import { ItineraryDay } from "@/types";
import ActivityItem from "./ActivityItem";

interface DaySectionProps {
  day: ItineraryDay;
}

const DaySection = ({ day }: DaySectionProps) => {
  return (
    <div className="rounded p-4 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-2">Day {day.day}</h2>
      <ul className="space-y-2">
        {day.activities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </ul>
      <div className="mt-3 space-x-2">
        <button className="text-green-600 hover:underline text-sm">
          Add Activity
        </button>
        <button className="text-blue-600 hover:underline text-sm">
          Regenerate Day
        </button>
      </div>
    </div>
  );
};

export default DaySection;
