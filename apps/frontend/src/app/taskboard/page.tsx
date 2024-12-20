import React from "react";
import TaskBoard from "../../components/TaskBoard";
import Navbar from "@/components/Navbar";

export default function taskboard() {
  return (
    <div>
      <Navbar />
      <TaskBoard />
    </div>
  );
}
