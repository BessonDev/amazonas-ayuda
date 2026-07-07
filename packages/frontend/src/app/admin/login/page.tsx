"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Heart, ChevronRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login({ email, password });
      router.push("/admin/dashboard");
    } catch (err) {
      setError(normalizarErrorLogin(err));
    } finally {
      setCargando(false);
    }
  };

  function normalizarErrorLogin(err: unknown): string {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError"))
      return "Error al conectar con el servidor. Verifica tu conexión.";
    if (msg.includes("401") || msg.includes("no encontrado") || msg.includes("incorrecta") || msg.includes("credencial"))
      return "Credenciales inválidas. Verifica tu correo y contraseña.";
    if (msg.includes("500"))
      return "Error interno del servidor. Intenta de nuevo más tarde.";
    return msg || "Error al iniciar sesión";
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background - mismo estilo que el hero público */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M50 50v-4h-4v4h-4v4h4v4h4v4h4v-4h4v-4h-4zm0-40v-4h-4v4h-4v4h4v4h4v-4h4v-4h-4zM10 50v-4H6v4H2v4h4v4h4v-4h4v-4h-4zM10 10V6H6v4H2v4h4v4h4v-4h4v-4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-0">
              <Image src="/logo.png" alt="Logo" width={100} height={100} priority className="brightness-0 invert" />
            </div>
            {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/30 mb-4">
              <span className="size-2 rounded-full bg-[#D4A373] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#D4A373]">De AMAZONAS para VENEZUELA</span>
            </div> */}
            <CardTitle className="text-2xl text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-white/70">Portal Administrativo</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@donaciones.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4A373]/50 focus:ring-[#D4A373]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4A373]/50 focus:ring-[#D4A373]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                    tabIndex={-1}
                  >
                    {mostrarPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 font-medium flex items-center gap-1.5">
                  <span className="size-4">⚠</span>
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#D4A373] text-[#1B4332] hover:bg-[#c4955f] active:scale-[0.98] transition-all font-semibold py-3"
                disabled={cargando}
              >
                {cargando ? <Loader2 className="size-4 animate-spin" /> : "Ingresar"}
                {!cargando && <ChevronRight className="size-4 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}