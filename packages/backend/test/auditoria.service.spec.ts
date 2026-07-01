import { Test, TestingModule } from '@nestjs/testing'
import { AuditoriaService } from '../src/auditoria/auditoria.service'
import { PrismaService } from '../src/prisma/prisma.service'

describe('AuditoriaService', () => {
  let service: AuditoriaService
  let prisma: PrismaService

  const mockPrisma = {
    auditoria: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<AuditoriaService>(AuditoriaService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('debe estar definido', () => {
    expect(service).toBeDefined()
  })

  describe('crear', () => {
    it('debe crear un registro de auditoría', async () => {
      const expected = { id: 1, accion: 'INICIO_SESION', entidadTipo: 'usuario' }
      mockPrisma.auditoria.create.mockResolvedValue(expected)

      const result = await service.crear({
        usuarioId: 1,
        accion: 'INICIO_SESION',
        entidadTipo: 'usuario',
        entidadId: 1,
      })

      expect(result).toEqual(expected)
      expect(mockPrisma.auditoria.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 1,
          accion: 'INICIO_SESION',
          entidadTipo: 'usuario',
          entidadId: 1,
        },
      })
    })
  })

  describe('listar', () => {
    it('debe listar con filtros', async () => {
      const expected = [{ id: 1, accion: 'INICIO_SESION' }]
      mockPrisma.auditoria.findMany.mockResolvedValue(expected)

      const result = await service.listar({ entidadTipo: 'usuario' })

      expect(result).toEqual(expected)
      expect(mockPrisma.auditoria.findMany).toHaveBeenCalledWith({
        where: { entidadTipo: 'usuario' },
        include: { usuario: { select: { id: true, nombre: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
    })
  })

  describe('obtener', () => {
    it('debe obtener por ID', async () => {
      const expected = { id: 1, accion: 'INICIO_SESION' }
      mockPrisma.auditoria.findUnique.mockResolvedValue(expected)

      const result = await service.obtener(1)

      expect(result).toEqual(expected)
      expect(mockPrisma.auditoria.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { usuario: { select: { id: true, nombre: true, email: true } } },
      })
    })
  })
})
