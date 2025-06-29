import { formatToRelativeDate } from "@/utilities/utils";
import { GeneratedItinerary } from "@/types";
import CustomizableAlertDialog from "../reusable/CustomizableAlertDialog";
import { Button } from "../ui/button";
import Loader from "../shared/Loader";

interface GeneratedItineraryHistoryProps {
  generatedItineraries: GeneratedItinerary[];
  isLoading: boolean;
  onViewEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const GeneratedItineraryHistory = ({
  generatedItineraries,
  isLoading,
  onViewEdit,
  onDelete,
}: GeneratedItineraryHistoryProps) => {
  if (isLoading) {
    return (
      <div className="mt-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-4 custom-scrollbar">
      {generatedItineraries.map((item) => (
        <div
          key={item.itineraryId}
          className="p-4 rounded bg-dm-dark flex flex-col space-y-2"
        >
          {/* Top row: Info + buttons */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            {/* Destination & date */}
            <div>
              <h3 className="text-xl font-bold">{item.destination}</h3>
              <p className="text-md text-dm-light-2 mt-2">
                Created {formatToRelativeDate(item.createdAt)}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewEdit(item.itineraryId)}
                className="px-4 py-1 bg-dm-dark-3 text-white rounded hover:bg-dm-secondary transition"
              >
                View / Edit
              </button>

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

          <div className="absolute left-0 top-0 h-full w-8 z-10 bg-gradient-to-r from-dm-dark to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-8 z-10 bg-gradient-to-l from-dm-dark to-transparent pointer-events-none" />

          <div className="relative w-full h-6 mt-1">
            {/* Fade overlays */}
            <div className="absolute left-0 top-0 h-full w-8 z-10 bg-gradient-to-r from-dm-dark to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-8 z-10 bg-gradient-to-l from-dm-dark to-transparent pointer-events-none" />

            {/* Marquee */}
            <div className="overflow-hidden h-full">
              <div className="marquee-track group">
                <div className="marquee-content group-hover:paused">
                  Activities:
                  <span className="ml-2" />
                  {item.days
                    .flatMap((day) =>
                      day.activities.map((act) => `${act.title}`)
                    )
                    .join(" · ")}
                </div>
                <div className="marquee-content group-hover:paused aria-hidden">
                  Activities:
                  <span className="ml-2" />
                  {item.days
                    .flatMap((day) =>
                      day.activities.map((act) => `${act.title}`)
                    )
                    .join(" · ")}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {generatedItineraries.length === 0 && (
        <p className="text-dm-light-2 text-center mt-12">
          No itineraries yet. Generate one to get started!
        </p>
      )}
    </div>
  );
};

export default GeneratedItineraryHistory;
