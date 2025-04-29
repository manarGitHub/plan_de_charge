import Modal from "@/components/modal";
import { Priority, Status, Task, useCreateTaskMutation, useUpdateTaskMutation } from "@/state/api";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
  taskData?: Task | null; // Add taskData prop for editing
};

const ModalNewTask = ({ isOpen, onClose, id = null, taskData = null }: Props) => {
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workingdays, setWorkingDays] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [devisId, setDevisId] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  // If taskData is provided (edit mode), populate the fields
  useEffect(() => {
    if (taskData) {
      setTitle(taskData.title);
      setDescription(taskData.description || "");   
     setWorkingDays(String(taskData.workingDays));
      setStatus(taskData.status || Status.ToDo);
      setPriority(taskData.priority || Priority.Backlog);
      setTags(taskData.tags || "");
      setStartDate(taskData.startDate ? taskData.startDate : "");
      setDueDate(taskData.dueDate ? taskData.dueDate : "");
      setAuthorUserId(String(taskData.authorUserId));
      setAssignedUserId(String(taskData.assignedUserId));
      setDevisId(taskData.devisId || "");
      setProjectId(String(taskData.projectId));
    }
  }, [taskData]);

  const handleSubmit = async () => {
    if (!title || !authorUserId || !(id !== null || projectId)) return;

    const formattedStartDate = startDate
      ? formatISO(new Date(startDate), { representation: "complete" })
      : undefined;

    const formattedDueDate = dueDate
      ? formatISO(new Date(dueDate), { representation: "complete" })
      : undefined;

    try {
      if (taskData) {
        // Update task if taskData exists
        await updateTask({
          taskId: taskData.id, // Assume taskData has the id
          data: {
            title,
            description,
            workingDays: parseInt(workingdays),
            status,
            priority,
            tags,
            startDate: formattedStartDate,
            dueDate: formattedDueDate,
            authorUserId: parseInt(authorUserId),
            assignedUserId: parseInt(assignedUserId),
            devisId: devisId.toString(),
            projectId: id !== null ? Number(id) : Number(projectId),
          },
        });
      } else {
        // Create new task if taskData is null
        await createTask({
          title,
          description,
          workingDays: parseInt(workingdays),
          status,
          priority,
          tags,
          startDate: formattedStartDate,
          dueDate: formattedDueDate,
          authorUserId: parseInt(authorUserId),
          assignedUserId: parseInt(assignedUserId),
          devisId: devisId.toString(),
          projectId: id !== null ? Number(id) : Number(projectId),
        });
      }

      // Clear form
      setTitle("");
      setDescription("");
      setWorkingDays("");
      setStatus(Status.ToDo);
      setPriority(Priority.Backlog);
      setTags("");
      setStartDate("");
      setDueDate("");
      setAuthorUserId("");
      setAssignedUserId("");
      setDevisId("");
      setProjectId("");

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const isFormValid = () => {
    return title.trim() !== "" && authorUserId && (id !== null || projectId.trim() !== "");
  };

  const selectStyles =
    "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name={taskData ? "Mise à jour de la tâche" : "Créer une nouvelle tâche"}>
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className={inputStyles}
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={inputStyles}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          className={inputStyles}
          placeholder="Jours ouvrées"
          value={workingdays}
          onChange={(e) => setWorkingDays(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <option value={Status.ToDo}>Brouillon</option>
            <option value={Status.WorkInProgress}>En cours</option>
            <option value={Status.UnderReview}>Terminé</option>
            <option value={Status.Completed}>Annulé</option>
          </select>
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>Élevé</option>
            <option value={Priority.Medium}>Moyen</option>
            <option value={Priority.Low}>Faible</option>
            <option value={Priority.Backlog}>En attente</option>
          </select>
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="Tags (séparés par des virgules)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className={inputStyles}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="ID de l'auteur"
          value={authorUserId}
          onChange={(e) => setAuthorUserId(e.target.value)}
        />
        <input
          type="text"
          className={inputStyles}
          placeholder="ID de l'utilisateur assigné"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
        />
        <input
          type="text"
          className={inputStyles}
          placeholder="Devis ID"
          value={devisId}
          onChange={(e) => setDevisId(e.target.value)}
        />
        {id === null && (
          <input
            type="text"
            className={inputStyles}
            placeholder="ID application"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        )}
        <button
          type="submit"
          title={!isFormValid() ? "Veuillez remplir le titre et le project ID" : ""}
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isCreating || isUpdating ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isCreating || isUpdating}
        >
          {isCreating || isUpdating ? (taskData ? "Updating..." : "Creating...") : taskData ? "Modifier" : "Créer"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
