import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type Props = {
  id: string;
};

type TaskTypeItems = "task" | "milestone" | "project";
const Timeline = ({ id }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "fr-TN",
  });

  const ganttTasks = useMemo(() => {
    return (
      tasks?.map((task) => ({
        start: new Date(task.startDate as string),
        end: new Date(task.dueDate as string),
        name: task.devis?.numero_dac as string,
        id: `Task-${task.id}`,
        type: "task" as TaskTypeItems,
        progress: task.workingDays ? (task.workingDays / 10) * 100 : 0,
        isDisabled: false,
      })) || []
    );
  }, [tasks]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  // Create a custom header component with the required props
  const CustomTaskListHeader: React.FC<{
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    isDarkMode: boolean;  // Paramètre ajouté pour gérer le mode sombre
  }> = ({ headerHeight, rowWidth, fontFamily, fontSize, isDarkMode }) => {
    return (
      <div
        className="gantt-task-header"
        style={{
          height: headerHeight,
          fontFamily: fontFamily,
          fontSize: fontSize,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly', // Espacement égal entre les colonnes
          alignItems: 'center', // Alignement vertical au centre
          backgroundColor: isDarkMode ? '#2e2e2e' : '#f4f6f9', // Changer la couleur de fond pour le dark mode
          borderBottom: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0', // Changer la bordure pour le dark mode
        }}
      >
        <div
          style={{
            width: rowWidth,
            textAlign: 'center', // Alignement horizontal des textes au centre
            fontWeight: 'bold', // Gras pour rendre les en-têtes plus visibles
            padding: '0 10px',
            color: isDarkMode ? '#ffffff' : '#000000', // Couleur du texte en fonction du mode
          }}
        >
          Nom de la tâche
        </div>
        <div
          style={{
            width: rowWidth,
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '0 10px',
            color: isDarkMode ? '#ffffff' : '#000000',
          }}
        >
          Date de début
        </div>
        <div
          style={{
            width: rowWidth,
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '0 10px',
            color: isDarkMode ? '#ffffff' : '#000000',
          }}
        >
          Date de fin
        </div>
      </div>
    );
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error || !tasks) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="px-4 xl:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 py-5">
        <h1 className="me-2 text-lg font-bold dark:text-white">
          Calendrier des tâches du projet
        </h1>
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Jour</option>
            <option value={ViewMode.Week}>Semaine</option>
            <option value={ViewMode.Month}>Mois</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline gantt-table overflow-x-auto">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            locale="fr-TN"
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="150px"
            barBackgroundColor={isDarkMode ? "#101214" : "#aeb8c2"}
            barBackgroundSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
            TaskListHeader={(props) => (
              <CustomTaskListHeader
                {...props}
                isDarkMode={isDarkMode} // Passez la propriété isDarkMode
              />
            )} // Pass the custom header component
          />
        </div>
        <div className="px-4 pb-5 pt-1">
       
        </div>
      </div>
    </div>
  );
};

export default Timeline;
