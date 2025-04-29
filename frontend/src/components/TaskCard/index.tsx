import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Flag, Tag ,TimerIcon } from "lucide-react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  return (
    <Card className="shadow-lg rounded-xl overflow-hidden bg-white dark:bg-dark-secondary dark:text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span>{task.title}:</span><span>{task.devis?.numero_dac}</span>
          {task.priority && (
            <Badge
              className={`ml-auto px-3 py-1 rounded-full ${
                task.priority === "Élevé" ? "bg-red-500" : "bg-green-500"
              } text-white`}
            >
              {task.priority}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {task.attachments && task.attachments.length > 0 && (
          <div className="mb-3">
            <Image
              src={`/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              width={400}
              height={200}
              className="rounded-md w-full h-auto object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Description:</strong> {task.description || "No description provided"}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Début: {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}</span>
            <span> | Fin: {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>Auteur: {task.author ? task.author.username : "Unknown"}</span>
            <span>| Assignés: {task.assignee ? task.assignee.username : "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Flag className="h-4 w-4 text-gray-500" />
            <span>Statut: {task.status}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-gray-500" />
            <span>Étiquette: {task.tags || "No tags"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TimerIcon className="h-4 w-4 text-gray-500" />
            <span>Jours ouvrées: {task.workingDays || "No working days"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
