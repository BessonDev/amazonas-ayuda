import { Test, TestingModule } from '@nestjs/testing'
import { ReportesService } from '../src/reportes/reportes.service'
import { PrismaService } from '../src/prisma/prisma.service'

describe('ReportesService', () => {
  let service: ReportesService
  let prisma: PrismaService

  const mockPrisma = {
    lote: { findMany: jest.fn() },
    viaje: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  }

  const mockRes = () => {
    const chunks: Buffer[] = []
    return {
      set: jest.fn(),
      end: jest.fn(),
      write: jest.fn((chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))),
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
    } as any
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<ReportesService>(ReportesService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('debe estar definido', () => {
    expect(service).toBeDefined()
  })

  describe('generarDonaciones', () => {
    it('debe generar reporte de donaciones en PDF', async () => {
      mockPrisma.lote.findMany.mockResolvedValue([])
      const res = mockRes()

      await service.generarDonaciones('pdf', res)

      expect(res.set).toHaveBeenCalled()
      expect(res.set.mock.calls[0][0]).toMatchObject({ 'Content-Type': 'application/pdf' })
    })

    it('debe generar reporte de donaciones en Excel', async () => {
      mockPrisma.lote.findMany.mockResolvedValue([
        {
          id: 1,
          codigo: 'LOTE-001',
          cantidad: 100,
          estado: 'DISPONIBLE',
          createdAt: new Date(),
          producto: { nombre: 'Arroz', categoria: { nombre: 'Alimentos' } },
          donante: { nombre: 'Juan' },
          campania: { nombre: 'Campaña 1' },
          ubicacion: { nombre: 'Centro de Acopio' },
        },
      ])
      const res = mockRes()

      await service.generarDonaciones('excel', res)

      expect(res.set).toHaveBeenCalled()
      expect(res.set.mock.calls[0][0]).toMatchObject({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    })
  })

  describe('generarViajes', () => {
    it('debe generar reporte de viajes en PDF', async () => {
      mockPrisma.viaje.findMany.mockResolvedValue([])
      const res = mockRes()

      await service.generarViajes('pdf', res)

      expect(res.set).toHaveBeenCalled()
      expect(res.set.mock.calls[0][0]).toMatchObject({ 'Content-Type': 'application/pdf' })
    })
  })
})
