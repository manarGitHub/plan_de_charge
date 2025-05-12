import { useDeleteTaskMutation, useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import ModalNewTask from "@/components/ModalNewTask"; // import the ModalNewTask component
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

type BoardProps = {
  id: string;
};

const taskStatus = ["Brouillon", "En cours", "Terminé", "Annulé"];

const BoardView = ({ id }: { id: string }) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({ projectId: Number(id) });
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState<TaskType | null>(null);

  const openEditModal = (task: TaskType) => {
    setTaskToUpdate(task);
    setIsModalEditOpen(true);
  };

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
 

};

const TaskColumn = ({
  status,
  tasks,
 
}: TaskColumnProps) => {
 

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    "Brouillon": "#2563EB",
    "En cours": "#059669",
    "Terminé": "#D97706",
    Annulé: "#000000",
  };

  return (
    <div
      
      className={`sl:py-4 rounded-lg py-2 xl:px-2 `}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            
            
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task}  />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;

};

const Task = ({ task }: TaskProps) => {
  

 
  
  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700"
          : priority === "Élevé"
            ? "bg-yellow-200 text-yellow-700"
            : priority === "Moyen"
              ? "bg-green-200 text-green-700"
              : priority === "Faible"
                ? "bg-blue-200 text-blue-700"
                : "bg-gray-200 text-gray-700"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
  
  className={`mb-6 rounded-lg bg-white shadow-lg dark:bg-dark-secondary transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105`}
>
  {task.attachments && task.attachments.length > 0 && (
    <Image
      src={`/${task.attachments[0].fileURL}`}
      alt={task.attachments[0].fileName}
      width={420}
      height={220}
      className="h-auto w-full rounded-t-lg object-cover transition-transform duration-200 ease-in-out hover:scale-105"
    />
  )}

  <div className="p-5 md:p-7">
    <div className="flex items-start justify-between mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {task.priority && <PriorityTag priority={task.priority} />}
        <div className="flex gap-3">
          {taskTagsSplit.map((tag) => (
            <div
              key={tag}
              className="rounded-full bg-blue-200 px-3 py-1 text-xs text-blue-800 font-medium hover:bg-blue-300"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
     
          
    </div>

    <div className="my-4 flex justify-between items-center">
      <h4 className="text-lg font-semibold dark:text-white">
        {task.title}
        {task.devis && task.devis.numero_dac ? ` : ${task.devis.numero_dac}` : ""}
      </h4>
      {typeof task.workingDays === "number" && (
        <div className="text-sm font-semibold dark:text-white">
          {task.workingDays} jours
        </div>
      )}
    </div>

    <div className="text-xs text-gray-600 dark:text-neutral-400">
      {formattedStartDate && <span>{formattedStartDate} - </span>}
      {formattedDueDate && <span>{formattedDueDate}</span>}
    </div>
    <p className="mt-2 text-sm text-gray-700 dark:text-neutral-300">
      {task.description}
    </p>

    <div className="mt-5 border-t border-gray-300 dark:border-stroke-dark" />

    <div className="mt-4 flex items-center justify-between">
      <div className="flex -space-x-2 overflow-hidden">
        {task.assignee && (
          <Image
            key={task.assignee.userId}
            src={`/${task.assignee.profilePictureUrl!}`}
            alt={task.assignee.username}
            width={32}
            height={32}
            className="h-9 w-9 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
          />
        )}
        {task.author && (
          <Image
            key={task.author.userId}
            src={`/${task.author.profilePictureUrl!}`}
            alt={task.author.username}
            width={32}
            height={32}
            className="h-9 w-9 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
          />
        )}
      </div>
      <div className="flex items-center text-gray-600 dark:text-neutral-400">
        <MessageSquareMore size={20} />
        <span className="ml-2 text-sm">{numberOfComments}</span>
      </div>
    </div>
  </div>
</div>

  );
};

export default BoardView;