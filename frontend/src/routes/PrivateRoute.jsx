import { Navigate } from "react-router-dom";
import { useEffect} from "react";

function PrivateRoute({ children }) {
  useEffect(() => {
    const manejarPageShow = (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", manejarPageShow);
    return () => window.removeEventListener("pageshow", manejarPageShow);
  }, []);
  const token = localStorage.getItem("token");


  if (!token) {

    return <Navigate to="/" replace />;

  }


  return children;

}


export default PrivateRoute;