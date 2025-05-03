import { formatToRelativeDate } from "@/lib/utils";
import { GeneratedItinerary } from "@/types";
import CustomizableAlertDialog from "../shared/CustomizableAlertDialog";
import { Button } from "../ui/button";

interface GeneratedItineraryHistoryProps {
  generatedItineraries: GeneratedItinerary[];
  onViewEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const GeneratedItineraryHistory = ({
  generatedItineraries,
  onViewEdit,
  onDelete,
}: GeneratedItineraryHistoryProps) => {
  return (
    <div className="max-h-96 overflow-y-auto space-y-4">
      {generatedItineraries.map((item) => (
        <div
          key={item.itineraryId}
          className="border p-4 rounded shadow flex flex-col md:flex-row md:justify-between md:items-center"
        >
          <div>
            <h3 className="text-xl font-bold">{item.destination}</h3>
            <p className="text-sm text-gray-500">
              Created: {formatToRelativeDate(item.createdAt)}
            </p>
            <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
              {item.days.slice(0, 1).map((day) => (
                <li key={day.day}>
                  Day {day.day}:{" "}
                  {day.activities.map((act) => act.title).join(", ")}
                  {item.days.length > 1 ? " ..." : ""}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            {/* View / Edit button */}
            <button
              onClick={() => onViewEdit(item.itineraryId)}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              View / Edit
            </button>

            {/* Delete button */}
            <CustomizableAlertDialog
              trigger={
                <Button className="bg-transparent hover:bg-transparent">
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              }
              title="Delete Itinerary"
              description="Are you sure you want to delete this generated itinerary? This action cannot be undone."
              cancelText="Cancel"
              actionText="Delete"
              onConfirm={() => onDelete(item.itineraryId)}
            />
          </div>
        </div>
      ))}
      {generatedItineraries.length === 0 && (
        <p className="text-gray-500 text-center">
          No itineraries yet. Generate one to get started!
        </p>
      )}
    </div>
  );
};

export default GeneratedItineraryHistory;
