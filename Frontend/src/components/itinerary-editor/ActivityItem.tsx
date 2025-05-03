import { ItineraryActivity } from "@/types";
import ExpandableText from "../shared/ExpandableText";

interface ActivityItemProps {
  activity: ItineraryActivity;
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <li className="border p-2 rounded bg-gray-50">
      <div className="font-medium text-dm-dark">{activity.title}</div>
      <div className="text-sm text-gray-600">{activity.description}</div>
      <div className="text-sm text-gray-500">Location: {activity.location}</div>
      <div className="mt-2 space-x-2">
        <button className="text-blue-600 hover:underline text-sm">Edit</button>
        <button className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    </li>
  );
};

export default ActivityItem;
