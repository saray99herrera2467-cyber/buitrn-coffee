import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Registro() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        Nombre_usuario: "",
        Apellido: "",
        Correo: "",
        Documento: "",
        Telefono: "",
        Clave: ""
    });
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const registrar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            await axios.post("http://localhost:3001/api/auth/register", form);
            
            // Mostrar mensaje de éxito
            setMensaje({ 
                texto: "✅ ¡Registro exitoso! Redirigiendo al inicio de sesión...", 
                tipo: "exito" 
            });
            
            // Limpiar el formulario
            setForm({
                Nombre_usuario: "",
                Apellido: "",
                Correo: "",
                Documento: "",
                Telefono: "",
                Clave: ""
            });
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate("/login");
            }, 2000);
            
        } catch (err) {
            setMensaje({ 
                texto: err.response?.data?.message || "Error al registrar", 
                tipo: "error" 
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="card">
                <h1>Buitrón Coffee</h1>
                <h2>Crea una Cuenta</h2>

                {mensaje.texto && (
                    <div className={`mensaje-registro ${mensaje.tipo}`}>
                        {mensaje.texto}
                    </div>
                )}

                <form onSubmit={registrar}>
                    <label>Nombre</label>
                    <input name="Nombre_usuario" placeholder="Nombre" onChange={handleChange} value={form.Nombre_usuario} required />

                    <label>Apellido</label>
                    <input name="Apellido" placeholder="Apellido" onChange={handleChange} value={form.Apellido} required />

                    <label>Correo</label>
                    <input name="Correo" placeholder="Correo" onChange={handleChange} value={form.Correo} required />

                    <label>Documento</label>
                    <input name="Documento" placeholder="Documento" onChange={handleChange} value={form.Documento} required />

                    <label>Teléfono</label>
                    <input name="Telefono" placeholder="Teléfono" onChange={handleChange} value={form.Telefono} required />

                    <label>Contraseña</label>
                    <input type="password" name="Clave" placeholder="Contraseña" onChange={handleChange} value={form.Clave} required />

                    <button type="submit" disabled={cargando}>
                        {cargando ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
                
                <div className="links-login">
                    <button className="btn-secundario" onClick={() => navigate("/login")}>
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Registro;