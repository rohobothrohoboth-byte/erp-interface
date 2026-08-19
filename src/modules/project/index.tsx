// src/modules/project/index.tsx
import { RouteObject } from "react-router-dom";
import ProjectsList from "./pages/projects/ProjectsList";
import CreateProject from "./pages/projects/CreateProject";
import EditProject from "./pages/projects/EditProject";
import ProjectDetails from "./pages/projects/ProjectDetails";

export const projectRoutes: RouteObject[] = [
    {
        path: "projects",
        element: <ProjectsList />,
    },
    {
        path: "projects/create",
        element: <CreateProject />,
    },
    {
        path: "projects/edit/:id",
        element: <EditProject />,
    },
    {
        path: "projects/:id",
        element: <ProjectDetails />,
    },
];

export default projectRoutes;