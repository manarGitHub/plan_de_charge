"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/(dashboard)/managers/projects/ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";

type Props = {
  params: { id: string };
};

const Project = ({ params }: Props) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState("Détail des activités projet");

  return (
    <div>
      
      <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "Détail des activités projet" && (
        <Board id={id}  />
      )}
      {activeTab === "Liste" && (
        <List id={id}  />
      )}
       {activeTab === "Calendrier" && (
        <Timeline id={id}  />
      )}
      {activeTab === "Tableau" && (
        <Table id={id} />
      )}
    </div>
  );
};

export default Project;