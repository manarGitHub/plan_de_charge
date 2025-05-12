"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useMemo, useState } from "react";
import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import {
  useGetAllAvailabilitiesWithUserQuery,
  useCreateAvailabilityMutation,
  useGetUsersQuery,
  useUpdateAvailabilityMutation,
  useDeleteAvailabilityMutation,
} from "@/state/api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const AvailabilityCalendar = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: availabilities, isLoading, isError ,refetch} =
    useGetAllAvailabilitiesWithUserQuery();
  const [createAvailability ,{ isLoading: isCreating }] = useCreateAvailabilityMutation();
  const [updateAvailability ,{ isLoading: isUpdating  }] = useUpdateAvailabilityMutation();
  const [deleteAvailability, { isLoading: isDeleting }] = useDeleteAvailabilityMutation();

  const [editingAvailabilityId, setEditingAvailabilityId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weekStart, setWeekStart] = useState("");
  const [daysAvailable, setDaysAvailable] = useState<number>(1);
  const [view, setView] = useState<"agenda" | "calendar">("calendar");

  const { data: users, isLoading: usersLoading, isError: error } =
    useGetUsersQuery();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



  const formatWeekHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    };
    
    const startFormatted = date.toLocaleDateString('fr-FR', options);
    const endFormatted = endDate.toLocaleDateString('fr-FR', options);
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const gridData = useMemo(() => {
    if (!availabilities || !users) return [];
  
    // Create a map of user to their weekly availability
    const userWeekMap = new Map<string, Map<string, number>>();
  
    // Initialize all users
    users.forEach(user => {
      userWeekMap.set(user.username, new Map<string, number>());
    });
  
    // Populate with availability data
    availabilities.forEach(availability => {
      const username = availability.user?.username || "Unknown";
      const week = availability.weekStart.split('T')[0];
      const currentMap = userWeekMap.get(username) || new Map<string, number>();
      currentMap.set(week, (currentMap.get(week) || 0) + availability.daysAvailable);
      userWeekMap.set(username, currentMap);
    });
  
    // Get all unique weeks
    const allWeeks = Array.from(
      new Set(availabilities.map(a => a.weekStart.split('T')[0]))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
    // Convert to grid rows
    return Array.from(userWeekMap.entries()).map(([username, weekMap], index) => {
      const row: any = { id: index, username };
      allWeeks.forEach(week => {
        row[week] = weekMap.get(week) || 0;
      });
      return row;
    });
  }, [availabilities, users]);
  
  const columns = useMemo(() => {
    const baseColumns: GridColDef[] = [
      { field: 'username', headerName: 'Utilisateur', flex: 1, minWidth: 150 }
    ];

    if (!availabilities) return baseColumns;

    const allWeeks = Array.from(
      new Set(availabilities.map(a => a.weekStart.split('T')[0]))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Group weeks by year
    const weeksByYear: Record<string, string[]> = {};
    allWeeks.forEach(week => {
      const year = new Date(week).getFullYear().toString();
      if (!weeksByYear[year]) {
        weeksByYear[year] = [];
      }
      weeksByYear[year].push(week);
    });

    // Add week columns
    Object.values(weeksByYear).flat().forEach(week => {
      baseColumns.push({
        field: week,
        headerName: formatWeekHeader(week),
        flex: 1,
        minWidth: 150,
        renderCell: (params: any) => (
          <span>{params.value || 0} </span>
        )
      });
    });

    return baseColumns;
  }, [availabilities]);

  const handleDateClick = (info: any) => {
    resetDialogState();
    setWeekStart(info.dateStr);
    setDialogOpen(true);
  };
  const handleAddAvailability = async () => {
    // Clear previous errors
    setErrorMessage(null);
  
    // Enhanced validation
    if (!selectedUserId && !editingAvailabilityId) {
      setErrorMessage("User is required");
      return;
    }
    if (!weekStart) {
      setErrorMessage("Week start date is required");
      return;
    }
    if (daysAvailable === undefined || daysAvailable < 0 || daysAvailable > 7) {
      setErrorMessage("Days available must be between 0 and 7");
      return;
    }
  
    try {
      if (editingAvailabilityId) {
        await updateAvailability({
          id: editingAvailabilityId,
          daysAvailable,
        }).unwrap();
      } else {
        await createAvailability({
          userId: selectedUserId!,
          weekStart,
          daysAvailable,
        }).unwrap();
      }

      await refetch();
      
      setDialogOpen(false);
      resetDialogState();
    } catch (err) {
      console.error("Failed to save availability:", err);
      setErrorMessage("Failed to save availability");
    }
  };

  const handleDeleteAvailability = async () => {
    setShowDeleteConfirm(false);
    if (!editingAvailabilityId) return;
    
    try {
      await deleteAvailability({id:editingAvailabilityId}).unwrap();
      await refetch();
      setDialogOpen(false);
      resetDialogState();
    } catch (err) {
      console.error("Failed to delete availability:", err);
      setErrorMessage("Failed to delete availability");
    }
  };

const resetDialogState = () => {
  setWeekStart("");
  setDaysAvailable(1);
  setSelectedUser(null);
  setSelectedUserId(null);
  setEditingAvailabilityId(null);
  };

  const events = useMemo(() => {
    return (
      availabilities?.map((a) => {
        const start = new Date(a.weekStart);
        const end = new Date(start);
        end.setDate(start.getDate() + a.daysAvailable);
  
        return {
          id: a.id.toString(),
          title: `${a.user?.username || "Utilisateur"} - ${a.daysAvailable} jour(s)`,
          start: start.toISOString(),
          end: end.toISOString(),
          extendedProps: {
            userName: a.user?.username,
            userId: a.userId, // Use the direct userId from availability
            daysAvailable: a.daysAvailable,
            weekStart: a.weekStart,
          },
        };
      }) || []
    );
  }, [availabilities]);

  const onEventClick = (info: any) => {
    const { event } = info;
    const extendedProps = event.extendedProps;
    
    // Find the corresponding availability
    const availability = availabilities?.find(a => a.id.toString() === event.id);
    if (!availability) return;
  
    // Find the user data
    const user = users?.find(u => u.userId === availability.userId);
    
    setSelectedUser(user?.username || null);
    setSelectedUserId(availability.userId);
    setWeekStart(availability.weekStart);
    setDaysAvailable(availability.daysAvailable);
    setEditingAvailabilityId(availability.id);
    setDialogOpen(true);
    
    info.jsEvent.preventDefault();
  };

  

  if (isLoading || usersLoading) return <div>Chargement...</div>;
  if (isError || error) return <div>Erreur lors du chargement des données.</div>;
  if (!availabilities || !users) return <div>Aucune donnée disponible</div>;

  return (
    <div className="max-w-full p-8">
      <Header name="Calendrier des disponibilités" />
      <div className="mt-4 mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white"}`}
          onClick={() => setView("calendar")}
        >
          Afficher Calendrier
        </button>
        <button
          className={`px-4 py-2 rounded ${view === "agenda" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white"}`}
          onClick={() => setView("agenda")}
        >
          Afficher Agenda
        </button>
      </div>

      <div className="mt-6 rounded-lg bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
        {view === "agenda" ? (
          <div className="h-[600px] w-full bg-white dark:bg-dark-secondary dark:text-white">
            <h2 className="text-lg font-bold mb-4">Agenda mensuel</h2>
            <DataGrid
              rows={gridData}
              columns={columns}
              pageSizeOptions={[10, 20]}
              pagination
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
              disableRowSelectionOnClick
            />
          </div>
        ) : (
          <FullCalendar
            key={availabilities?.length}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridWeek"
            locale={frLocale}
            height="auto"
            events={events}
            eventClick={onEventClick}
            dateClick={handleDateClick}
            
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            buttonText={{
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
            }}
            eventDisplay="block"
          />
        )}
      </div>

      <Transition appear show={dialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-secondary dark:text-white">
  <Dialog.Title as="h3" className="text-lg font-medium leading-6">
    {editingAvailabilityId ? "Modifier disponibilité" : "Ajouter disponibilité"}
  </Dialog.Title>

  {/* Always show user dropdown */}
  <div className="mt-4">
  <label className="block text-sm font-medium">Utilisateur</label>
  {editingAvailabilityId ? (
    // Display read-only user info during edit
    <div className="mt-1 p-2 rounded-md bg-gray-100 dark:bg-gray-700">
      {selectedUser || "Unknown user"}
    </div>
  ) : (
    // Show dropdown only for new entries
    <select
      className="mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:text-white"
      value={selectedUserId || ""}
      onChange={(e) => {
        const userId = parseInt(e.target.value);
        const user = users?.find((u) => u.userId === userId);
        if (user) {
          setSelectedUser(user.username);
          setSelectedUserId(user.userId ?? null);
        }
      }}
      required
    >
      <option value="" disabled>
        -- Sélectionnez un utilisateur --
      </option>
      {users?.map((user) => (
        <option key={user.userId} value={user.userId}>
          {user.username}
        </option>
      ))}
    </select>
  )}
</div>

  <div className="mt-4">
    <label className="block text-sm font-medium">Semaine du: {weekStart}</label>
  </div>

  <div className="mt-4">
    <label className="block text-sm font-medium">Jours disponibles</label>
    <input
      type="number"
      min="0"
      max="7"
      value={daysAvailable}
      onChange={(e) => setDaysAvailable(parseInt(e.target.value))}
      className="mt-1 w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:text-white"
    />
  </div>

  {errorMessage && (
    <div className="mt-2 text-sm text-red-500">{errorMessage}</div>
  )}

  <div className="mt-6 flex gap-4">
  <button
  type="button"
  className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ${
    isDeleting ? 'bg-red-400' : 'bg-red-600'
  }`}
  onClick={() => setShowDeleteConfirm(true)}
  disabled={isDeleting}
>
  Supprimer
</button>
    <button
      type="button"
      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${
        isUpdating || isCreating ? 'bg-blue-400' : 'bg-blue-600'
      }`}
      onClick={handleAddAvailability}
      disabled={isUpdating || isCreating}
    >
      {(isUpdating || isCreating) ? (
        <span>Enregistrement...</span>
      ) : editingAvailabilityId ? (
        "Modifier"
      ) : (
        "Ajouter"
      )}
    </button>
    <button
      type="button"
      className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-400"
      onClick={() => {
        setDialogOpen(false);
        resetDialogState();
      }}
    >
      Annuler
    </button>
  </div>
</Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={showDeleteConfirm} as={Fragment}>
  <Dialog as="div" className="relative z-20" onClose={() => setShowDeleteConfirm(false)}>
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
    </Transition.Child>

    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-secondary dark:text-white">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6">
              Confirmer la suppression
            </Dialog.Title>
            <div className="mt-4">
              <p>Êtes-vous sûr de vouloir supprimer cette disponibilité?</p>
            </div>
            <div className="mt-6 flex gap-4 justify-end">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-400"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={handleDeleteAvailability}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition>
    </div>
  );
};

export default AvailabilityCalendar;