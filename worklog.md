---
Task ID: 1
Agent: Super Z (Main)
Task: Match taqreer-vercel PDF output to serrrah reference repo formatting

Work Log:
- Cloned reference repo: https://github.com/almorish123321-creator/serrrah.git
- Analyzed pdf_generator_updated.py: table layout, colors, fonts, positions, merged cells
- Analyzed website/index.html and style.css for inquiry page design
- Rebuilt pdf-template.html with 4-column table: [164, 235, 235, 136]px
- Matched serrrah exact formatting: colors (#366fb5 labels, #2c3e77 values, #2c3e77 dark row, #f7f7f7 alt rows, #D9D9D9 borders)
- Font sizes: 13px standard, 11px for Name/Nationality/Position English columns (single line)
- Merged cells on rows 0 (Leave ID), 4 (Issue Date), 6 (National ID) columns 1+2
- Updated header/footer positions to match serrrah mm-to-px conversions
- Added vertical divider line at x=431px
- Updated inquiry.html to match serrrah website layout with Bootstrap 5.3.2
- Deployed to Vercel successfully

Stage Summary:
- PDF template now matches serrrah/pdf_generator_updated.py formatting exactly
- 4-column layout with proper merged cells, colors, and font sizes
- English columns use single-line (white-space:nowrap) to prevent wrapping
- Inquiry page updated to match serrrah website design
- Deployed to: https://my-project-six-sigma-12.vercel.app
