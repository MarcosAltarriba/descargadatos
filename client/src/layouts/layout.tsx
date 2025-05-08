import { Outlet } from "react-router-dom";
import logo from "../assets/logo.png";
import { ToastContainer, Bounce } from "react-toastify";



const Layout = () => {
    return (
        <div className="h-full flex flex-col">
            <header className="bg-gray-800 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <img src={logo} alt="Logo Hireves" className="h-10" />
                    </div>
                    <nav>
                        <ul className="flex space-x-6">
                            <li><a href="/" className="hover:text-gray-400">Inicio</a></li>
                            <li><a href="/DownloadData" className="hover:text-gray-400">Descargar datos</a></li>
                            <li><a href="/Contact" className="hover:text-gray-400">Contacto</a></li>
                            <li><a href="/About" className="hover:text-gray-400">About</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce} aria-label={undefined}
            />
        </div>
    );
};

export default Layout;