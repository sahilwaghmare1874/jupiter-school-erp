import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.units import mm


def generate_certificate_pdf(
    student_name: str,
    gr_number: str,
    class_name: str,
    doc_type: str,
    purpose: str = "General Purpose",
    issued_date: str = None
) -> bytes:
    """
    Generate an official school certificate PDF using ReportLab.
    Returns PDF as bytes for streaming via Django HttpResponse.
    """
    if issued_date is None:
        issued_date = datetime.now().strftime('%d-%B-%Y')

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=20 * mm
    )
    story = []
    styles = getSampleStyleSheet()

    # ── Custom Styles ───────────────────────────────────────────────────────
    school_name_style = ParagraphStyle(
        'SchoolName',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0d233a'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )
    school_sub_style = ParagraphStyle(
        'SchoolSub',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#555555'),
        spaceAfter=8
    )
    cert_header_style = ParagraphStyle(
        'CertHeader',
        parent=styles['Heading2'],
        fontSize=15,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#c41e3a'),
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=16,
    )
    body_style = ParagraphStyle(
        'CertBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=20,
        alignment=TA_LEFT,
        spaceAfter=12,
    )
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=9.5,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica-Bold',
    )

    # ── School Header ───────────────────────────────────────────────────────
    story.append(Paragraph("JUPITER EDUCATION TRUST, SHENDRE SATARA", school_sub_style))
    story.append(Paragraph("Jupiter English Medium School, Shendre Satara", school_name_style))
    story.append(Paragraph(
        "NH-4 Highway, Shendre, Satara, Maharashtra 415001  |  Phone: +91-2162-270123  |  info@jupiterschoolsatara.org",
        school_sub_style
    ))

    story.append(HRFlowable(
        width="100%", thickness=2.5,
        color=colors.HexColor('#0d233a'),
        spaceBefore=6, spaceAfter=6
    ))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor('#D4AF37'),
        spaceBefore=2, spaceAfter=12
    ))

    # ── Certificate Title ───────────────────────────────────────────────────
    story.append(Paragraph(f"OFFICIAL {doc_type.upper()}", cert_header_style))

    # ── Certificate Body ────────────────────────────────────────────────────
    cert_body = f"""
    This is to certify that <b>{student_name}</b> (GR Number: <b>{gr_number}</b>),
    bearing Roll Number as per school records, is a bonafide student of this institution,
    currently enrolled in <b>{class_name}</b> for the Academic Year <b>2025–2026</b>.
    <br/><br/>
    To the best of our knowledge and the official school register, this student
    bears good moral character and maintains regular attendance. This certificate
    is issued at the request of the student/parent for the stated purpose of:
    <b>{purpose}</b>.
    <br/><br/>
    This certificate is issued without any erasure or overwriting and is valid only
    when bearing the official school seal and the Principal's countersignature.
    """
    story.append(Paragraph(cert_body, body_style))

    # ── Student Details Table ────────────────────────────────────────────────
    story.append(Spacer(1, 6 * mm))
    details_data = [
        ['Student Full Name', ':', student_name],
        ['GR Number', ':', gr_number],
        ['Class / Grade', ':', class_name],
        ['Academic Year', ':', '2025–2026'],
        ['Date of Issue', ':', issued_date],
        ['Certificate Type', ':', doc_type],
        ['Purpose', ':', purpose],
    ]
    details_table = Table(details_data, colWidths=[55 * mm, 8 * mm, 110 * mm])
    details_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#0d233a')),
        ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#222222')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.HexColor('#f8f8f8'), colors.white]),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#eeeeee')),
    ]))
    story.append(details_table)

    # ── Certificate Number & Disclaimer ─────────────────────────────────────
    story.append(Spacer(1, 8 * mm))
    cert_no = f"JUP/CERT/2026/{gr_number.replace('-', '')[:6]}/{''.join(filter(str.isalpha, doc_type))[:3].upper()}"
    story.append(Paragraph(
        f"<i>Certificate Reference No: {cert_no} | This certificate is computer-generated and digitally verified.</i>",
        ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=8,
                       textColor=colors.HexColor('#888888'), alignment=TA_CENTER)
    ))

    # ── Signature Section ────────────────────────────────────────────────────
    story.append(Spacer(1, 12 * mm))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor('#D4AF37'),
        spaceBefore=4, spaceAfter=10
    ))

    sig_data = [
        ['Date of Issue:', issued_date, 'Verified by School Office', 'Principal / Headmistress'],
        ['', '', '[Official Stamp]', '[Authorised Signature]'],
    ]
    sig_table = Table(sig_data, colWidths=[45 * mm, 40 * mm, 55 * mm, 55 * mm])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0d233a')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sig_table)

    doc.build(story)
    return buffer.getvalue()


def generate_fee_receipt_pdf(
    invoice_number: str,
    student_name: str,
    gr_number: str,
    class_name: str,
    title: str,
    total_amount: float,
    paid_amount: float,
    due_date: str,
    payment_status: str,
    payment_mode: str = 'Online Payment',
    transaction_id: str = None,
    paid_at: str = None
) -> bytes:
    """
    Generate an official School Fee Payment Receipt PDF using ReportLab.
    Returns PDF as bytes for streaming via Django HttpResponse.
    """
    if paid_at is None:
        paid_at = datetime.now().strftime('%d-%b-%Y %I:%M %p')

    balance_due = max(0.0, float(total_amount) - float(paid_amount))

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=20 * mm
    )
    story = []
    styles = getSampleStyleSheet()

    school_name_style = ParagraphStyle(
        'ReceiptSchoolName',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0d233a'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )
    school_sub_style = ParagraphStyle(
        'ReceiptSchoolSub',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#555555'),
        spaceAfter=6
    )
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Heading2'],
        fontSize=15,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#198754') if payment_status == 'Paid' else colors.HexColor('#c41e3a'),
        fontName='Helvetica-Bold',
        spaceBefore=8,
        spaceAfter=14,
    )

    # ── Header ──────────────────────────────────────────────────────────
    story.append(Paragraph("JUPITER EDUCATION TRUST, SHENDRE SATARA", school_sub_style))
    story.append(Paragraph("Jupiter English Medium School, Shendre Satara", school_name_style))
    story.append(Paragraph(
        "NH-4 Highway, Shendre, Satara, Maharashtra 415001  |  Phone: +91-2162-270123  |  info@jupiterschoolsatara.org",
        school_sub_style
    ))

    story.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor('#0d233a'), spaceBefore=4, spaceAfter=4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#D4AF37'), spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(f"OFFICIAL FEE PAYMENT RECEIPT — {payment_status.upper()}", receipt_title_style))

    # ── Student & Invoice Metadata ─────────────────────────────────────
    meta_data = [
        ['Receipt / Invoice No:', invoice_number, 'Date of Payment:', paid_at],
        ['Student Full Name:', student_name, 'GR Number:', gr_number],
        ['Class / Grade:', class_name, 'Due Date:', due_date],
        ['Payment Status:', payment_status, 'Payment Mode:', payment_mode or 'Online NEFT / UPI'],
    ]
    meta_table = Table(meta_data, colWidths=[42 * mm, 50 * mm, 38 * mm, 45 * mm])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#222222')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.HexColor('#f8f9fa'), colors.white]),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#eeeeee')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6 * mm))

    # ── Fee Particulars Table ──────────────────────────────────────────
    breakdown_data = [
        ['Sr.', 'Fee Particulars / Description', 'Total Amount (₹)', 'Paid Amount (₹)', 'Balance Due (₹)'],
        ['1', title, f"₹ {total_amount:,.2f}", f"₹ {paid_amount:,.2f}", f"₹ {balance_due:,.2f}"],
        ['', 'TOTALS', f"₹ {total_amount:,.2f}", f"₹ {paid_amount:,.2f}", f"₹ {balance_due:,.2f}"],
    ]
    breakdown_table = Table(breakdown_data, colWidths=[12 * mm, 78 * mm, 28 * mm, 28 * mm, 29 * mm])
    breakdown_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0d233a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#e9ecef')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#dddddd')),
    ]))
    story.append(breakdown_table)

    if transaction_id:
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph(
            f"<b>Transaction / Ref ID:</b> {transaction_id}",
            ParagraphStyle('TxStyle', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#555555'))
        ))

    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph(
        "<i>* This receipt is computer-generated and electronically issued by the Accounts Office of Jupiter English Medium School. No physical signature required.</i>",
        ParagraphStyle('NoteStyle', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#777777'), alignment=TA_CENTER)
    ))

    # ── Signatures ─────────────────────────────────────────────────────
    story.append(Spacer(1, 12 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#D4AF37'), spaceBefore=2, spaceAfter=8))

    sig_data = [
        ['Accounts Officer / Clerk', 'Cashier / Accountant', 'Principal / Headmistress'],
        ['[Verified & Checked]', '[Receipt Voucher Issued]', '[Authorised Signatory]'],
    ]
    sig_table = Table(sig_data, colWidths=[60 * mm, 60 * mm, 55 * mm])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0d233a')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(sig_table)

    doc.build(story)
    return buffer.getvalue()

