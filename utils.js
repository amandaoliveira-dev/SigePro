// Arquivo: utils.js

/**
 * Converte uma string para o formato Title Case,
 * mantendo pequenas palavras de ligação em minúsculas.
 * Ex: "o senhor dos aneis" -> "O Senhor dos Anéis"
 */
function toTitleCase(str) {
    if (!str) return '';
    const smallWords = /^(a|e|o|um|uma|com|de|da|do|dos|em|por|para)$/i;
    return str.toString().toLowerCase().split(' ').map((word, index) => {
        if (index > 0 && smallWords.test(word)) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Carrega dados do localStorage de forma segura.
 * Se os dados estiverem corrompidos, limpa a chave e retorna null.
 * @param {string} key A chave para buscar no localStorage.
 * @returns {object|null} O objeto parseado ou null.
 */
function loadData(key) {
    const data = localStorage.getItem(key);
    if (!data) {
        return null;
    }
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error(`ERRO: Dado corrompido encontrado no localStorage para a chave: "${key}"`);
        localStorage.removeItem(key);
        return null;
    }
}

/**
 * Salva dados no localStorage.
 * @param {string} key A chave para salvar no localStorage.
 * @param {any} data O dado a ser salvo (será convertido para JSON).
 */
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Formata um número para a moeda brasileira (BRL).
 * @param {number} value O valor numérico a ser formatado.
 * @returns {string} O valor formatado como moeda.
 */
function formatCurrency(value) {
    return typeof value === 'number' ? value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }) : String(value);
}
// ADICIONE ESTA FUNÇÃO NO FINAL DO ARQUIVO utils.js

function generateDocumentHTML(type) {
    const docNumber = lastSaleData.recibo || Date.now().toString().slice(-6);
    let clienteHtml = `<p><strong>CLIENTE:</strong> ${toTitleCase(lastSaleData.cliente.nome)}</p>`;
    if (lastSaleData.cliente.cpf) {
        clienteHtml += `<p><strong>CPF:</strong> ${lastSaleData.cliente.cpf}</p><p><strong>Telefone:</strong> ${lastSaleData.cliente.telefone}</p><p><strong>Endereço:</strong> ${toTitleCase(lastSaleData.cliente.rua)}, ${lastSaleData.cliente.numero} - ${toTitleCase(lastSaleData.cliente.bairro)}, ${toTitleCase(lastSaleData.cliente.cidade)}/${lastSaleData.cliente.uf.toUpperCase()}</p>`;
    }

    if (type === 'nf') {
        let itemsHtml = '';
        lastSaleData.itens.filter(item => !item.isDiscount).forEach(item => {
            itemsHtml += `<tr><td>${item.codigo}</td><td>${toTitleCase(item.nome)}</td><td>${item.quantidade}</td><td>${formatCurrency(item.preco)}</td><td>${formatCurrency(item.preco * item.quantidade)}</td></tr>`;
        });
        
        let discountsHtml = '';
        const totalDiscountValue = (lastSaleData.subtotal && lastSaleData.total) ? (lastSaleData.subtotal - lastSaleData.total) : 0;

        if (lastSaleData.discounts) {
            if (lastSaleData.discounts.manualItems && lastSaleData.discounts.manualItems.length > 0) {
                lastSaleData.discounts.manualItems.forEach(item => {
                    discountsHtml += `<p class="doc-discount-line">${toTitleCase(item.nome)}: <strong>${formatCurrency(item.preco)}</strong></p>`;
                });
            }
            if (lastSaleData.discounts.couponValue > 0) {
                discountsHtml += `<p class="doc-discount-line">Cupom (${lastSaleData.discounts.couponCode}): <strong>${formatCurrency(-lastSaleData.discounts.couponValue)}</strong></p>`;
            }
            if (lastSaleData.discounts.paymentValue > 0) {
                discountsHtml += `<p class="doc-discount-line">Desconto PIX (5%): <strong>${formatCurrency(-lastSaleData.discounts.paymentValue)}</strong></p>`;
            }
        }
        
        let paymentDetailsHtml = `<p><strong>Forma de Pagamento:</strong> ${lastSaleData.paymentMethod}</p>`;
        if (lastSaleData.paymentMethod === 'Dinheiro' && lastSaleData.valorRecebido > 0) {
            paymentDetailsHtml += `<p><strong>Valor Recebido:</strong> ${formatCurrency(lastSaleData.valorRecebido)}</p><p><strong>Troco:</strong> ${formatCurrency(lastSaleData.troco)}</p>`;
        }
        const pixHtml = lastSaleData.paymentMethod.includes('PIX') ? `<div class="pix-area-doc"><img src="https://i.imgur.com/g8fG1v1.png" alt="QR Code"><p>amanda-games-pix@email.com</p></div>` : '';

        return `<div class="doc-header"><h3>AmanditaGames Store</h3><p>Seu Endereço | Seu Contato</p></div>
                <div class="doc-section"><h4>RECIBO DE VENDA - Nº ${docNumber}</h4><p><strong>Data:</strong> ${new Date(lastSaleData.date).toLocaleString('pt-BR')}</p></div>
                <div class="doc-section"><h4>DADOS DO CLIENTE</h4>${clienteHtml}</div>
                <div class="doc-section"><p><strong>Vendedor:</strong> ${toTitleCase(lastSaleData.vendedor.nome)}</p></div>
                <div class="doc-section"><h4>ITENS DA COMPRA</h4><table class="doc-table"><thead><tr><th>Cód.</th><th>Produto</th><th>Qtd.</th><th>Vlr. Unit.</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table></div>
                <div class="doc-section"><h4>Pagamento</h4><div class="payment-details-grid"><div class="payment-summary-left">
                <p><strong>Subtotal Produtos:</strong> ${formatCurrency(lastSaleData.subtotal || 0)}</p>
                ${totalDiscountValue > 0 ? `<p class="doc-discount-total-line"><strong>Valor Total Descontos:</strong> ${formatCurrency(-totalDiscountValue)}</p>${discountsHtml}` : ''}
                <hr>
                <p class="doc-total-line"><strong>TOTAL PAGO:</strong> <strong>${formatCurrency(lastSaleData.total)}</strong></p>
                ${paymentDetailsHtml}</div>
                <div class="payment-summary-right">${pixHtml}</div></div></div>
                <div class="doc-footer"><p>Obrigado pela preferência!</p></div>`;
    }

    if (type === 'garantia') {
        let itemsGarantiaHtml = '';
        lastSaleData.itens.filter(item => !item.isDiscount).forEach(item => {
            // No admin.js, a variável dbProdutos está disponível. No script.js, usamos mockDatabase.
            // Para unificar, precisamos de uma forma de acessar a lista de produtos.
            // Assumimos que uma variável 'dbProdutos' ou 'mockDatabase' estará disponível no escopo global.
            const listaDeProdutos = typeof dbProdutos !== 'undefined' ? dbProdutos : (typeof mockDatabase !== 'undefined' ? Object.values(mockDatabase) : []);
            const produtoOriginal = listaDeProdutos.find(p => p.codigo.toUpperCase() === item.codigo.toUpperCase());
            
            const serial = produtoOriginal ? produtoOriginal.serial : 'N/A';
            const garantia = produtoOriginal ? produtoOriginal.garantia : 'N/A';
            
            itemsGarantiaHtml += `<tr><td>${toTitleCase(item.nome)}</td><td>${serial}</td><td>${garantia}</td></tr>`;
        });
        return `<div class="doc-header"><h3>AmanditaGames Store</h3><p>Seu Endereço | Seu Contato</p></div>
                <div class="doc-section" style="text-align:center;"><h2>CERTIFICADO DE GARANTIA</h2></div>
                <div class="doc-section"><h4>DADOS DO CLIENTE</h4>${clienteHtml}</div>
                <div class="doc-section"><h4>REFERENTE À VENDA</h4><p><strong>Recibo Nº:</strong> ${docNumber}</p><p><strong>Data da Compra:</strong> ${new Date(lastSaleData.date).toLocaleDateString('pt-BR')}</p></div>
                <div class="doc-section"><h4>PRODUTOS COBERTOS PELA GARANTIA</h4><table class="doc-table"><thead><tr><th>Produto</th><th>Nº de Série</th><th>Garantia</th></tr></thead><tbody>${itemsGarantiaHtml}</tbody></table></div>
                <div class="doc-section"><h4>TERMOS DE GARANTIA</h4>
                <p style="font-size: 11px; text-align: justify; white-space: pre-wrap;">Este certificado é a prova da sua garantia e deve ser apresentado para que o serviço seja validado. O não cumprimento das condições estabelecidas abaixo anula a garantia.

<b>1. Prazos de Garantia</b>
    - Serviços Prestados: 3 (três) meses, a contar da data da conclusão. Cobre defeitos de mão de obra ou falhas relacionadas ao serviço.
    - Produtos Adquiridos: Prazo conforme descrito na tabela acima, a contar da data da compra. Cobre defeitos de fabricação dos produtos.

<b>2. O que a Garantia Não Cobre</b>
    A garantia será invalidada se o defeito for causado por: Mau uso (quedas, batidas, exposição a umidade, etc.), reparos não autorizados por terceiros, ou desgaste natural de componentes.

<b>3. Procedimento para Acionamento</b>
    - O cliente deve entrar em contato com a loja e apresentar este certificado.
    - A loja tem o prazo de até 30 (trinta) dias para realizar o reparo ou a troca do produto/serviço, sem custos adicionais.

<b>4. Serviço de Suporte Técnico:</b> Para problemas não cobertos por esta garantia (ex: limpeza de consoles, otimizações, manutenção), a AmanditaGames Store oferece suporte técnico especializado. Estes serviços são orçados e cobrados separadamente.</p>
                </div>
                <div class="doc-footer" style="margin-top: 50px;"><p>_________________________<br>Assinatura do Responsável</p></div>`;
    }
}