import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type ValidApplications = {
  [key: string]: string[]; // Key is a string (pole name), value is an array of applications
};

export interface Project {
  id: number;
  name: string;
  description?: string;
  pole?: string;
  site?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "Élevé",
  Medium = "Moyen",
  Low = "Faible",
  Backlog = "En attente",
}

export enum Status {
  ToDo = "Brouillon",
  WorkInProgress = "En cours",
  UnderReview = "Terminé",
  Completed = "Annulé",
}

export interface User {
  userId?: number;
  username: string;
  profile: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
}

export interface UserWithDevis {
  id: number | undefined;
  userId: number;
  devisId: string;
  user: User;
}

export interface Devis {
  id: string;
  numero_dac?: string;
  libelle?: string;
  version?: number;
  date_emission?: string; 
  pole?: string;
  application?: string;
  date_debut?: string; 
  date_fin?: string; 
  charge_hj?: number;
  montant?: number;
  statut?: string;
  statut_realisation?: string;
  jour_homme_consomme?: number;
  ecart?: number;
  hommeJourActive?: boolean;
  users: UserWithDevis[];  // Adjusted to match the API response
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  workingDays?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
  devisId?: string;

  author?: User;
  assignee?: User;
  devis?: Devis;
  comments?: Comment[];
  attachments?: Attachment[];
}
export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}
export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

export interface Availability {
  id: number;
  userId: number;
  weekStart: string;
  daysAvailable: number;
  user?: User;
}

export interface MonthlyProductionRate {
  userId: string;
  month: string;
  availableDays: number;
  workingDays: number;
  productionRate: number;
  user: {
    userId: number;
    username: string;
    profile?: string;
  };
  createdAt:string;  
  updatedAt:string;    
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "Devis","MonthlyProductionRates"],
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    updateTask: build.mutation<Task, { taskId: number; data: Partial<Task> }>({
      query: ({ taskId, data }) => ({
        url: `tasks/${taskId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    deleteTask: build.mutation<void, { taskId: number }>({
      query: ({ taskId }) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getAllDevis: build.query<Devis[], void>({
      query: () => 'devis',
      providesTags: ['Devis'],
    }),
    getDevisById: build.query<Devis, { id: string }>({
      query: ({ id }) => `devis/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Devis', id }],
    }),
    createDevis: build.mutation<Devis, Partial<Devis>>({
      query: (newDevis) => ({
        url: 'devis',
        method: 'POST',
        body: newDevis,
      }),
      invalidatesTags: ['Devis'],
    }),
    updateDevis: build.mutation<Devis, { id: string; data: Partial<Devis> }>({
      query: ({ id, data }) => ({
        url: `devis/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Devis', id }],
    }),
    deleteDevis: build.mutation<void, { devisId: string }>({
      query: ({ devisId }) => ({
        url: `devis/${devisId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { devisId }) => [
        { type: "Devis", id: devisId },
      ],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
    getAllAvailabilitiesWithUser: build.query<Availability[], void>({
      query: () => "availabilities",
      providesTags: ["Users"],
    }),
    getAvailabilitiesByUser: build.query<Availability[], number>({
      query: (userId) => `availabilities/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Users", id }))
          : [{ type: "Users", id: userId }],
    }),
    
    createAvailability: build.mutation<Availability, Partial<Availability>>({
      query: (data) => ({
        url: "availabilities",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
   updateAvailability: build.mutation<Availability, {id: number; daysAvailable: number;}>({
  query: ({ id, ...body }) => ({
    url: `availabilities/${id}`,  // Note the id in the URL
    method: 'PUT',
    body,  
  }),
}),
    
    deleteAvailability: build.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `availabilities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Users", id }],
    }),
    getMonthlyRates: build.query<MonthlyProductionRate[], void>({
      query: () => 'production-rates',
      providesTags: ['MonthlyProductionRates'],
    }),
    updateMonthlyRates: build.mutation<MonthlyProductionRate[], { year: number }>({
      query: (body) => ({
        url: 'production-rates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MonthlyProductionRates'],
    }),
    
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetAllDevisQuery,
  useGetDevisByIdQuery,
  useCreateDevisMutation,
  useUpdateDevisMutation,
  useDeleteDevisMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAllAvailabilitiesWithUserQuery,
  useGetAvailabilitiesByUserQuery,
  useCreateAvailabilityMutation,
  useUpdateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useGetMonthlyRatesQuery, 
  useUpdateMonthlyRatesMutation
} = api;
