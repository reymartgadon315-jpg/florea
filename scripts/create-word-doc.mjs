import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const tempDir = path.resolve('temp_docx_build');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

fs.mkdirSync(path.join(tempDir, '_rels'), { recursive: true });
fs.mkdirSync(path.join(tempDir, 'word', '_rels'), { recursive: true });

// 1. [Content_Types].xml
const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), contentTypesXml, 'utf8');

// 2. _rels/.rels
const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
fs.writeFileSync(path.join(tempDir, '_rels', '.rels'), rootRelsXml, 'utf8');

// 3. word/_rels/document.xml.rels
const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
fs.writeFileSync(path.join(tempDir, 'word', '_rels', 'document.xml.rels'), docRelsXml, 'utf8');

// 4. word/styles.xml
const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="24"/>
        <w:color w:val="333333"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="276" w:lineRule="auto" w:after="160"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="240" w:after="240"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
      <w:b/>
      <w:sz w:val="48"/>
      <w:color w:val="2E4033"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:after="360"/>
    </w:pPr>
    <w:rPr>
      <w:i/>
      <w:sz w:val="28"/>
      <w:color w:val="555555"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="360" w:after="160"/>
      <w:outlineLvl w:val="0"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
      <w:b/>
      <w:sz w:val="34"/>
      <w:color w:val="2E4033"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr>
      <w:spacing w:before="260" w:after="120"/>
      <w:outlineLvl w:val="1"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="3B5341"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:pPr>
      <w:spacing w:before="200" w:after="100"/>
      <w:outlineLvl w:val="2"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
      <w:color w:val="444444"/>
    </w:rPr>
  </w:style>
</w:styles>`;
fs.writeFileSync(path.join(tempDir, 'word', 'styles.xml'), stylesXml, 'utf8');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Read raw document source
const rawText = fs.readFileSync('raw_capstone_proposal.txt', 'utf8');
const lines = rawText.split(/\r?\n/);

let bodyXml = '';

function p(text, options = {}) {
  const align = options.align ? `<w:jc w:val="${options.align}"/>` : '';
  const style = options.style ? `<w:pStyle w:val="${options.style}"/>` : '';
  const spacingBefore = options.before ? `w:before="${options.before}"` : '';
  const spacingAfter = options.after ? `w:after="${options.after}"` : '';
  const spacing = (spacingBefore || spacingAfter) ? `<w:spacing ${spacingBefore} ${spacingAfter}/>` : '';
  
  const bold = options.bold ? '<w:b/>' : '';
  const italic = options.italic ? '<w:i/>' : '';
  const color = options.color ? `<w:color w:val="${options.color}"/>` : '';
  const size = options.size ? `<w:sz w:val="${options.size}"/>` : '';
  
  let pPr = '';
  if (style || align || spacing) {
    pPr = `<w:pPr>${style}${align}${spacing}</w:pPr>`;
  }
  
  let rPr = '';
  if (bold || italic || color || size) {
    rPr = `<w:rPr>${bold}${italic}${color}${size}</w:rPr>`;
  }

  return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function bullet(text, boldPrefix = '') {
  let content = '';
  if (boldPrefix) {
    content += `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(boldPrefix)} </w:t></w:r>`;
  }
  content += `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:ind w:left="480"/><w:spacing w:after="100"/></w:pPr><w:r><w:t xml:space="preserve">• </w:t></w:r>${content}</w:p>`;
}

function tableRow(cells, isHeader = false) {
  const tcList = cells.map(cell => {
    const bold = isHeader ? '<w:b/>' : '';
    const shd = isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="EAF0EB"/>' : '';
    return `<w:tc>
      <w:tcPr>
        ${shd}
        <w:tcMar>
          <w:top w:w="120" w:type="dxa"/>
          <w:bottom w:w="120" w:type="dxa"/>
          <w:left w:w="160" w:type="dxa"/>
          <w:right w:w="160" w:type="dxa"/>
        </w:tcMar>
      </w:tcPr>
      <w:p>
        <w:pPr><w:spacing w:after="60" w:line="240"/></w:pPr>
        <w:r><w:rPr>${bold}<w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">${escapeXml(cell.trim())}</w:t></w:r>
      </w:p>
    </w:tc>`;
  }).join('');

  return `<w:tr>${tcList}</w:tr>`;
}

let inTable = false;
let tableRows = [];

function flushTable() {
  if (!inTable) return;
  const tblBorders = `
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:space="0" w:color="CCCCCC"/>
      <w:left w:val="single" w:sz="6" w:space="0" w:color="CCCCCC"/>
      <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CCCCCC"/>
      <w:right w:val="single" w:sz="6" w:space="0" w:color="CCCCCC"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>
    </w:tblBorders>`;
  const tblXml = `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${tblBorders}</w:tblPr>${tableRows.join('')}</w:tbl><w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`;
  bodyXml += tblXml;
  tableRows = [];
  inTable = false;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('|') && line.endsWith('|')) {
    if (line.includes('---')) {
      continue;
    }
    const cells = line.split('|').slice(1, -1);
    if (!inTable) {
      inTable = true;
      tableRows.push(tableRow(cells, true));
    } else {
      tableRows.push(tableRow(cells, false));
    }
    continue;
  } else if (inTable) {
    flushTable();
  }

  if (!line) {
    continue;
  }

  if (line.startsWith('# ')) {
    bodyXml += p(line.replace('# ', ''), { style: 'Title' });
  } else if (line.startsWith('## ')) {
    bodyXml += p(line.replace('## ', ''), { style: 'Subtitle' });
  } else if (line.startsWith('### ')) {
    bodyXml += p(line.replace('### ', ''), { style: 'Heading1' });
  } else if (line.startsWith('#### ')) {
    bodyXml += p(line.replace('#### ', ''), { style: 'Heading2' });
  } else if (/^[0-9]\.[0-9]\s/.test(line) || /^CHAPTER\s/i.test(line)) {
    bodyXml += p(line, { style: 'Heading1' });
  } else if (/^[0-9]\.[0-9]\.[0-9]\s/.test(line)) {
    bodyXml += p(line, { style: 'Heading2' });
  } else if (line.startsWith('Table ') || line.startsWith('Figure ')) {
    bodyXml += p(line, { bold: true, color: '2E4033', before: '180', after: '100' });
  } else if (line.startsWith('•') || line.startsWith('-')) {
    const itemText = line.replace(/^[•\-]\s*/, '');
    const boldMatch = itemText.match(/^(\*\*.*?\*\*|\b[A-Za-z\s/&-]+:\s*)/);
    if (boldMatch) {
      const prefix = boldMatch[0].replace(/\*\*/g, '');
      const rest = itemText.substring(boldMatch[0].length);
      bodyXml += bullet(rest, prefix);
    } else {
      bodyXml += bullet(itemText);
    }
  } else if (line.startsWith('____') || line.includes('Panel Member') || line.includes('Adviser') || line.includes('Dean')) {
    bodyXml += p(line, { align: 'center', after: '100' });
  } else {
    bodyXml += p(line, { after: '140' });
  }
}

flushTable();

// Section properties (Letter size, 1 inch margins)
const sectPr = `
  <w:sectPr>
    <w:pgSz w:w="12240" w:h="15840"/>
    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
  </w:sectPr>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    ${sectPr}
  </w:body>
</w:document>`;

fs.writeFileSync(path.join(tempDir, 'word', 'document.xml'), documentXml, 'utf8');

const outputDocx = path.resolve('Florea_Capstone_Proposal_Revised.docx');
if (fs.existsSync(outputDocx)) {
  fs.unlinkSync(outputDocx);
}

// Compress using zip-docx.ps1 with forward slashes for OpenXML compliance
try {
  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "c:\\Users\\THIS PC\\Downloads\\florea-prototype-v2\\scripts\\zip-docx.ps1"`);
  console.log(`SUCCESS: Created ${outputDocx}`);
} catch (err) {
  console.error('Compress error:', err);
  process.exit(1);
} finally {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
