import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import logo from '../../assets/logo-spider.jpg'
import { WORKSHOP } from '../../constants/workshop'
import { formatDate } from '../../utils/formatDate'
import { COLORS, PAGE_PADDING } from './pdfStyles'

const styles = StyleSheet.create({
  // A versão digital do papel timbrado.
  header: {
    backgroundColor: COLORS.deepBlack,
    color: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: { width: 40, height: 40, borderRadius: 20, marginRight: 16 },
  workshop: { flexGrow: 1 },
  tradeName: { fontFamily: 'Helvetica-Bold', fontSize: 18, letterSpacing: 0.5 },
  headerLine: { fontSize: 8, marginTop: 2, opacity: 0.75 },
  documentTag: { alignItems: 'flex-end' },
  phone: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 4 },
  documentDate: { fontSize: 8, opacity: 0.75 },
  accentBar: { height: 4, backgroundColor: COLORS.spiderRed },
})

type PdfHeaderProps = {
  /** Data de emissão em AAAA-MM-DD. Sem ela, o cabeçalho sai sem data. */
  issuedAt?: string
  /** Mostra o telefone da loja em destaque, como no talão de orçamento. */
  showPhone?: boolean
}

/** Faixa vermelha com os dados da loja e a data de emissão, no topo dos PDFs. */
function PdfHeader({ issuedAt, showPhone = false }: PdfHeaderProps) {
  return (
    <>
      <View style={styles.header}>
        <Image src={logo} style={styles.logo} />
        <View style={styles.workshop}>
          <Text style={styles.tradeName}>{WORKSHOP.tradeName.toUpperCase()}</Text>
          <Text style={styles.headerLine}>CNPJ {WORKSHOP.cnpj}</Text>
          <Text style={styles.headerLine}>
            {WORKSHOP.street} · {WORKSHOP.district} · CEP {WORKSHOP.zipCode} · {WORKSHOP.city}
          </Text>
        </View>

        <View style={styles.documentTag}>
          {showPhone && <Text style={styles.phone}>Fone {WORKSHOP.phone}</Text>}
          {issuedAt && <Text style={styles.documentDate}>Emitido em {formatDate(issuedAt)}</Text>}
        </View>
      </View>
      <View style={styles.accentBar} />
    </>
  )
}

export default PdfHeader
