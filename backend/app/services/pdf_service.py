import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.core.logging import logger


def generate_announcement_pdf(
    output_path: str,
    title: str,
    author_name: str,
    author_role: str,
    author_dept: str,
    target_summary: list[str],
    message_content: str,
    created_at: datetime,
    attachment_names: list[str],
) -> tuple[str, int]:
    """Generates an official, corporate-branded Announcement.pdf document using ReportLab."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    header_style = ParagraphStyle(
        "DocHeader",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),  # slate-900
        fontName="Helvetica-Bold",
        spaceAfter=6,
    )

    badge_style = ParagraphStyle(
        "PortalBadge",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#2563eb"),  # blue-600
        fontName="Helvetica-Bold",
        spaceAfter=15,
    )

    meta_label = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),  # slate-500
        fontName="Helvetica-Bold",
    )

    meta_val = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a"),  # slate-900
        fontName="Helvetica",
    )

    body_style = ParagraphStyle(
        "AnnounceBody",
        parent=styles["Normal"],
        fontSize=10.5,
        leading=16,
        textColor=colors.HexColor("#1e293b"),  # slate-800
        fontName="Helvetica",
        spaceAfter=10,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        fontName="Helvetica-Bold",
        spaceBefore=12,
        spaceAfter=6,
    )

    footer_style = ParagraphStyle(
        "FooterNotice",
        parent=styles["Italic"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#94a3b8"),  # slate-400
        fontName="Helvetica-Oblique",
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("PROSETH SOLUTION • WEB PORTAL", badge_style))
    story.append(Paragraph(title, header_style))
    story.append(
        HRFlowable(
            width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=15
        )
    )

    # 2. Metadata Table
    formatted_date = created_at.strftime("%Y-%m-%d %H:%M UTC")
    recipients_text = (
        ", ".join(target_summary) if target_summary else "Designated Recipients"
    )

    meta_data = [
        [
            Paragraph("Posted By:", meta_label),
            Paragraph(f"{author_name} ({author_role} - {author_dept})", meta_val),
            Paragraph("Date:", meta_label),
            Paragraph(formatted_date, meta_val),
        ],
        [
            Paragraph("Target Audience:", meta_label),
            Paragraph(recipients_text, meta_val),
            Paragraph("Access Level:", meta_label),
            Paragraph("Restricted / Confidentially Trimmed", meta_val),
        ],
    ]

    meta_table = Table(meta_data, colWidths=[90, 220, 70, 150])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 18))

    # 3. Announcement Body
    story.append(Paragraph("Announcement Details", section_heading))

    # Split message into paragraphs and format clean bullet points
    lines = message_content.split("\n")
    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            story.append(Spacer(1, 6))
            continue
        if cleaned.startswith("### "):
            story.append(Paragraph(cleaned[4:], section_heading))
        elif cleaned.startswith("#### "):
            h4_style = ParagraphStyle(
                "H4", parent=section_heading, fontSize=11, leading=14
            )
            story.append(Paragraph(cleaned[5:], h4_style))
        elif cleaned.startswith(("* ", "- ")):
            bullet_style = ParagraphStyle("Bullet", parent=body_style, leftIndent=15)
            story.append(Paragraph(f"• {cleaned[2:]}", bullet_style))
        else:
            # Replace markdown bold **text** with standard html tags for ReportLab
            clean_html = cleaned.replace("**", "<b>").replace("<b>", "<b>", 1)
            # Simple bold formatting
            parts = clean_html.split("<b>")
            if len(parts) > 1:
                reconstructed = []
                for idx, part in enumerate(parts):
                    if idx % 2 == 1:
                        reconstructed.append(f"<b>{part}</b>")
                    else:
                        reconstructed.append(part)
                clean_html = "".join(reconstructed)
            story.append(Paragraph(clean_html, body_style))

    story.append(Spacer(1, 15))

    # 4. Attachment Manifest
    if attachment_names:
        story.append(Paragraph("Included Document Attachments:", section_heading))
        for att in attachment_names:
            story.append(Paragraph(f"📎 {att}", body_style))
        story.append(Spacer(1, 15))

    # 5. Footer Security Disclaimer
    story.append(
        HRFlowable(
            width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=8
        )
    )
    story.append(
        Paragraph(
            "CONFIDENTIALITY NOTICE: This announcement and all associated files are stored in a permission-trimmed "
            "portal directory. They are intended exclusively for authorized recipients. Downloading, printing, or "
            "sharing these materials with unauthorized individuals violates company information security policies.",
            footer_style,
        )
    )

    doc.build(story)
    file_size = os.path.getsize(output_path)
    logger.info(f"Compiled Announcement.pdf: {output_path} ({file_size} bytes)")
    return output_path, file_size
