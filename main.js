$(document).ready(function() {
    function ajustarLogo() {
        // Defina o limite de pixels em que a logo começa a bater no botão
        var larguraLimite = 500; 

        if ($(window).width() <= larguraLimite) {
            $('.Logo').addClass('modo-responsivo');
        } else {
            $('.Logo').removeClass('modo-responsivo');
        }
    }

    // Executa assim que a página carrega
    ajustarLogo();

    // Executa sempre que a janela for redimensionada
    $(window).resize(function() {
        ajustarLogo();
    });
});

function AbreMenu() {
    if ($('#MenuSanduicheItens').css('display') === 'none') {
        $('#MenuSanduicheItens').css('display', 'block');
    } else {
        $('#MenuSanduicheItens').css('display', 'none');
    }

}




// Confirmar click para ativar o scanner do QR Code

function BotaoQRCode() {
    if (html5Qrcode) return;

    // 1. O código HTML do scanner
    var codigoScanner = `

        <div class="scanner-target">
            <div class="laser-line"></div>
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
        </div>
        <div id="reader"></div>
    `;

    var Loading = `
        <p id="status-text">Aguardando leitura...</p>
    `;

    var BotaoVoltar = `
        <button class="SetaIndex" onclick="window.location.href = 'index.html'"><img src="FotosPlantas/seta.png" width="29vh"></button>
    `;

    // 2. Insere o código dentro da área desejada
    $('#SetaIndex').html(BotaoVoltar);
    $('#scanner-container').html(codigoScanner);
    $('#loading').html(Loading);
    statusText = document.getElementById('status-text');

    // 3. Remove o botão da tela usando a classe dele
    $('#botaoQRCode, .botaoQRCode').remove();
    $('#MenuSanduiche').remove();

    // 4. Bloqueia os cliques no fundo da página
    $('body').addClass('bloquear-cliques');

    html5Qrcode = new Html5Qrcode("reader");
    html5Qrcode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess
    ).then(() => {
        removerEspelho();
    }).catch(err => {
        console.error("Erro ao iniciar a câmera:", err);
        statusText.innerText = window.isSecureContext
            ? "Não foi possível acessar a câmera. Verifique a permissão do navegador."
            : "A câmera exige uma conexão segura (HTTPS ou localhost).";
    });
}

// Vincula a função ao clique do botão assim que a página carregar
$(document).ready(function() {$(document).on('click', '.botaoQRCode', function() {
        BotaoQRCode();
    });
});

// Scanner QR Code


// Inicializa a instância da biblioteca apontada para a div 'reader'
let html5Qrcode = null;
let statusText = null;

// Função universal para validar, limpar o leitor e redirecionar
function processarResultado(decodedText) {
    if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        statusText.innerText = "Redirecionando...";
        window.location.href = decodedText;
    } else {
        alert("Conteúdo do QR Code:\n\n" + decodedText);
    }
}

// Função de sucesso do Scanner de Câmera
function onScanSuccess(decodedText, decodedResult) {
    html5Qrcode.stop().then(() => {
        processarResultado(decodedText);
    }).catch(() => {
        processarResultado(decodedText);
    });
}

function removerEspelho() {
    const video = document.querySelector('#reader video');
    if (!video) return;

    const aplicar = () => {
        // só mexe se ainda não estiver forçado, para não entrar em loop
        if (video.style.transform !== 'none' ||
            video.style.getPropertyPriority('transform') !== 'important') {
            video.style.setProperty('transform', 'none', 'important');
        }
    };

    aplicar();

    // se a biblioteca tentar espelhar de novo, desfaz
    new MutationObserver(aplicar).observe(video, {
        attributes: true,
        attributeFilter: ['style']
    });
}

// Configurações técnicas de vídeo
const config = { 
    fps: 20,
    qrbox: function(viewfinderWidth, viewfinderHeight) {
        return { width: 320, height: 320 }; 
    },
    aspectRatio: 1.0
    
};

// EVENTOS DO BOTÃO DE UPLOAD (SISTEMA TOTALMENTE ISOLADO)

const fileInput = document.getElementById('qr-input');
const uploadBtn = document.getElementById('upload-btn');

if (uploadBtn && fileInput) {
    // Clique limpo e isolado para abrir os arquivos do celular/computador
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault(); // nao deixa o navegador regarregar a pagina ao clicar no 'a' por exemplo
        e.stopPropagation(); // Impede interferências de outras camadas invisíveis, podendo sair do site
        fileInput.click();    // abre a galeria
    });

    // Gerencia o arquivo assim que ele é escolhido
    //parte que o usúario seleciona o qr code 
    fileInput.addEventListener('change', function(e) {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }


        const imageFile = e.target.files[0];
        statusText.innerText = "Processando imagem...";
        
        // Executa a leitura direta do arquivo estático (Sem depender da webcam rodar)
        html5Qrcode.scanFile(imageFile, true)
            .then(decodedText => {
                // Se a câmera estava em execução paralela, desativa antes do redirecionamento
                if (html5Qrcode.isScanning) {
                    html5Qrcode.stop().then(() => processarResultado(decodedText));
                } else {
                    processarResultado(decodedText);
                }
            })

            /**Obs: pelo cll ta funcionando tambem**/
            .catch(err => {
                statusText.innerText = "Falha na leitura.";
                alert("Não foi possível identificar um QR Code nesta imagem. Certifique-se de que a foto esteja nítida, de perto e com boa iluminação.");
                console.error("Erro interno no motor scanFile:", err);
            });
    });
}

// Estou usando o claude para me auxíliar nessa parte, porque não consegui achar nenhum tutorial que fizesse o autocomplete inline corretamente.
// Autocomplete
$(document).ready(function () {
    const inputBusca    = document.getElementById('inputBusca');
    const inputSugestao = document.getElementById('inputSugestao');
    if (!inputBusca || !inputSugestao) return; // só roda na página do catálogo

    let apagando = false; // marcação pra não re-sugerir quando o usuário apaga

    // Coleta todos os nomes disponíveis a partir dos cards do catalogo
    function obterSugestoes() {
        const nomes = [];
        document.querySelectorAll('.ItemPlanta').forEach(function (item) {
            const cientifico = item.querySelector('.tituloCard')?.textContent.trim();
            const popular    = item.querySelector('.infocat')?.textContent.trim();
            if (cientifico) nomes.push(cientifico);
            if (popular)    nomes.push(popular);
        });
        return nomes;
    }

    // Acha o primeiro nome que começa com o texto digitado (case-insensitive)
    function encontrarSugestao(digitado) {
        if (!digitado) return '';
        const lower = digitado.toLowerCase();
        return obterSugestoes().find(n => n.toLowerCase().startsWith(lower)) || '';
    }

    // Filtra os cards visíveis (mantém o comportamento original)
    function filtrarCards(digitado) {
        const lower = digitado.toLowerCase().trim();
        document.querySelectorAll('.ItemPlanta').forEach(function (item) {
            const nomeCientifico = item.querySelector('.tituloCard')?.textContent.toLowerCase() ?? '';
            const nomePopular    = item.querySelector('.infocat')?.textContent.toLowerCase() ?? '';
            const bate = lower === '' || nomeCientifico.includes(lower) || nomePopular.includes(lower);
            item.style.display = bate ? '' : 'none';
        });
    }

    // Remove a sugestão fantasma
    function limparSugestao() {
        inputSugestao.value = '';
    }

    // Marca que o usuário está apagando (antes do caractere ser removido)
    inputBusca.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            apagando = true;
            limparSugestao();
        }

        // Enter ou → aceita a sugestão
        if ((e.key === 'Enter' || e.key === 'ArrowRight') && inputSugestao.value) {
            inputBusca.value = inputSugestao.value;
            limparSugestao();
            filtrarCards(inputBusca.value);
            e.preventDefault();
        }

        // Escape limpa tudo
        if (e.key === 'Escape') {
            limparSugestao();
        }
    });

    // Evento principal: digitação
    inputBusca.addEventListener('input', function () {
        const digitado = this.value;

        filtrarCards(digitado);

        if (apagando) {
            apagando = false;
            limparSugestao();
            return;
        }

        if (digitado === '') {
            limparSugestao();
            return;
        }

        const sugestao = encontrarSugestao(digitado);
        // Mostra o nome completo no input fantasma (parte digitada + continuação em verde)
        inputSugestao.value = sugestao || digitado;
    });

    // Clique fora: limpa sugestão
    document.addEventListener('click', function (e) {
        if (e.target !== inputBusca) limparSugestao();
    });
});