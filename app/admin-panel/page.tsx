"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Shield,
  Users,
  Bell,
  Heart,
  Search,
  CheckCircle,
  Loader2,
  LogOut,
  Clock,
  Activity,
  Monitor,
  MousePointerClick,
  BarChart3,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const isAdmin = Boolean((session?.user as any)?.isAdmin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [data, setData] = useState<any>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("pt-BR");
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}min ${s}s`;
    if (m > 0) return `${m}min ${s}s`;
    return `${s}s`;
  };

  const handleLogout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: "/admin-panel",
    });

    window.location.href = "/admin-panel";
  };

  const fetchAdminData = async () => {
    setLoadingData(true);
    setError("");

    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Não autorizado");
        setData(null);
        return;
      }

      setData(json);
    } catch {
      setError("Erro ao carregar dados do painel");
      setData(null);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      fetchAdminData();
    }

    if (status === "authenticated" && !isAdmin) {
      setData(null);
      setError("Sua conta está autenticada, mas não possui permissão de administrador.");
    }
  }, [status, isAdmin]);

  const handleLogin = async () => {
    setLoadingLogin(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin-panel",
      });

      if (result?.error) {
        setError("E-mail ou senha inválidos");
        return;
      }

      window.location.href = "/admin-panel";
    } catch {
      setError("Erro ao fazer login");
    } finally {
      setLoadingLogin(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Admin Voofacil</h1>
              <p className="text-xs text-gray-500">Acesso restrito</p>
            </div>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail admin"
            className="w-full px-4 py-3 border rounded-lg mb-3"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-3 border rounded-lg mb-4"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loadingLogin}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loadingLogin ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Entrar"
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Acesso negado</h1>
          <p className="text-gray-600 mb-2">
            Sua conta está autenticada, mas não possui permissão de administrador.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Usuário atual: {session?.user?.email || "-"}
          </p>
          <button
            onClick={handleLogout}
            className="px-5 py-3 rounded-lg bg-gray-900 text-white font-semibold"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Falha ao carregar painel</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleLogout}
            className="px-5 py-3 rounded-lg bg-gray-900 text-white font-semibold"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Painel Admin - Voofacil
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session?.user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {loadingData && (
          <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando dados...
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          <Stat icon={Users} label="Usuários" value={stats.totalUsers || 0} color="text-blue-600" />
          <Stat icon={Bell} label="Alertas" value={stats.alerts || 0} color="text-yellow-600" />
          <Stat icon={Heart} label="Favoritos" value={stats.favorites || 0} color="text-red-600" />
          <Stat icon={Search} label="Buscas" value={stats.totalSearches || 0} color="text-green-600" />
          <Stat icon={Activity} label="Buscas 24h" value={stats.searches24h || 0} color="text-purple-600" />
          <Stat icon={Activity} label="Buscas 7d" value={stats.searches7d || 0} color="text-indigo-600" />
          <Stat icon={Monitor} label="Sessões total" value={stats.totalSessions || 0} color="text-slate-700" />
          <Stat icon={Monitor} label="Sessões hoje" value={stats.sessionsToday || 0} color="text-cyan-700" />
          <Stat icon={Clock} label="Ativos 15 min" value={stats.activeSessions15m || 0} color="text-emerald-600" />
          <Stat icon={Clock} label="Ativos 60 min" value={stats.activeSessions60m || 0} color="text-emerald-800" />
          <Stat icon={MousePointerClick} label="Pageviews hoje" value={stats.pageViewsToday || 0} color="text-orange-600" />
          <Stat icon={BarChart3} label="Pág./sessão" value={stats.avgPagesPerSession || 0} color="text-pink-600" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-bold mb-3">Tempo médio por sessão</h2>
            <p className="text-3xl font-black text-blue-700">
              {formatDuration(stats.avgSessionSeconds || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Média calculada com base nas sessões registradas hoje.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-bold mb-3">Leitura rápida</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Sessões ativas nos últimos 15 minutos: <strong>{stats.activeSessions15m || 0}</strong></li>
              <li>• Sessões ativas nos últimos 60 minutos: <strong>{stats.activeSessions60m || 0}</strong></li>
              <li>• Pageviews hoje: <strong>{stats.pageViewsToday || 0}</strong></li>
              <li>• Páginas por sessão hoje: <strong>{stats.avgPagesPerSession || 0}</strong></li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <h2 className="text-lg font-bold p-4 border-b flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-700" />
            Sessões recentes ({data?.recentSessions?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Entrada</th>
                  <th className="text-left p-3">Saída atual</th>
                  <th className="text-left p-3">Início</th>
                  <th className="text-left p-3">Última atividade</th>
                  <th className="text-left p-3">Duração</th>
                  <th className="text-left p-3">Páginas</th>
                  <th className="text-left p-3">Dispositivo</th>
                </tr>
              </thead>

              <tbody>
                {data?.recentSessions?.map((s: any) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{s.user?.email || "Visitante"}</td>
                    <td className="p-3 font-medium">{s.entryPath || "-"}</td>
                    <td className="p-3">{s.exitPath || "-"}</td>
                    <td className="p-3">{formatDate(s.startedAt)}</td>
                    <td className="p-3">{formatDate(s.lastSeenAt)}</td>
                    <td className="p-3">{formatDuration(s.computedDurationSeconds)}</td>
                    <td className="p-3">{s._count?.pageViews || 0}</td>
                    <td className="p-3 uppercase">{s.deviceType || "-"}</td>
                  </tr>
                ))}

                {(!data?.recentSessions || data.recentSessions.length === 0) && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-400">
                      Nenhuma sessão registrada ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <h2 className="text-lg font-bold p-4 border-b flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-600" />
            Páginas mais vistas hoje ({data?.topPages?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Página</th>
                  <th className="text-left p-3">Visualizações</th>
                </tr>
              </thead>

              <tbody>
                {data?.topPages?.map((p: any, index: number) => (
                  <tr key={`${p.path}-${index}`} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.path}</td>
                    <td className="p-3">{p.views}</td>
                  </tr>
                ))}

                {(!data?.topPages || data.topPages.length === 0) && (
                  <tr>
                    <td colSpan={2} className="p-6 text-center text-gray-400">
                      Nenhuma página registrada ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <h2 className="text-lg font-bold p-4 border-b flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Usuários cadastrados ({data?.users?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Cadastro</th>
                  <th className="text-left p-3">Última busca</th>
                  <th className="text-left p-3">Buscas</th>
                  <th className="text-left p-3">Favoritos</th>
                  <th className="text-left p-3">Alertas</th>
                  <th className="text-left p-3">Sessões</th>
                  <th className="text-left p-3">Pageviews</th>
                </tr>
              </thead>

              <tbody>
                {data?.users?.map((u: any) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{u.name || "-"}</td>
                    <td className="p-3">{u.email || "-"}</td>
                    <td className="p-3">{formatDate(u.createdAt)}</td>
                    <td className="p-3">
                      {u.lastSearch ? (
                        <div>
                          <div>{formatDate(u.lastSearch.timestamp)}</div>
                          <div className="text-xs text-gray-400">
                            {u.lastSearch.origin} → {u.lastSearch.destination}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">{u._count?.searchHistory || 0}</td>
                    <td className="p-3">{u._count?.savedSearches || 0}</td>
                    <td className="p-3">{u._count?.priceAlerts || 0}</td>
                    <td className="p-3">{u._count?.visitSessions || 0}</td>
                    <td className="p-3">{u._count?.pageViews || 0}</td>
                  </tr>
                ))}

                {(!data?.users || data.users.length === 0) && (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-400">
                      Nenhum usuário registrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <h2 className="text-lg font-bold p-4 border-b flex items-center gap-2">
            <Search className="w-5 h-5 text-green-600" />
            Buscas recentes ({data?.recentSearches?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Rota</th>
                  <th className="text-left p-3">Ida</th>
                  <th className="text-left p-3">Volta</th>
                  <th className="text-left p-3">Passageiros</th>
                  <th className="text-left p-3">Data/hora</th>
                </tr>
              </thead>

              <tbody>
                {data?.recentSearches?.map((s: any) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{s.user?.email || "-"}</td>
                    <td className="p-3 font-semibold">
                      {s.origin} → {s.destination}
                    </td>
                    <td className="p-3">{s.departureDate}</td>
                    <td className="p-3">{s.returnDate || "-"}</td>
                    <td className="p-3">{s.passengers}</td>
                    <td className="p-3">{formatDate(s.timestamp)}</td>
                  </tr>
                ))}

                {(!data?.recentSearches || data.recentSearches.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400">
                      Nenhuma busca registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <h2 className="text-lg font-bold p-4 border-b flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Termos aceitos ({data?.acceptances?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Versão</th>
                  <th className="text-left p-3">Data aceite</th>
                  <th className="text-left p-3">IP</th>
                </tr>
              </thead>

              <tbody>
                {data?.acceptances?.map((a: any) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{a.user?.name || "-"}</td>
                    <td className="p-3">{a.user?.email || "-"}</td>
                    <td className="p-3">{a.version || "-"}</td>
                    <td className="p-3">{formatDate(a.acceptedAt)}</td>
                    <td className="p-3 font-mono text-xs">{a.ip || "-"}</td>
                  </tr>
                ))}

                {(!data?.acceptances || data.acceptances.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">
                      Nenhum aceite registrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <Icon className={`w-6 h-6 ${color} mb-2`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
