"use client";

import { useEffect } from "react";
import type { TaskList, TaskCard as ColumnType } from "./types";
import { Column } from "./Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { atom, useAtom } from "jotai";
import axios from "axios";
import { getUserIdAtom } from "@/app/atoms/userIdAtom";
import { useRouter } from "next/navigation";

// Jotai atoms
const isModalOpenAtom = atom(false);
const taskNameAtom = atom("");
const columnsAtom = atom<ColumnType[]>([]);
const columnsLoadingAtom = atom<boolean>(false);
const columnsErrorAtom = atom<string | null>(null);
const tasksAtom = atom<TaskList[]>([]);

//fetch columns
const fetchColumns = async (userId: number) => {
  const response = await axios.get(`http://localhost:4000/task-card/${userId}`);
  return response.data.map((card: { id: number; name: string }) => ({
    id: card.id,
    name: card.name,
  }));
};

//fetch tasks
const fetchTasks = async () => {
  const response = await axios.get<TaskList[]>("http://localhost:4000/task-lists");
  return response.data;
};

//Atom for triggering column fetch
const fetchColumnsAtom = atom(null, async (get, set, userId: number) => {
  set(columnsLoadingAtom, true);
  set(columnsErrorAtom, null);
  try {
    const columns = await fetchColumns(userId);
    set(columnsAtom, columns);
    console.log("this is columns", columns);
  } catch (error) {
    set(columnsErrorAtom, error instanceof Error ? error.message : "Unknown error");
  } finally {
    set(columnsLoadingAtom, false);
  }
});

// Atom to fetch tasks and set state
const fetchTasksAtom = atom(null, async (get, set) => {
  set(columnsLoadingAtom, true);
  set(columnsErrorAtom, null);
  try {
    const tasks = await fetchTasks();
    set(tasksAtom, tasks);
  } catch (error) {
    set(columnsErrorAtom, error instanceof Error ? error.message : "Unknown error");
  } finally {
    set(columnsLoadingAtom, false);
  }
});

export default function TaskBoard() {
  const [isModalOpen, setIsModalOpen] = useAtom(isModalOpenAtom);
  const [taskName, setTaskName] = useAtom(taskNameAtom);
  const [userId, setUserId] = useAtom(getUserIdAtom);
  const [getUserId, setUserIdAtom] = useAtom(getUserIdAtom);
  const [columns, setColumns] = useAtom(columnsAtom);
  const [loading, setLoading] = useAtom(columnsLoadingAtom);
  const [error, setError] = useAtom(columnsErrorAtom);
  const [, fetchColumns] = useAtom(fetchColumnsAtom);
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);

  const router = useRouter();
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!getUserId && !storedUserId) {
      router.push("/login");
    } else {
      if (!getUserId && storedUserId) {
        setUserIdAtom(parseInt(storedUserId));
      }
    }
    console.log("this is userId", getUserId);
  }, [getUserId, router, setUserIdAtom]);

  useEffect(() => {
    if (userId !== null) {
      fetchColumns(userId);
    }
    fetchTasks();
  }, [userId, fetchColumns, fetchTasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<TaskList[]>("http://localhost:4000/task-lists");
        setTasks(response.data);
        console.log("this is response datas", response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchTasks();
  }, [setLoading, setError, setTasks]);

  if (loading) return <p>Loading columns...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleAddNewCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskName("");
    setUserId(userId);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:4000/task-card", {
        name: taskName,
        userId,
      });
      console.log("Task card created:", response.data);
      const newTask = response.data;
      setTasks((prevTasks) => [...prevTasks, newTask]);
      addLocalColumns(newTask);
      handleCloseModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating task card:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as TaskList["taskCardId"];
    const newColumnId = over.id as number;
    const originalColumnId = active.data?.current?.taskCardId as string;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              taskCardId: newStatus,
            }
          : task
      )
    );
    try {
      if (over) {
        const response = await axios.put(`http://localhost:4000/task-list/position/${taskId}`, {
          taskCardId: newColumnId,
        });
        console.log("Task position updated:", response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    console.log(`Task with ID ${taskId} was moved from ${originalColumnId} to ${newColumnId}`);
  }

  const addLocalTasks = (updatedTask: TaskList) => {
    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((task) => task.id === updatedTask.id);
      if (taskIndex !== -1) {
        // Update existing task
        const newTasks = [...prevTasks];
        newTasks[taskIndex] = updatedTask;
        return newTasks;
      }
      // Add new task
      return [...prevTasks, updatedTask];
    });
  };

  const addLocalColumns = (updatedColumn: ColumnType) => {
    setColumns((prevTasks) => {
      const taskIndex = prevTasks.findIndex((task) => task.id === updatedColumn.id);
      if (taskIndex !== -1) {
        const newTasks = [...prevTasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], name: updatedColumn.name };
        return newTasks;
      }
      return [...prevTasks, updatedColumn];
    });
  };

  const updateLocalTasks = (updatedTask: TaskList) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const updateLocalColumns = (updatedTask: ColumnType) => {
    setColumns((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const deleteLocalTask = (taskId: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const deleteLocalColumn = (taskId: number) => {
    setColumns((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className={`flex min-h-[calc(100vh-104px)] bg-black ${userId ? "" : "pt-[104px]"}`}>
      <div className="w-1/4 px-20 border-t-2 border-e-2 border-amber-300">
        <div className="pt-3">
          <h2 className="text-amber-300 text-lg text-center font-bold pb-5 border-b-2 border-amber-300">
            Your Task Board
          </h2>
          {columns && (
            <ul className="space-y-4 mt-4">
              {columns.map((column, index) => (
                <li
                  key={index}
                  className="text-amber-300 flex items-center justify-center border-b-2 pb-4 border-amber-300"
                >
                  {column.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="w-3/4 pe-24 border-t-2 border-amber-300">
        <div className="flex justify-end items-center pt-5">
          <button
            className="bg-amber-300 text-white font-bold py-2 px-4 rounded hover:bg-amber-400 transition duration-200"
            onClick={handleAddNewCardClick}
          >
            Add New Card +
          </button>
        </div>
        {columns.length === 0 ? (
          <div className="text-center pt-40 px-5">
            <p className="text-amber-400 font-extrabold text-4xl italic">
              Looks like you don&apos;t have any task cards yet! Start your journey by adding your first card!
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 p-8">
            <DndContext onDragEnd={handleDragEnd}>
              {columns.map((column) => {
                return (
                  <div key={column.id} className="w-80">
                    <Column
                      key={column.id}
                      column={column}
                      tasks={tasks.filter((task) => task.taskCardId === column.id)}
                      addLocalTasks={addLocalTasks}
                      deleteLocalTask={deleteLocalTask}
                      deleteLocalColumn={deleteLocalColumn}
                      updateLocalTasks={updateLocalTasks}
                      updateLocalColumns={updateLocalColumns}
                    />
                  </div>
                );
              })}
            </DndContext>
          </div>
        )}
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-1/3">
            <h2 className="text-lg font-bold mb-4">Create New Task Card</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                  Task Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
