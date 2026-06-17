let dados = [];

// =========================
// GRÁFICOS
// =========================

const chartEixo = new Chart(
    document.getElementById('graficoEixo'),
    {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Deflexão D0',
                data: []
            }]
        }
    }
);

const chartBD = new Chart(
    document.getElementById('graficoBD'),
    {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Deflexão D0',
                data: []
            }]
        }
    }
);

const chartBE = new Chart(
    document.getElementById('graficoBE'),
    {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Deflexão D0',
                data: []
            }]
        }
    }
);

// =========================
// ADICIONAR MEDIÇÃO
// =========================

function addRow() {

    const est = document.getElementById('estaca').value;
    const posicao = document.getElementById('posicao').value;

    const l0 = +document.getElementById('l0').value;
    const l25 = +document.getElementById('l25').value;
    const lf = +document.getElementById('lf').value;

    const d0 = (l0 - lf) * 2;
    const d25 = (l25 - lf) * 2;

    const r = d0 ? d25 / d0 : 0;

    const diag =
    r < 0.3 ? 'Superficial'
    : r < 0.6 ? 'Intermediário'
    : 'Profundo';

dados.push({
    est,
    posicao,
    d0,
    d25,
    r,
    diag
});

    renderTabela();
    atualizarEstatisticas();
    atualizarGraficos();

    document.getElementById('estaca').value = '';
    document.getElementById('l0').value = '';
    document.getElementById('l25').value = '';
    document.getElementById('lf').value = '';
}

// =========================
// TABELA
// =========================

function renderTabela() {

    const tbody = document.querySelector('#tbl tbody');

    tbody.innerHTML = '';

    dados.forEach((item, index) => {

        tbody.innerHTML += `
        <tr>
            <td>${item.est}</td>
            <td>${item.posicao}</td>
            <td>${item.d0.toFixed(2)}</td>
            <td>${item.d25.toFixed(2)}</td>
            <td>${item.r.toFixed(2)}</td>
            <td>${item.diag}</td>
            <td>
                <button onclick="excluirLinha(${index})">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
        `;
    });
}

// =========================
// EXCLUIR
// =========================

function excluirLinha(index) {

    dados.splice(index, 1);

    renderTabela();
    atualizarEstatisticas();
    atualizarGraficos();
}

// =========================
// ESTATÍSTICAS
// =========================

function atualizarEstatisticas() {

    if (dados.length === 0) {

        document.getElementById('stats').innerHTML = '';

        return;
    }

    const valores = dados.map(x => x.d0);

    const media =
        valores.reduce((a, b) => a + b, 0) / valores.length;

    const dp = Math.sqrt(
        valores.reduce(
            (s, x) => s + (x - media) ** 2,
            0
        ) / valores.length
    );

    const cv = (dp / media) * 100;

    const k =
        +document.getElementById('k').value;

    const dc =
        media + (k * dp);

    document.getElementById('stats').innerHTML = `
        <b>Média:</b> ${media.toFixed(2)}<br>
        <b>DP:</b> ${dp.toFixed(2)}<br>
        <b>CV:</b> ${cv.toFixed(2)}%<br>
        <b>Dc:</b> ${dc.toFixed(2)}
    `;
}

// =========================
// GRÁFICOS
// =========================

function atualizarGraficos() {

    const eixo =
        dados.filter(
            x => x.posicao === 'Eixo'
        );

    const bd =
        dados.filter(
            x => x.posicao === 'Bordo Direito'
        );

    const be =
        dados.filter(
            x => x.posicao === 'Bordo Esquerdo'
        );

    atualizarGrafico(chartEixo, eixo);

    atualizarGrafico(chartBD, bd);

    atualizarGrafico(chartBE, be);
}

function atualizarGrafico(chart, lista) {

    chart.data.labels =
        lista.map(x => x.est);

    chart.data.datasets[0].data =
        lista.map(x => x.d0);

    chart.update();
}

// =========================
// PDF
// =========================

async function gerarPDF() {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF(
        'p',
        'mm',
        'a4'
    );

    const canvas =
        await html2canvas(
            document.getElementById('relatorio')
        );

    const img =
        canvas.toDataURL('image/png');

    const largura = 210;

    const altura =
        (canvas.height * largura) /
        canvas.width;

    pdf.addImage(
        img,
        'PNG',
        0,
        0,
        largura,
        altura
    );

    pdf.save(
        'relatorio_viga_benkelman.pdf'
    );
}