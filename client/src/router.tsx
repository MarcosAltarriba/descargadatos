import Layout from "./layouts/layout";
import { createBrowserRouter } from "react-router-dom";
import MainPage from "./views/MainPage";
import Contacto from "./views/Contact";
import About from "./views/About";
import DownloadData from "./views/DownloadData";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [ //LOS HIJOS HEREDAN LO DEL LAYOUT
            {
                index: true,
                element: <MainPage />
            },
            {
                path: '/Contact',
                element: <Contacto />
            },
            {
                path: '/About',
                element: <About />
            },
            {
                path: '/DownloadData',
                element: <DownloadData />
            }
        ]
    }
])