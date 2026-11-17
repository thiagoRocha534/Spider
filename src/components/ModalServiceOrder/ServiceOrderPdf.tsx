import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import { maskCurrency } from '../../utils/masks'
import { breakLongWords } from '../Pdf/breakLongWords'
import PdfField from '../Pdf/PdfField'
import PdfFooter from '../Pdf/PdfFooter'
import PdfHeader from '../Pdf/PdfHeader'
import { COLORS, pdfStyles } from '../Pdf/pdfStyles'
import { isBlankItem, itemTotalCents, itemsTotalCents } from './serviceOrderValues'
import type { ServiceOrderFormValues } from './serviceOrderValues'

/** Largura de cada coluna da tabela; somam 100%. */
const COLUMNS = { quantity: '11%', description: '49%', unitPrice: '20%', total: '20%' }

const styles = StyleSheet.create({
  orderNumber: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: COLORS.deepBlack },

  table: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 4 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightRed,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headCell: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: COLORS.spiderRed,
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.line },
  rowLast: { borderBottomWidth: 0 },
  rowStriped: { backgroundColor: '#f7f9fc' },
  cell: { paddingVertical: 7, paddingHorizontal: 8 },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },

  totals: { marginTop: 14, marginLeft: 'auto', width: '45%' },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: COLORS.deepBlack,
    color: COLORS.white,
    borderRadius: 4,
  },
  grandTotalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, letterSpacing: 1.5 },
  grandTotalValue: { fontFamily: 'Helvetica-Bold', fontSize: 13 },

  textBox: {
    backgroundColor: COLORS.lightRed,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.spiderRed,
    borderRadius: 4,
    padding: 12,
  },
})

type ServiceOrderPdfProps = {
  values: ServiceOrderFormValues
  /** Data de emissão em AAAA-MM-DD. */
  issuedAt: string
}

/** Documento de ordem de serviço da loja, gerado a partir do formulário. */
function ServiceOrderPdf({ values, issuedAt }: ServiceOrderPdfProps) {
  const items = values.items.filter((item) => !isBlankItem(item))
  const total = itemsTotalCents(items)
  const orderNumber = String(values.orderNumber).padStart(6, '0')

  return (
    <Document
      title={`Ordem de serviço ${orderNumber}`}
      author={WORKSHOP.tradeName}
      creator={WORKSHOP.tradeName}
    >
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader issuedAt={issuedAt} showPhone />

        <View style={pdfStyles.body}>
          <View style={pdfStyles.section} wrap={false}>
            <Text style={styles.orderNumber}>ORDEM DE SERVIÇO Nº {orderNumber}</Text>
          </View>

          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>DADOS DA ORDEM</Text>
            <View style={pdfStyles.fields}>
              <PdfField label="Data" value={values.date.split('-').reverse().join('/')} width="30%" />
              <PdfField label="Placa" value={values.plate} width="30%" />
            </View>
          </View>

          {values.mode === 'orcamento' ? (
            <>
              {items.length > 0 && (
                <View style={pdfStyles.section}>
                  <Text style={pdfStyles.sectionTitle}>PRODUTOS E SERVIÇOS</Text>

                  <View style={styles.table}>
                    <View style={styles.tableHead} fixed>
                      <Text style={[styles.headCell, styles.center, { width: COLUMNS.quantity }]}>
                        QUANT.
                      </Text>
                      <Text style={[styles.headCell, { width: COLUMNS.description }]}>
                        PRODUTO / SERVIÇO
                      </Text>
                      <Text style={[styles.headCell, styles.right, { width: COLUMNS.unitPrice }]}>
                        PREÇO UNIT.
                      </Text>
                      <Text style={[styles.headCell, styles.right, { width: COLUMNS.total }]}>
                        SUBTOTAL
                      </Text>
                    </View>

                    {items.map((item, index) => (
                      <View
                        key={item.id}
                        wrap={false}
                        style={[
                          styles.row,
                          index % 2 === 1 ? styles.rowStriped : {},
                          index === items.length - 1 ? styles.rowLast : {},
                        ]}
                      >
                        <Text style={[styles.cell, styles.center, { width: COLUMNS.quantity }]}>
                          {item.quantity}
                        </Text>
                        <Text style={[styles.cell, { width: COLUMNS.description }]}>
                          {item.description.trim()}
                        </Text>
                        <Text style={[styles.cell, styles.right, { width: COLUMNS.unitPrice }]}>
                          {maskCurrency(item.unitPrice)}
                        </Text>
                        <Text style={[styles.cell, styles.right, { width: COLUMNS.total }]}>
                          {maskCurrency(String(itemTotalCents(item)))}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.totals} wrap={false}>
                <View style={styles.grandTotal}>
                  <Text style={styles.grandTotalLabel}>TOTAL</Text>
                  <Text style={styles.grandTotalValue}>
                    {maskCurrency(String(total)) || 'R$ 0,00'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>MANUTENÇÃO</Text>
              <View style={styles.textBox}>
                <Text hyphenationCallback={breakLongWords}>
                  {values.maintenanceDescription.trim()}
                </Text>
              </View>
            </View>
          )}

          {values.observation.trim() && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>OBSERVAÇÕES GERAIS</Text>
              <View style={styles.textBox}>
                <Text hyphenationCallback={breakLongWords}>{values.observation.trim()}</Text>
              </View>
            </View>
          )}
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}

export default ServiceOrderPdf
