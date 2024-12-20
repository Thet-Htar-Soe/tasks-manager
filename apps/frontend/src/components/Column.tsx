import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { TaskCard as ColumnType, TaskList } from "./types";
import { DeleteIcon, EditIcon } from "./Icons";
import axios from "axios";
import { useAtom } from "jotai";
import { atom } from "jotai";

// Jotai Atoms to manage state
const isModalOpenAtom = atom(false);
const taskDescriptionAtom = atom("");
const taskCardIdAtom = atom<number | null>(null);
const isEditModeAtom = atom(false); // New atom for managing edit mode
const editableTaskCardNameAtom = atom("");

type ColumnProps = {
  column: ColumnType;
  tasks: TaskList[];
  addLocalTasks: (updatedTask: TaskList) => void;
  deleteLocalTask: (taskId: number) => void;
  updateLocalTasks: (updatedTask: TaskList) => void;
  deleteLocalColumn: (taskId: number) => void;
  updateLocalColumns: (updatedTask: ColumnType) => void;
};

export function Column({
  column,
  tasks,
  addLocalTasks,
  deleteLocalTask,
  deleteLocalColumn,
  updateLocalTasks,
  updateLocalColumns,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  // Accessing state from atoms
  const [isModalOpen, setIsModalOpen] = useAtom(isModalOpenAtom);
  const [description, setDescription] = useAtom(taskDescriptionAtom);
  const [taskCardId, setTaskCardId] = useAtom(taskCardIdAtom);
  const [isEditMode, setIsEditMode] = useAtom(isEditModeAtom);
  const [editableTaskCardName, setEditableTaskCardName] = useAtom(editableTaskCardNameAtom);

  //Open modal for adding a new task
  const handleAddNewTaskClick = (id: number) => {
    setTaskCardId(id);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  //Open modal for editing task card name
  const handleEditClick = (id: number) => {
    setTaskCardId(id);
    setEditableTaskCardName(column.name);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  //Close modal and reset form data
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDescription("");
    setEditableTaskCardName("");
  };

  // Form submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!taskCardId) {
      console.error("Task card ID is not set.");
      return;
    }
    const newTask = {
      id: Date.now(),
      description,
      taskCardId,
    };

    try {
      if (isEditMode) {
        // If in edit mode, update task card name
        const response = await axios.put(`http://localhost:4000/task-card/${taskCardId}`, {
          name: editableTaskCardName,
        });
        console.log("Task card updated:", response.data);
        updateLocalColumns(response.data);
      } else {
        // create a new task
        const response = await axios.post("http://localhost:4000/task-list", {
          description,
          taskCardId,
        });
        console.log("Task created:", response.data);
        const updatedTask = { ...newTask, id: response.data.id };
        addLocalTasks(updatedTask);
      }

      handleCloseModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      deleteLocalTask(newTask.id);
    }
  };

  const handleDeleteClick = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this card? ***If you delete this card, all task lists associated with it will also be deleted."
    );
    deleteLocalColumn(id);
    if (!confirmed) return;

    try {
      const response = await axios.delete(`http://localhost:4000/task-card/${id}`);
      console.log(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <div className="flex w-80 flex-col rounded-lg bg-amber-400 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl text-neutral-100">{column.name}</h2>
        <div className="flex items-center gap-3">
          <span onClick={() => handleEditClick(column.id)}>
            <EditIcon />
          </span>
          <span onClick={() => handleDeleteClick(column.id)}>
            <DeleteIcon />
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-4">
        {tasks.map((task) => {
          return (
            <TaskCard key={task.id} task={task} updateLocalTasks={updateLocalTasks} deleteLocalTask={deleteLocalTask} />
          );
        })}
        <p
          className="pt-3 border-t-2 border-amber-700 cursor-pointer text-white font-bold text-sm"
          onClick={() => handleAddNewTaskClick(column.id)}
        >
          Add New Task +
        </p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-1/3">
            <h2 className="text-lg font-bold mb-4">{isEditMode ? "Edit Task Card Name" : "Add New Task"}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor={isEditMode ? "taskCardName" : "description"}
                >
                  {isEditMode ? "Task Card Name" : "Task Description"}
                </label>
                <input
                  id={isEditMode ? "taskCardName" : "description"}
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={isEditMode ? editableTaskCardName : description}
                  onChange={(e) =>
                    isEditMode ? setEditableTaskCardName(e.target.value) : setDescription(e.target.value)
                  }
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-300 text-white font-bold py-2 px-4 rounded hover:bg-amber-400 transition duration-200"
                >
                  {isEditMode ? "Save Changes" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
