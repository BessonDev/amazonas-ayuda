'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Configuracion {
  id: number
  clave: string
  valor: string
}

export default function ConfiguracionPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.get<Configuracion[]>('/configuracion'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/configuracion/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion'] })
    },
  })

  const filtered = configs.filter((c) =>
    c.clave.toLowerCase().includes(search.toLowerCase()) ||
    c.valor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Variables de configuración del sistema</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por clave o valor..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Cargando...
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay configuraciones registradas
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cfg) => (
            <Card key={cfg.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <CardTitle className="font-mono text-sm">{cfg.clave}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    if (confirm('¿Eliminar esta configuración?')) {
                      deleteMutation.mutate(cfg.id)
                    }
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground break-all">{cfg.valor}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
