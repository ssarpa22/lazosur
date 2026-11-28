"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Credenciales incorrectas o cuenta no autorizada.");
        setBusy(false);
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("No se pudo conectar con el servicio de autenticación.");
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Correo
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>

      <button className="btn" disabled={busy}>
        {busy ? "Ingresando…" : "Ingresar"}
      </button>

      {error && <p role="alert">{error}</p>}
    </form>
  );
}
