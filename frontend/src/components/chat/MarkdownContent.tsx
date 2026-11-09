import React from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
}

/**
 * Lightweight, robust Markdown-to-JSX renderer tailored for Ayurvedic Clinical advice.
 * Gracefully parses headers, tables, bullet points, numbered lists, blockquotes, bold text, and divider rules.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  // Defensive filter: never render raw clinical reasoning tags if they slip in
  const cleanedContent = content
    .replace(/\n*\s*\[?\**\[?(?:CLINICAL[ _]REASONING|Clinical Reasoning|तर्क व प्रमाण)[\s\S]*$/i, '')
    .trimEnd()
  const lines = cleanedContent.split('\n')
  const elements: React.ReactNode[] = []
  let tableBuffer: string[] = []
  let inTable = false

  const renderInline = (text: string): React.ReactNode => {
    // Parse bold **text** and italic *text*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#1F2A24]">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-[#37493D]">{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="rounded bg-[#EBE4D5] px-1 py-0.5 text-xs font-mono text-[#2A4638]">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  const flushTable = (buffer: string[], key: number) => {
    if (buffer.length < 2) return null
    const headerRow = buffer[0].split('|').map((c) => c.trim()).filter(Boolean)
    const dataRows = buffer.slice(2).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean))

    return (
      <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-[#E5DED1] bg-white/60 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#2A4638]/5 text-[#2A4638] font-semibold border-b border-[#E5DED1]">
            <tr>
              {headerRow.map((h, i) => (
                <th key={i} className="px-3 py-2">{renderInline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DED1]">
            {dataRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-[#FAF6EE] transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-[#37493D]">{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx]
    const trimmed = rawLine.trim()

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed)
      inTable = true
      continue
    } else if (inTable) {
      elements.push(flushTable(tableBuffer, idx))
      tableBuffer = []
      inTable = false
    }

    if (!trimmed) {
      elements.push(<div key={`spacer-${idx}`} className="h-2" />)
      continue
    }

    // Divider
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${idx}`} className="my-3 border-[#E5DED1]" />)
      continue
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${idx}`} className="mt-3 mb-1.5 text-sm font-bold text-[#1F2A24] tracking-tight flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#2A4638]/60 inline-block" />
          {renderInline(trimmed.slice(4))}
        </h4>
      )
      continue
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${idx}`} className="mt-4 mb-2 text-base font-bold text-[#1F2A24] border-b border-[#E5DED1]/60 pb-1">
          {renderInline(trimmed.slice(3))}
        </h3>
      )
      continue
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${idx}`} className="mt-4 mb-2 text-lg font-bold text-[#1F2A24]">
          {renderInline(trimmed.slice(2))}
        </h2>
      )
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          className="my-2.5 rounded-r-xl border-l-4 border-[#2A4638] bg-[#F4EFE6] px-3 py-2 text-xs italic text-[#37493D] shadow-2xs"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      )
      continue
    }

    // Bullet points
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={`bullet-${idx}`} className="my-1 flex items-start gap-2 pl-1 text-xs leading-relaxed text-[#2D3B31]">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B7D57]" />
          <div>{renderInline(trimmed.slice(2))}</div>
        </div>
      )
      continue
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numberedMatch) {
      elements.push(
        <div key={`num-${idx}`} className="my-1.5 flex items-start gap-2 pl-1 text-xs leading-relaxed text-[#2D3B31]">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2A4638]/10 text-[10px] font-bold text-[#2A4638]">
            {numberedMatch[1]}
          </span>
          <div>{renderInline(numberedMatch[2])}</div>
        </div>
      )
      continue
    }

    // Regular Paragraph
    elements.push(
      <p key={`p-${idx}`} className="my-1 text-xs leading-relaxed text-[#2D3B31]">
        {renderInline(trimmed)}
      </p>
    )
  }

  if (inTable && tableBuffer.length > 0) {
    elements.push(flushTable(tableBuffer, lines.length))
  }

  return <div className={`space-y-0.5 text-xs text-ink ${className}`}>{elements}</div>
}
