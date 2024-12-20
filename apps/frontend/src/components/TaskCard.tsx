import { useDraggable } from "@dnd-kit/core";
import { TaskList } from "./types";
import { DeleteListIcon, EditListIcon } from "./Icons";
import { useAtom } from "jotai";
import { atom } from "jotai";
import axios from "axios";

//Jotai Atoms
const isModalOpenAtom = atom(false);
const editableTaskDescriptionAtom = atom("");
const taskListIdAtom = atom<number | null>(null);
const isEditModeAtom = atom(false);

type TaskCardProps = {
  task: TaskList;
  updateLocalTasks: (updatedTask: TaskList) => void;
  deleteLocalTask: (taskId: number) => void;
};

export function TaskCard({ task, updateLocalTasks, deleteLocalTask }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  const [isModalOpen, setIsModalOpen] = useAtom(isModalOpenAtom);
  const [editableTaskDescription, setEditableTaskDescription] = useAtom(editableTaskDescriptionAtom);
  const [taskListId, setTaskListId] = useAtom(taskListIdAtom);
  const [isEditMode, setIsEditMode] = useAtom(isEditModeAtom);

  //Open modal for editing task list description
  const handleEditClick = (id: number) => {
    setTaskListId(id);
    setEditableTaskDescription(task.description);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  //Handle Delete task list
  const handleDeleteClick = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this task list?");

    if (!confirmed) return;
    deleteLocalTask(id);

    try {
      const response = await axios.delete(`http://localhost:4000/task-list/${id}`);
      console.log(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditableTaskDescription("");
  };

  //Handle update task list description
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!taskListId) {
      console.error("Task list ID is not set.");
      return;
    }

    const updatedTask = { ...task, description: editableTaskDescription };
    updateLocalTasks(updatedTask);

    try {
      if (isEditMode) {
        // update the task description APi
        const response = await axios.put(`http://localhost:4000/task-list/${taskListId}`, {
          description: editableTaskDescription,
        });
        console.log("Task description updated:", response.data);
      }

      handleCloseModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="cursor-grab rounded-lg bg-white p-4 shadow-sm hover:shadow-md"
        style={style}
      >
        <h3 className="font-medium text-amber-700">{task.description}</h3>
        <div className="flex justify-end gap-3 pt-3">
          <div className="w-8 z-999 cursor-pointer" onDoubleClick={() => handleEditClick(task.id)}>
            <EditListIcon />
          </div>
          <div className="w-8 z-999 cursor-pointer" onDoubleClick={() => handleDeleteClick(task.id)}>
            <DeleteListIcon />
          </div>
        </div>
      </div>
      {/* Modal for editing task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-999">
          <div className="bg-white p-6 rounded shadow-md w-1/3">
            <h2 className="text-lg font-bold mb-4">{isEditMode ? "Edit Task Description" : "Add New Task"}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                  Task Description
                </label>
                <input
                  id="description"
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editableTaskDescription}
                  onChange={(e) => setEditableTaskDescription(e.target.value)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
