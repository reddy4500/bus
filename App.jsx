import React, { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import * as XLSX from 'xlsx'

const EMPTY_ROW = {
  sno: '',
  name: '',
  vehicleNo: '',
  serTy: '',
  vehModel: '',
  schKms: '',
  optKms: '',
  slabRate: 14.45,
  insuranceReim: 0,
  oilSaved: 0,
  incomeTax: 0,
  penalty: 0,
  lessOthersOil: 0,
}

const number = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

function computeRow(row) {
  const schKms = number(row.schKms)
  const optKms = number(row.optKms)
  const slabRate = number(row.slabRate)
  const insuranceReim = number(row.insuranceReim)
  const oilSaved = number(row.oilSaved)
  const incomeTax = number(row.incomeTax)
  const penalty = number(row.penalty)
  const lessOthersOil = number(row.lessOthersOil)

  const amountPayable = optKms * slabRate
  const totalPayable = amountPayable + insuranceReim + oilSaved
  const totalDeductions = incomeTax + penalty + lessOthersOil
  const netPayable = totalPayable - totalDeductions

  return {
    ...row,
    amountPayable,
    totalPayable,
    totalDeductions,
    netPayable,
  }
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : initialValue
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

export default function App() {
  const [rows, setRows] = useLocalStorage('auditRows', [ { ...EMPTY_ROW, slabRate: 14.45 } ])
  const [filters, setFilters] = useState({ query: '' })

  const computed = useMemo(() => rows.map(computeRow), [rows])

  const totals = useMemo(() => {
    return computed.reduce((acc, r) => {
      acc.schKms += number(r.schKms)
      acc.optKms += number(r.optKms)
      acc.amountPayable += number(r.amountPayable)
      acc.totalPayable += number(r.totalPayable)
      acc.totalDeductions += number(r.totalDeductions)
      acc.netPayable += number(r.netPayable)
      return acc
    }, { schKms:0, optKms:0, amountPayable:0, totalPayable:0, totalDeductions:0, netPayable:0 })
  }, [computed])

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase().trim()
    if (!q) return computed
    return computed.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.vehicleNo || '').toLowerCase().includes(q) ||
      (r.serTy || '').toLowerCase().includes(q) ||
      String(r.vehModel || '').toLowerCase().includes(q)
    )
  }, [computed, filters])

  function updateRow(idx, field, value) {
    setRows(prev => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: value }
      if (field === 'sno' && value === '') {
        copy[idx].sno = idx + 1
      }
      return copy
    })
  }

  function addRow() {
    setRows(prev => [...prev, { ...EMPTY_ROW, sno: (prev.length + 1) }])
  }

  function removeRow(idx) {
    setRows(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, sno: i+1 })))
  }

  function clearAll() {
    if (confirm('Clear all rows?')) setRows([ { ...EMPTY_ROW, slabRate: 14.45, sno: 1 } ])
  }

  function exportToXLSX() {
    const headers = [
      'S NO','name','VEHICLE NO','SER TY','VEH MODEL','SCH KMS','OPT KMS','SLAB RATE',
      'AMOUNT PAYABLE','INSURANCE REIM','OIL SAVED','TOTAL PAYABLE','INCOME TAX','PENALTY','LESS OTHERS(OIL)','TOTAL DEDUCTIONS','NET PAYABLE'
    ]
    const sheetData = [headers]
    computed.forEach(r => {
      sheetData.push([
        r.sno || '',
        r.name || '',
        r.vehicleNo || '',
        r.serTy || '',
        r.vehModel || '',
        number(r.schKms),
        number(r.optKms),
        number(r.slabRate),
        number(r.amountPayable),
        number(r.insuranceReim),
        number(r.oilSaved),
        number(r.totalPayable),
        number(r.incomeTax),
        number(r.penalty),
        number(r.lessOthersOil),
        number(r.totalDeductions),
        number(r.netPayable),
      ])
    })
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    XLSX.utils.book_append_sheet(wb, ws, 'Audit')
    XLSX.writeFile(wb, 'audit_results.xlsx')
  }

  function importFromXLSX(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target.result
      const wb = XLSX.read(data, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 })
      // Try to detect columns by header row
      const header = json[0].map(h => String(h).toLowerCase().trim())
      const rowsData = json.slice(1).filter(r => r.some(x => x !== null && x !== ''))
      const get = (row, key) => {
        const idx = header.findIndex(h => h === key.toLowerCase())
        return idx >= 0 ? row[idx] : ''
      }
      const parsed = rowsData.map((r, i) => ({
        sno: get(r, 'S NO') || i+1,
        name: get(r, 'name'),
        vehicleNo: get(r, 'VEHICLE NO'),
        serTy: get(r, 'SER TY'),
        vehModel: get(r, 'VEH MODEL'),
        schKms: get(r, 'SCH KMS'),
        optKms: get(r, 'OPT KMS'),
        slabRate: get(r, 'SLAB RATE') || 14.45,
        insuranceReim: get(r, 'INSURANCE REIM') || 0,
        oilSaved: get(r, 'OIL SAVED') || 0,
        incomeTax: get(r, 'INCOME TAX') || 0,
        penalty: get(r, 'PENALTY') || 0,
        lessOthersOil: get(r, 'LESS OTHERS(OIL)') || 0,
      }))
      setRows(parsed)
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Calculator</h1>
        <div className="flex gap-2">
          <input type="file" accept=".xlsx,.xls" onChange={importFromXLSX} className="hidden" id="importFile" />
          <label htmlFor="importFile" className="btn btn-secondary cursor-pointer">Import Excel</label>
          <button className="btn btn-secondary" onClick={exportToXLSX}>Export Excel</button>
          <button className="btn btn-danger" onClick={clearAll}>Clear</button>
        </div>
      </header>

      <section className="card">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="grow">
            <label className="label">Search</label>
            <input className="input" placeholder="Search name, vehicle no, type..." value={filters.query} onChange={e => setFilters({ ...filters, query: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={addRow}>+ Add Row</button>
        </div>

        <div className="overflow-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                {['S NO','Name','Vehicle No','Ser Ty','Veh Model','Sch Kms','Opt Kms','Slab Rate','Amount Payable','Insurance Reim','Oil Saved','Total Payable','Income Tax','Penalty','Less Others(Oil)','Total Deductions','Net Payable',''].map(h => (
                  <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2 w-20">
                    <input className="input" value={r.sno} onChange={e => updateRow(idx, 'sno', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 min-w-40">
                    <input className="input" value={r.name} onChange={e => updateRow(idx, 'name', e.target.value)} placeholder="name" />
                  </td>
                  <td className="px-3 py-2 min-w-40">
                    <input className="input" value={r.vehicleNo} onChange={e => updateRow(idx, 'vehicleNo', e.target.value)} placeholder="AP 39 ..." />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input className="input" value={r.serTy} onChange={e => updateRow(idx, 'serTy', e.target.value)} placeholder="PP/PO/PE/PV" />
                  </td>
                  <td className="px-3 py-2 w-32">
                    <input className="input" value={r.vehModel} onChange={e => updateRow(idx, 'vehModel', e.target.value)} placeholder="2022" />
                  </td>
                  <td className="px-3 py-2 w-32">
                    <input type="number" className="input" value={r.schKms} onChange={e => updateRow(idx, 'schKms', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-32">
                    <input type="number" className="input" value={r.optKms} onChange={e => updateRow(idx, 'optKms', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input type="number" className="input" value={r.slabRate} onChange={e => updateRow(idx, 'slabRate', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-40">
                    <div className="input bg-gray-50">{(r.amountPayable ?? 0).toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-2 w-32">
                    <input type="number" className="input" value={r.insuranceReim} onChange={e => updateRow(idx, 'insuranceReim', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input type="number" className="input" value={r.oilSaved} onChange={e => updateRow(idx, 'oilSaved', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-40">
                    <div className="input bg-gray-50">{(r.totalPayable ?? 0).toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input type="number" className="input" value={r.incomeTax} onChange={e => updateRow(idx, 'incomeTax', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input type="number" className="input" value={r.penalty} onChange={e => updateRow(idx, 'penalty', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-36">
                    <input type="number" className="input" value={r.lessOthersOil} onChange={e => updateRow(idx, 'lessOthersOil', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 w-40">
                    <div className="input bg-gray-50">{(r.totalDeductions ?? 0).toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-2 w-40">
                    <div className="input bg-gray-50 font-semibold">{(r.netPayable ?? 0).toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-2 w-20">
                    <button className="btn btn-danger" onClick={() => removeRow(idx)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-2" colSpan={5}>Totals</td>
                <td className="px-3 py-2">{totals.schKms.toFixed(0)}</td>
                <td className="px-3 py-2">{totals.optKms.toFixed(0)}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2">{totals.amountPayable.toFixed(2)}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2">{totals.totalPayable.toFixed(2)}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2">{totals.totalDeductions.toFixed(2)}</td>
                <td className="px-3 py-2">{totals.netPayable.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card h-[380px]">
          <h2 className="text-lg font-semibold mb-2">Net Payable by Vehicle</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered.map(r => ({ name: r.vehicleNo || r.name || String(r.sno || ''), value: r.netPayable }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Net Payable" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[380px]">
          <h2 className="text-lg font-semibold mb-2">KMS: OPT vs SCH</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filtered.map(r => ({ name: r.vehicleNo || r.name || String(r.sno || ''), sch: number(r.schKms), opt: number(r.optKms) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sch" name="SCH KMS" />
              <Line type="monotone" dataKey="opt" name="OPT KMS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <footer className="text-xs text-gray-500 text-center py-4">
        Built with React, Vite, Tailwind, Recharts and xlsx. Data is saved to your browser (localStorage).
      </footer>
    </div>
  )
}
