import { atom } from 'jotai'

/**
 * Período do relatório de serviços. Estado global: o ServicesReportFilters
 * escreve, a ServicesReportGrid lê e filtra. Vazio = sem limite.
 */
export const servicesReportFromAtom = atom('')
export const servicesReportToAtom = atom('')
