import * as JsPDF from 'jspdf';
import 'jspdf-autotable';

function addKpirPage(pdf, year, month, pageNo, data, pageSum, monthSum, yearSum, prevYearSum) {
    pdf.addPage();
    function didParseCell(cellHookData) {
        if (cellHookData.section === 'foot') {
            switch (cellHookData.column.dataKey) {
            case 'sell':
            case 'otherIncome':
            case 'sumIncome':
            case 'buy':
            case 'otherCosts':
            case 'otherPays':
            case 'otherExpenses':
            case 'sumExpenses':
            case 'investVal':
                switch (cellHookData.row.raw.evno) {
                case 'pageSum':
                    cellHookData.cell.text = String(pageSum[cellHookData.column.dataKey].toFixed(2));
                    break;
                case 'monthSum':
                    cellHookData.cell.text = String(monthSum[cellHookData.column.dataKey].toFixed(2));
                    break;
                case 'yearSum':
                    cellHookData.cell.text = String(yearSum[cellHookData.column.dataKey].toFixed(2));
                    break;
                case 'prevYearSum':
                    cellHookData.cell.text = String(prevYearSum[cellHookData.column.dataKey].toFixed(2));
                    break;
                default:
                    cellHookData.cell.text = 'error';
                }
                break;
            default:
              // ignore
            }
        }
    }
    pdf.text(`Podatkowa Ksiega Przychodow i Rozchodow, ${month} ${year}, strona nr ${pageNo}`, 14, 15);
    const options = {
        didParseCell: didParseCell,
        theme: 'grid',
        tableWidth: '100%',
        styles: {
            cellPadding: 0.3,
            fontSize: 4,
            lineWidth: 0.1,
            lineColor: [66, 66, 66]
        },
        startY: 20,
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 4,
            lineWidth: 0.1,
            lineColor: [66, 66, 66]
        },
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 4,
            lineWidth: 0.1,
            lineColor: [66, 66, 66]
        },
        columnStyles: {
            no: {overflow: 'visible'},
            sell: {halign: 'right'},
            otherIncome: {halign: 'right'},
            sumIncome: {halign: 'right'},
            buy: {halign: 'right'},
            otherCosts: {halign: 'right'},
            otherPays: {halign: 'right'},
            otherExpenses: {halign: 'right'},
            sumExpenses: {halign: 'right'},
            investVal: {halign: 'right'}
        },
        head: [{
            no: {content: 'Lp', rowSpan: 2, styles: {valign: 'bottom'}},
            date: {content: 'Data', rowSpan: 2, styles: {valign: 'bottom'}},
            evno: {content: 'Nr dowodu', rowSpan: 2, styles: {valign: 'bottom'}},

            cname: {content: 'Kontrachent', colSpan: 2, styles: {halign: 'center'}},
            caddress: 'Adres',

            desc: {content: 'Opis zdarzenia gospodarczego', rowSpan: 2, styles: {valign: 'bottom'}},

            sell: {content: 'Przychód', colSpan: 3, styles: {halign: 'center'}},
            otherIncome: 'Poz. przychody',
            sumIncome: 'Razem przychód (7+8)',

            buy: {content: 'Zak. tow. handl. i mat.', rowSpan: 2, styles: {valign: 'bottom'}},
            otherCosts: {content: 'Koszty ub. zak.', rowSpan: 2, styles: {valign: 'bottom'}},

            otherPays: {content: 'Wydatki', colSpan: 4, styles: {halign: 'center'}},
            otherExpenses: 'Poz. wydatki',
            sumExpenses: 'Razem wydatki (12+13)',
            unknown: '',

            investDesc: {content: 'Koszty dz. b-r', colSpan: 2, styles: {halign: 'center'}},
            investVal: 'Wartość',

            notes: {content: 'Uwagi', rowSpan: 2, styles: {valign: 'bottom'}}
        }, {
            no: '',
            date: '',
            evno: '',

            cname: 'Nazwa',
            caddress: 'Adres',

            desc: '',

            sell: 'Sprz. tow. i us.',
            otherIncome: 'Poz. przychody',
            sumIncome: 'Razem przychód (7 + 8)',

            buy: '',
            otherCosts: '',

            otherPays: 'Wynagr. w got. i nat.',
            otherExpenses: 'Poz. wydatki',
            sumExpenses: 'Razem wydatki',
            unknown: '',

            investDesc: 'Opis',
            investVal: 'Wart  .',

            notes: 'Uwagi'
        },
        {
            no: 1,
            date: 2,
            evno: 3,
            cname: 4,
            caddress: 5,
            desc: 6,
            sell: 7,
            otherIncome: 8,
            sumIncome: 9,
            buy: 10,
            otherCosts: 11,
            otherPays: 12,
            otherExpenses: 13,
            sumExpenses: 14,
            unknown: 15,
            investDesc: {content: 16, colSpan: 2, styles: {halign: 'center'}},
            investVal: 'Wartość',
            notes: 17
        }],
        body: data,
        foot: [{
            no: {content: 'Suma strony', colSpan: 6, styles: {halign: 'right'}},
            date: '',
            evno: 'pageSum',
            cname: '',
            caddress: '',
            desc: '',
            sell: {ction: 'pageSum', content: 0, styles: {halign: 'right'}},
            otherIncome: {action: 'pageSum', content: 0, styles: {halign: 'right'}},
            sumIncome: {content: 0, styles: {halign: 'right'}},

            buy: {content: 0, styles: {halign: 'right'}},
            otherCosts: {content: 0, styles: {halign: 'right'}},

            otherPays: {content: 0, styles: {halign: 'right'}},
            otherExpenses: {content: 0, styles: {halign: 'right'}},
            sumExpenses: {content: 0, styles: {halign: 'right'}},
            unknown: '',

            investDesc: '',
            investVal: {content: 0, styles: {halign: 'right'}},

            notes: ''
        }, {
            no: {content: 'Przeniesienie z poprz. str.', colSpan: 6, styles: {halign: 'right'}},
            date: '',
            evno: 'prevYearSum',
            cname: '',
            caddress: '',
            desc: '',
            sell: {content: 0, styles: {halign: 'right'}},
            otherIncome: {content: 0, styles: {halign: 'right'}},
            sumIncome: {content: 0, styles: {halign: 'right'}},

            buy: {content: 0, styles: {halign: 'right'}},
            otherCosts: {content: 0, styles: {halign: 'right'}},

            otherPays: {content: 0, styles: {halign: 'right'}},
            otherExpenses: {content: 0, styles: {halign: 'right'}},
            sumExpenses: {content: 0, styles: {halign: 'right'}},
            unknown: '',

            investDesc: '',
            investVal: {content: 0, styles: {halign: 'right'}},

            notes: ''
        },
        {
            no: {content: 'Razem od pocz. mies.', colSpan: 6, styles: {halign: 'right'}},
            date: '',
            evno: 'monthSum',
            cname: '',
            caddress: '',
            desc: '',
            sell: {content: 0, styles: {halign: 'right'}},
            otherIncome: {content: 0, styles: {halign: 'right'}},
            sumIncome: {content: 0, styles: {halign: 'right'}},

            buy: {content: 0, styles: {halign: 'right'}},
            otherCosts: {content: 0, styles: {halign: 'right'}},

            otherPays: {content: 0, styles: {halign: 'right'}},
            otherExpenses: {content: 0, styles: {halign: 'right'}},
            sumExpenses: {content: 0, styles: {halign: 'right'}},
            unknown: '',

            investDesc: '',
            investVal: {content: 0, styles: {halign: 'right'}},

            notes: ''
        }, {
            no: {content: 'Razem od pocz. roku', colSpan: 6, styles: {halign: 'right'}},
            date: '',
            evno: 'yearSum',
            cname: '',
            caddress: '',
            desc: '',
            sell: {content: 0, styles: {halign: 'right'}},
            otherIncome: {content: 0, styles: {halign: 'right'}},
            sumIncome: {content: 0, styles: {halign: 'right'}},

            buy: {content: 0, styles: {halign: 'right'}},
            otherCosts: {content: 0, styles: {halign: 'right'}},

            otherPays: {content: 0, styles: {halign: 'right'}},
            otherExpenses: {content: 0, styles: {halign: 'right'}},
            sumExpenses: {content: 0, styles: {halign: 'right'}},
            unknown: '',

            investDesc: '',
            investVal: {content: 0, styles: {halign: 'right'}},

            notes: ''
        }]
    };

    pdf.autoTable(options);
    // counters.prevPageSum = counters.yearSum;
}

function sumarizePage(list) {
    const result = {
        sell: 0,
        otherIncome: 0,
        sumIncome: 0,
        buy: 0,
        otherCosts: 0,
        otherPays: 0,
        otherExpenses: 0,
        sumExpenses: 0,
        investVal: 0
    };
    list.forEach(record => {
        Object.keys(result).forEach(key => {
            result[key] += parseFloat(record[key]);
        });
    });
    return result;
}
function joinSumaries(summaryA, summaryB) {
    const result = Object.assign({}, summaryA);
    Object.keys(result).forEach(key => {
        result[key] += parseFloat(summaryB[key]);
    });
    return result;
}
function kpir(calculator) {
    // const counters = new Counters(calculator.year);
    const filename = `${calculator.getFilename()}.pdf`;
    const pdf = new JsPDF('p'); // OK, created
    
    pdf.text(`Podatkowa Ksiega Przychodow i Rozchodow, ${calculator.year}r.`, 14, 15);
    pdf.setFont('helvetica');
    pdf.setFontSize(8);

    const months = [
        {name: 'styczen', no: '01'},
        {name: 'luty', no: '02'},
        {name: 'marzec', no: '03'},
        {name: 'kwiecien', no: '04'},
        {name: 'maj', no: '05'},
        {name: 'czerwiec', no: '06'},
        {name: 'lipiec', no: '07'},
        {name: 'sierpien', no: '08'},
        {name: 'wrzesien', no: '09'},
        {name: 'pazdziernik', no: '10'},
        {name: 'listopad', no: '11'},
        {name: 'grudzien', no: '12'}
    ];
    let pageNo = 0;

    let prevYearSum = {
        sell: 0,
        otherIncome: 0,
        sumIncome: 0,
        buy: 0,
        otherCosts: 0,
        otherPays: 0,
        otherExpenses: 0,
        sumExpenses: 0,
        investVal: 0
    };
    let yearSum = {
        sell: 0,
        otherIncome: 0,
        sumIncome: 0,
        buy: 0,
        otherCosts: 0,
        otherPays: 0,
        otherExpenses: 0,
        sumExpenses: 0,
        investVal: 0
    };
    months.forEach(month => {
        let monthSum = {
            sell: 0,
            otherIncome: 0,
            sumIncome: 0,
            buy: 0,
            otherCosts: 0,
            otherPays: 0,
            otherExpenses: 0,
            sumExpenses: 0,
            investVal: 0
        };
        const monthData = calculator.getKPIRData(`${calculator.year}-${month.no}`);
        let i = 0;
        const year = calculator.year;
        const pageLineLimit = 50;
        let pageData = [];
        let monthName = 'errror';
        for (i = 0; i < monthData.length; i += 1) {
            pageData.push(monthData[i]);
            if (
                pageData.length >= pageLineLimit ||
                i === monthData.length - 1
            ) {
                pageNo += 1;
                monthName = month.name;
                const pageSum = sumarizePage(pageData);
                monthSum = joinSumaries(monthSum, pageSum);
                yearSum = joinSumaries(yearSum, pageSum);
                addKpirPage(pdf, year, monthName, pageNo, pageData, pageSum, monthSum, yearSum, prevYearSum);
                prevYearSum = Object.assign({}, yearSum);
                pageData = [];
            }
        }
        if (!monthData.length) {
            pageNo += 1;
            monthName = month.name;
            const pageSum = sumarizePage(pageData);
            monthSum = joinSumaries(monthSum, pageSum);
            yearSum = joinSumaries(yearSum, pageSum);
            addKpirPage(pdf, year, monthName, pageNo, pageData, pageSum, monthSum, yearSum, prevYearSum);
            prevYearSum = Object.assign({}, yearSum);
        }
    });
    pdf.save(filename);
}
// console.log('operationQueue', operationQueue);
// operationQueue.on('last-calculator-finish', () => {
//     // console.log('kpir-lastCalculator', lastCalculator);
// //     if (lastCalculator) {
//     setTimeout(() => kpir(operationQueue.calculators[2018]), 1000);
// //     }
// });
// setTimeout(() => kpir(operationQueue.calculators[2018]), 6000);
export default kpir;
