// --- Utility Functions ---
function parseNumber(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

function formatCurrency(value) {
    return value.toFixed(2);
}

// --- Add Row ---
function addRow() {
    const tableBody = document.getElementById('audit-table-body');
    const rowCount = tableBody.rows.length + 1;

    const row = tableBody.insertRow();

    row.innerHTML = `
        <td>${rowCount}</td>
        <td contenteditable="true" data-col="emp-name"></td>
        <td contenteditable="true" data-col="emp-code"></td>
        <td contenteditable="true" data-col="opt-kms" oninput="updateRow(this)">0</td>
        <td contenteditable="true" data-col="slab-rate" oninput="updateRow(this)">0</td>
        <td data-col="amount-payable">0.00</td>
        <td contenteditable="true" data-col="ins-reim" oninput="updateRow(this)">0</td>
        <td contenteditable="true" data-col="oil-saved" oninput="updateRow(this)">0</td>
        <td data-col="total-payable">0.00</td>
        <td contenteditable="true" data-col="income-tax" oninput="updateRow(this)">0</td>
        <td contenteditable="true" data-col="penalty" oninput="updateRow(this)">0</td>
        <td contenteditable="true" data-col="less-others" oninput="updateRow(this)">0</td>
        <td data-col="total-deductions">0.00</td>
        <td data-col="net-payable">0.00</td>
    `;
}

// --- Update Row ---
function updateRow(cellElement) {
    const row = cellElement.closest('tr');
    if (!row) return;

    const optKms = parseNumber(row.querySelector('[data-col="opt-kms"]').textContent);
    const slabRate = parseNumber(row.querySelector('[data-col="slab-rate"]').textContent);
    const insReim = parseNumber(row.querySelector('[data-col="ins-reim"]').textContent);
    const oilSaved = parseNumber(row.querySelector('[data-col="oil-saved"]').textContent);
    const incomeTax = parseNumber(row.querySelector('[data-col="income-tax"]').textContent);
    const penalty = parseNumber(row.querySelector('[data-col="penalty"]').textContent);
    const lessOthers = parseNumber(row.querySelector('[data-col="less-others"]').textContent);

    const amountPayable = optKms * slabRate;
    const totalPayable = amountPayable + insReim + oilSaved;
    const totalDeductions = incomeTax + penalty + lessOthers;
    const netPayable = totalPayable - totalDeductions;

    row.querySelector('[data-col="amount-payable"]').textContent = formatCurrency(amountPayable);
    row.querySelector('[data-col="total-payable"]').textContent = formatCurrency(totalPayable);
    row.querySelector('[data-col="total-deductions"]').textContent = formatCurrency(totalDeductions);
    row.querySelector('[data-col="net-payable"]').textContent = formatCurrency(netPayable);

    updateTotals();
}

// --- Update Totals ---
function updateTotals() {
    let totals = {
        amountPayable: 0,
        insReim: 0,
        oilSaved: 0,
        totalPayable: 0,
        incomeTax: 0,
        penalty: 0,
        lessOthers: 0,
        totalDeductions: 0,
        netPayable: 0
    };

    document.querySelectorAll('#audit-table-body tr').forEach(row => {
        totals.amountPayable += parseNumber(row.querySelector('[data-col="amount-payable"]').textContent);
        totals.insReim += parseNumber(row.querySelector('[data-col="ins-reim"]').textContent);
        totals.oilSaved += parseNumber(row.querySelector('[data-col="oil-saved"]').textContent);
        totals.totalPayable += parseNumber(row.querySelector('[data-col="total-payable"]').textContent);
        totals.incomeTax += parseNumber(row.querySelector('[data-col="income-tax"]').textContent);
        totals.penalty += parseNumber(row.querySelector('[data-col="penalty"]').textContent);
        totals.lessOthers += parseNumber(row.querySelector('[data-col="less-others"]').textContent);
        totals.totalDeductions += parseNumber(row.querySelector('[data-col="total-deductions"]').textContent);
        totals.netPayable += parseNumber(row.querySelector('[data-col="net-payable"]').textContent);
    });

    document.getElementById('total-amount-payable').textContent = formatCurrency(totals.amountPayable);
    document.getElementById('total-ins-reim').textContent = formatCurrency(totals.insReim);
    document.getElementById('total-oil-saved').textContent = formatCurrency(totals.oilSaved);
    document.getElementById('total-payable').textContent = formatCurrency(totals.totalPayable);
    document.getElementById('total-income-tax').textContent = formatCurrency(totals.incomeTax);
    document.getElementById('total-penalty').textContent = formatCurrency(totals.penalty);
    document.getElementById('total-less-others').textContent = formatCurrency(totals.lessOthers);
    document.getElementById('total-deductions').textContent = formatCurrency(totals.totalDeductions);
    document.getElementById('total-net-payable').textContent = formatCurrency(totals.netPayable);
}

// --- Export to Excel ---
function exportToExcel() {
    alert("Excel export function can be added using SheetJS or similar libraries.");
}

// --- Export to PDF ---
function exportToPDF() {
    alert("PDF export function can be added using jsPDF or similar libraries.");
}
