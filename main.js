
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






//autocomplete










































//autocomplete do Matheus que eu não consigo mexer

/*

//Agora a pior parteeee(Auto complete) (tentar a logica do py )
const buscarInput = document.getElementById("campo_busca");
const completa= document.getElementById("auto_complete");
const listaPlantas = document.getElementById("Lista_Plantas");
const itensLi = listaPlantas.querySelectorAll('li');
//.trim() limpa espaços invisiveis,map passa os itens e tranforma em outra coisa,li.textContent ignora as tags
const plantas = Array.from(itensLi).map(li => li.textContent.trim());
function FiltrarPlantas(){
    //toLowerCase deixa tudo minusculo 
    const TextoDigitado = buscarInput.value.toLowerCase();
    //redesenha a lista
    listaPlantas.innerHTML = '';
     // Se o input estiver vazio, esconde a caixinha e para a função
    if (TextoDigitado === ""){
        completa.style.display = 'none';
        return ;
    }
    //filter apssa em todos os itens, planta => significa para cada planta, o includes() olha se oque foi digitado é o mesmo inicio das plantas na lista/ul
    const plantasFiltradas = plantas.filter(planta => 
        planta.toLowerCase().includes(TextoDigitado)
    );
    //se achou alguma planta
    if (plantasFiltradas.length > 0) {
        plantasFiltradas.forEach(planta => {
            //cria ula li que corresponde com oque foi digitado
            const li = document.createElement('li');
            li.textContent = planta;
          // Evento: Quando clicar na planta, ela vai para o input
            li.addEventListener('click', () => {
                buscarInput.value = planta;
                completa.style.display = 'none'; // Esconde a lista
            });
            listaPlantas.appendChild(li);
        });
        completa.style.display = 'block'; 
        } else {
         // ESCONDE a lista se o filtro não encontrar nenhuma planta
            completa.style.display = 'none';
        //essa chave fecha o if
    }
}
buscarInput.addEventListener('input', FiltrarPlantas);
// Pega a ul pelo queryselector
const lista = document.querySelector('#auto_complete ul');

//  Transforma os itens da (li) em uma lista que pro Js  mexer
const itens = Array.from(lista.querySelectorAll('li'));
//Ordena as plantas de A a Z  (ignora maiúsculas e acentos por causa do Sensitivity:base)
// o sort() organiza a fila com base no  Sensitivity:base
//localeCompare compara o a e o b
itens.sort((a, b) => {
    return a.textContent.localeCompare(b.textContent, 'pt-BR', { sensitivity: 'base' });
});
// Apaga a ordem antiga da tela
// inner muda todo o conteúdo para vazio 
lista.innerHTML = '';

//Coloca as plantas de volta, agora na ordem alfabética certinha
itens.forEach(item => lista.appendChild(item));
//aparecer apenas a  planta digitada
const pesquisa = document.getElementById("caixa_pesquisa");
const idPlanta = ["duranta erecta","adenium","psidium guajava l","mangifera indica l"]
const plantasMinusculo = idPlanta.map(planta => planta.toLowerCase());
pesquisa.addEventListener('input', () => {
    const textoDigitado = pesquisa.value.toLowerCase().trim();
    listaPlantas.forEach(idPlanta => {
        const elemento = document.getElementById(idPlanta);

if (elemento) {
    if (textoDigitado === "") {
        elemento.style.display = 'flex';
    } 
        // Se o ID da planta for IGUAL ao que foi digitado, REMOVE 'escondido' (o elemento fica)
        // Se for DIFERENTE, ADICIONA 'escondido' (o elemento some)
    else if (idPlanta.toLowerCase().trim().startsWith(textoDigitado)){
        elemento.style.display = 'flex';
    }
    else {
        elemento.style.display = 'none';
    }
}
    });    
});

*/