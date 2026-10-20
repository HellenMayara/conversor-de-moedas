const campoValor = document.getElementById("valor");
const selectDe = document.getElementById("de");
const selectPara = document.getElementById("para");
const botaoConverter = document.getElementById("converter");
const botaoInverter = document.getElementById("inverter");
const resultado = document.getElementById("resultado");
const atualizacao = document.getElementById("atualizacao");

const moedas = {
        BRL: "Real brasileiro",
        USD: "Dólar americano",
        EUR: "Euro",
        GBP: "Libra esterlina",
        ARS: "Peso argentino",
        JPY: "Iene japonês",
        CAD: "Dólar canadense",
        AUD: "Dólar australiano",
        CHF: "Franco suíço",
        CNY: "Yuan chinês"
};

function preencherMoedas () {
    for (const codigo in moedas) {
        const opcaoDe = document.createElement("option");
        opcaoDe.value = codigo;
        opcaoDe.textContent = codigo + " - " + moedas[codigo];
        selectDe.appendChild(opcaoDe);

        const opcaoPara = document.createElement("option");
        opcaoPara.value = codigo;
        opcaoPara.textContent = codigo + " - " + moedas[codigo];
        selectPara.appendChild(opcaoPara);
    }

    selectDe.value = "USD";
    selectPara.value  = "BRL";
}

preencherMoedas();

async function converter() {
    const valor = lerValor(campoValor.value);
    const de = selectDe.value;
    const para = selectPara.value;


    if (isNaN(valor) || valor <=0) {
        resultado.className = "resultado erro!";
        resultado.textContent = "Digite um valor maior que zero.";
        return;
    }

    if (de === para) {
        resultado.className = "resultado";
        resultado.textContent = formatar(valor, para);
        atualizacao.textContent = "";
    }

    botaoConverter.desabled = true;
    botaoConverter.textContent = "Convertendo...";
    resultado.className = "resultado";
    resultado.textContent = "";

    try {
        const resposta = await fetch("https://economia.awesomeapi.com.br/last/" + de + "-" + para);

        if (!resposta.ok) {
            throw new Error("Resposta inválida da API");
        }

        const dados = await resposta.json();
        const chave = de + para;
        const cotacao = parseFloat(dados[chave].bid);
        const convertido = valor * cotacao;

        resultado.className = "resultado";
        resultado.textContent = formatar(convertido, para);

        const data = new Date(dados[chave].create_date);
        atualizacao.textContent = "Cotação de " + data.toLocaleString("pt-BR");
    
    } catch (erro) {
        resultado.className = "resultado erro";
        resultado.textContent = "Não foi possível buscar a cotação. Verifique sua conexão e tente novamente.";
        atualizacao.textContent = "";

    } finally {
        botaoConverter.desabled = false;
        botaoConverter.textContent = "Converter";
    }
}

function formatar(valor, moeda) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: moeda
    });
}

botaoConverter.addEventListener("click", converter);

botaoInverter.addEventListener("click", function () {
    const temporario = selectDe.value;
    selectDe.value = selectPara.value;
    selectPara.value = temporario;
    converter();
});

campoValor.addEventListener("input", function () {
    campoValor.value = formatarEntrada(campoValor.value);
});

function formatarEntrada(texto) {
    let digitos = texto.replace(/\D/g, "");

    if (digitos === "") {
        return "";
    }

    digitos = digitos.slice(0, 11);

    while (digitos.length < 3) {
        digitos = "0" + digitos;
    }

    digitos = digitos.replace(/^0+(?=\d{3})/, "");

    const centavos = digitos.slice(-2);
    const inteiros = digitos.slice(0, -2);
    const comPontos = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return comPontos + "," + centavos;
}

function lerValor(texto) {
    const limpo = texto.replace(/\./g, "").replace(",", ".");
    return parseFloat(limpo);
}

converter();