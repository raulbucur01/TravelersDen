import { DatePickerWithRange } from "@/components/shared/DatePickerWithRange";
import React from "react";

const AllUsers = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Select a Date Range</h1>
      <DatePickerWithRange className="mt-4" />
    </div>
  );
};

export default AllUsers;
