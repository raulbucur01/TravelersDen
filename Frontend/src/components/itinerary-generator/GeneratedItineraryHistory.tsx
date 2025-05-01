type Activity = {
  title: string;
};

type Day = {
  day: number;
  activities: Activity[];
};

type Itinerary = {
  id: string;
  destination: string;
  days: Day[];
  createdAt: string;
};

interface GeneratedItineraryHistory {
  history: Itinerary[];
  onViewEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const GeneratedItineraryHistory = ({
  history,
  onViewEdit,
  onDelete,
}: GeneratedItineraryHistory) => {
  return (
    <div className="max-h-96 overflow-y-auto space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="border p-4 rounded shadow flex flex-col md:flex-row md:justify-between md:items-center"
        >
          <div>
            <h3 className="text-xl font-bold">{item.destination}</h3>
            <p className="text-sm text-gray-500">Created: {item.createdAt}</p>
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
            <button
              onClick={() => onViewEdit(item.id)}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              View / Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {history.length === 0 && (
        <p className="text-gray-500 text-center">
          No itineraries yet. Generate one to get started!
        </p>
      )}
    </div>
  );
};

export default GeneratedItineraryHistory;
