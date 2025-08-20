document.addEventListener('DOMContentLoaded', () => {
    // BANCOS DE DADOS FALSOS (PARA SIMULAÇÃO)
    const mockDatabase = { "P001": { nome: "Jogo PS5 - God of War Ragnarök", preco: 349.90 }, "P002": { nome: "Controle DualSense PS5 - Branco", preco: 449.50 }, "P003": { nome: "Headset Pulse 3D - PS5", preco: 599.00 }, };
    const mockCoupons = { "PROMO10": { type: 'fixed', value: 10.00, uses: 5, remaining: 5 }, "GAMER20": { type: 'fixed', value: 20.00, uses: 1, remaining: 1 }, };
    const mockClients = { "C001": { nome: "Amanda Rocks", cpf: "123.456.789-00", telefone: "(85) 91234-5678", rua: "Rua das Flores", numero: "123", bairro: "Centro", cidade: "Fortaleza", uf: "CE", cep: "60000-000" }, };
    const mockSellers = { "V001": { nome: "João Vendedor" }, };

    // ELEMENTOS DO DOM (PDV)
    const clienteInput = document.getElementById('cliente-input');
    const vendedorInput = document.getElementById('vendedor-input');
    const produtoInput = document.getElementById('produto-input');
    const quantidadeInput = document.getElementById('quantidade-input');
    const addProductBtn = document.getElementById('add-product-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalDescontosEl = document.getElementById('descontos-total');
    const totalGeralEl = document.getElementById('total-geral');
    const finishSaleBtn = document.getElementById('finish-sale-btn');
    const summaryClienteEl = document.getElementById('summary-cliente');
    const summaryVendedorEl = document.getElementById('summary-vendedor');
    const cupomInput = document.getElementById('cupom-input');
    const applyCupomBtn = document.getElementById('apply-cupom-btn');
    const cupomStatusEl = document.getElementById('cupom-status');
    const paymentMethodEl = document.getElementById('payment-method');
    const manualDescDescEl = document.getElementById('manual-desc-desc');
    const manualDescValorEl = document.getElementById('manual-desc-valor');
    const addManualDescBtn = document.getElementById('add-manual-desc-btn');

    // ELEMENTOS DO DOM (MODAIS)
    const paymentModal = document.getElementById('payment-modal');
    const modalTotalVendaEl = document.getElementById('modal-total-venda');
    const modalPaymentMethodEl = document.getElementById('modal-payment-method');
    const paymentInputArea = document.getElementById('payment-input-area');
    const btnConfirmPayment = document.getElementById('btn-confirm-payment');
    const paymentModalCloseButton = paymentModal.querySelector('.close-button');
    const postSaleModal = document.getElementById('post-sale-modal');
    const postSaleModalCloseButton = postSaleModal.querySelector('.close-button');
    const btnPrintNf = document.getElementById('btn-print-nf');
    const btnPrintGarantia = document.getElementById('btn-print-garantia');
    const btnNewSale = document.getElementById('btn-new-sale');
    const docPreviewModal = document.getElementById('document-preview-modal');
    const docContentEl = document.getElementById('document-content');
    const btnClosePreview = document.getElementById('btn-close-preview');
    const btnPrintDocument = document.getElementById('btn-print-document');

    // ESTADO DA APLICAÇÃO
    let cart = [];
    let appliedCoupon = null;
    let finalTotal = 0;
    let lastSaleData = {};
    let currentClient = null;
    let currentSeller = null;

    // --- FUNÇÕES DE LÓGICA DO PDV ---
    const addProductToCart = () => { const productCode = produtoInput.value.toUpperCase(); const quantidade = parseInt(quantidadeInput.value); if (!mockDatabase[productCode]) { alert("Produto não encontrado!"); return; } if (isNaN(quantidade) || quantidade <= 0) { alert("Quantidade inválida."); return; } const existingProduct = cart.find(item => item.codigo === productCode && !item.isDiscount); if (existingProduct) { existingProduct.quantidade += quantidade; } else { cart.push({ codigo: productCode, nome: mockDatabase[productCode].nome, preco: mockDatabase[productCode].preco, quantidade: quantidade, isDiscount: false, }); } produtoInput.value = ""; quantidadeInput.value = "1"; produtoInput.focus(); updateUI(); };
    const addManualDiscount = () => { const description = manualDescDescEl.value; const value = parseFloat(manualDescValorEl.value.replace(',', '.')) || 0; if (!description || value <= 0) { alert("Por favor, preencha a descrição e um valor válido para o desconto."); return; } cart.push({ codigo: 'DESC', nome: description, preco: -value, quantidade: 1, isDiscount: true, }); manualDescDescEl.value = ""; manualDescValorEl.value = ""; updateUI(); };
    const applyCoupon = () => { const code = cupomInput.value.toUpperCase(); const coupon = mockCoupons[code]; cupomStatusEl.textContent = ""; appliedCoupon = null; if (!coupon) { cupomStatusEl.textContent = "Cupom inválido."; cupomStatusEl.className = 'error'; } else if (coupon.remaining <= 0) { cupomStatusEl.textContent = "Este cupom já foi totalmente resgatado."; cupomStatusEl.className = 'error'; } else { appliedCoupon = { code, ...coupon }; cupomStatusEl.textContent = `Cupom "${code}" aplicado! (-${formatCurrency(coupon.value)})`; cupomStatusEl.className = 'success'; } updateUI(); };
    const removeItemFromCart = (index) => { cart.splice(index, 1); updateUI(); };
    const formatCurrency = (value) => { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };

    const updateUI = () => {
        cartItemsContainer.innerHTML = "";
        let subtotal = 0;
        cart.forEach((item, index) => { const totalItem = item.preco * item.quantidade; subtotal += totalItem; const row = document.createElement('tr'); if (item.isDiscount) row.className = 'discount-item'; row.innerHTML = `<td>${item.codigo}</td><td>${item.nome}</td><td>${formatCurrency(item.preco)}</td><td>${item.quantidade}</td><td>${formatCurrency(totalItem)}</td><td><button class="remove-btn" data-index="${index}">✖</button></td>`; cartItemsContainer.appendChild(row); });
        let totalDescontos = cart.filter(i => i.isDiscount).reduce((acc, item) => acc + Math.abs(item.preco), 0);
        let couponDiscountValue = 0;
        if (appliedCoupon) { couponDiscountValue = appliedCoupon.value; }
        let paymentDiscountValue = 0;
        const productTotal = cart.filter(i => !i.isDiscount).reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        if (paymentMethodEl.value === 'pix' && productTotal > 0) { paymentDiscountValue = productTotal * 0.05; }
        totalDescontos += couponDiscountValue + paymentDiscountValue;
        finalTotal = subtotal - couponDiscountValue - paymentDiscountValue;
        subtotalEl.textContent = formatCurrency(subtotal);
        totalDescontosEl.textContent = formatCurrency(-totalDescontos);
        totalGeralEl.textContent = formatCurrency(finalTotal);
        currentClient = mockClients[clienteInput.value.toUpperCase()] || null;
        currentSeller = mockSellers[vendedorInput.value.toUpperCase()] || null;
        summaryClienteEl.textContent = currentClient ? currentClient.nome : "Consumidor Padrão";
        summaryVendedorEl.textContent = currentSeller ? currentSeller.nome : "Vendedor Padrão";
    };

    // --- LÓGICA DAS MODAIS ---
    function openPaymentModal() { if (cart.length === 0) { alert("Nenhum item no carrinho!"); return; } updateUI(); const paymentMethod = paymentMethodEl.options[paymentMethodEl.selectedIndex].text; modalTotalVendaEl.textContent = formatCurrency(finalTotal); modalPaymentMethodEl.textContent = paymentMethod; paymentInputArea.innerHTML = ''; switch (paymentMethodEl.value) { case 'dinheiro': paymentInputArea.innerHTML = `<div class="form-group"><label for="valor-recebido">Valor Recebido (R$)</label><input type="text" id="valor-recebido" placeholder="0,00"></div><div class="troco-display"><span>Troco</span><strong id="troco-valor">R$ 0,00</strong></div>`; document.getElementById('valor-recebido').addEventListener('input', calculateChange); break; case 'pix': paymentInputArea.innerHTML = `<div class="pix-area"><p>Escaneie o QR Code para pagar</p><img src="https://i.imgur.com/g8fG1v1.png" alt="QR Code Falso"><p>amanda-games-pix@email.com</p></div>`; break; default: paymentInputArea.innerHTML = `<p style="text-align:center; font-size: 1.1em;">Por favor, insira o cartão na maquininha.</p>`; break; } paymentModal.style.display = 'block'; }
    function calculateChange() { const valorRecebidoInput = document.getElementById('valor-recebido'); const trocoValorEl = document.getElementById('troco-valor'); const valorRecebido = parseFloat(valorRecebidoInput.value.replace(',', '.')) || 0; const finalTotalInCents = Math.round(finalTotal * 100); const valorRecebidoInCents = Math.round(valorRecebido * 100); if (valorRecebidoInCents >= finalTotalInCents) { const trocoInCents = valorRecebidoInCents - finalTotalInCents; trocoValorEl.textContent = formatCurrency(trocoInCents / 100); } else { trocoValorEl.textContent = formatCurrency(0); } }

    function confirmPayment() {
        const productTotal = cart.filter(i => !i.isDiscount).reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        lastSaleData = {
            cliente: currentClient || { nome: 'Consumidor Padrão', cpf: '', telefone: '', rua: '', numero: '', bairro: '', cidade: '', uf: '' },
            vendedor: currentSeller || { nome: 'Vendedor Padrão' },
            itens: [...cart],
            total: finalTotal,
            subtotal: productTotal,
            paymentMethod: paymentMethodEl.options[paymentMethodEl.selectedIndex].text,
            date: new Date(),
            discounts: {
                manualItems: cart.filter(i => i.isDiscount),
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                couponValue: appliedCoupon ? appliedCoupon.value : 0,
                paymentValue: (paymentMethodEl.value === 'pix' && productTotal > 0) ? productTotal * 0.05 : 0
            }
        };
        paymentModal.style.display = 'none';
        postSaleModal.style.display = 'block';
    }

    function generateDocumentHTML(type) {
        let itemsHtml = '';
        lastSaleData.itens.filter(item => !item.isDiscount).forEach(item => {
            itemsHtml += `<tr><td>${item.codigo}</td><td>${item.nome}</td><td>${item.quantidade}</td><td>${formatCurrency(item.preco)}</td><td>${formatCurrency(item.preco * item.quantidade)}</td></tr>`;
        });
        
        let discountsHtml = '';
        lastSaleData.discounts.manualItems.forEach(item => {
            discountsHtml += `<p class="doc-discount-line">Desconto (${item.nome}): ${formatCurrency(item.preco)}</p>`;
        });
        if (lastSaleData.discounts.couponValue > 0) {
            discountsHtml += `<p class="doc-discount-line">Cupom (${lastSaleData.discounts.couponCode}): ${formatCurrency(-lastSaleData.discounts.couponValue)}</p>`;
        }
        if (lastSaleData.discounts.paymentValue > 0) {
            discountsHtml += `<p class="doc-discount-line">Desconto PIX (5%): ${formatCurrency(-lastSaleData.discounts.paymentValue)}</p>`;
        }
        
        const totalDiscountValue = lastSaleData.discounts.manualItems.reduce((acc, item) => acc + Math.abs(item.preco), 0) + lastSaleData.discounts.couponValue + lastSaleData.discounts.paymentValue;

        const docTitle = type === 'nf' ? 'RECIBO DE VENDA' : 'CERTIFICADO DE GARANTIA';
        const docNumber = Date.now().toString().slice(-6);

        let clienteHtml = `<p><strong>CLIENTE:</strong> ${lastSaleData.cliente.nome}</p>`;
        if (lastSaleData.cliente.cpf) {
            clienteHtml += `<p><strong>CPF:</strong> ${lastSaleData.cliente.cpf}</p><p><strong>Telefone:</strong> ${lastSaleData.cliente.telefone}</p><p><strong>Endereço:</strong> ${lastSaleData.cliente.rua}, ${lastSaleData.cliente.numero} - ${lastSaleData.cliente.bairro}, ${lastSaleData.cliente.cidade}/${lastSaleData.cliente.uf}</p>`;
        }

        const pixHtml = lastSaleData.paymentMethod.includes('PIX') ? `<div class="pix-area-doc"><img src="https://i.imgur.com/g8fG1v1.png" alt="QR Code"><p>amanda-games-pix@email.com</p></div>` : '';

        return `<div class="doc-header"><h3>AmanditaGames Store</h3><p>Seu Endereço | Seu Contato</p></div>
                <div class="doc-section"><h4>${docTitle} - Nº ${docNumber}</h4><p><strong>Data:</strong> ${lastSaleData.date.toLocaleString('pt-BR')}</p></div>
                <div class="doc-section"><h4>DADOS DO CLIENTE</h4>${clienteHtml}</div>
                <div class="doc-section"><p><strong>Vendedor:</strong> ${lastSaleData.vendedor.nome}</p></div>
                <div class="doc-section"><h4>ITENS DA COMPRA</h4><table class="doc-table"><thead><tr><th>Cód.</th><th>Produto</th><th>Qtd.</th><th>Vlr. Unit.</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table></div>
                <div class="doc-section"><h4>Pagamento</h4><div class="payment-details-grid"><div class="payment-summary-left">
                <p><strong>Subtotal Produtos:</strong> ${formatCurrency(lastSaleData.subtotal)}</p>
                ${totalDiscountValue > 0 ? `<p><strong>Valor Total Descontos:</strong> ${formatCurrency(-totalDiscountValue)}</p>${discountsHtml}` : ''}
                <hr><p><strong>TOTAL PAGO:</strong> ${formatCurrency(lastSaleData.total)}</p>
                <p><strong>Forma de Pagamento:</strong> ${lastSaleData.paymentMethod}</p></div>
                <div class="payment-summary-right">${pixHtml}</div></div></div>
                ${type === 'garantia' ? '<div class="doc-footer"><p>Este certificado garante a troca de produtos com defeito de fabricação por 90 dias.</p></div>' : '<div class="doc-footer"><p>Obrigado pela preferência!</p></div>'}`;
    }

    function showPreview(type) {
        docContentEl.innerHTML = generateDocumentHTML(type);
        postSaleModal.style.display = 'none';
        docPreviewModal.style.display = 'block';
    }

    function resetForNextSale() {
        if (appliedCoupon) { mockCoupons[appliedCoupon.code].remaining--; }
        cart = [];
        appliedCoupon = null;
        lastSaleData = {};
        cupomInput.value = "";
        cupomStatusEl.textContent = "";
        clienteInput.value = "";
        vendedorInput.value = "";
        postSaleModal.style.display = 'none';
        docPreviewModal.style.display = 'none';
        updateUI();
    }

    // --- EVENT LISTENERS ---
    addProductBtn.addEventListener('click', addProductToCart);
    produtoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') quantidadeInput.focus(); });
    quantidadeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addProductToCart(); });
    addManualDescBtn.addEventListener('click', addManualDiscount);
    applyCupomBtn.addEventListener('click', applyCoupon);
    paymentMethodEl.addEventListener('change', updateUI);
    clienteInput.addEventListener('input', updateUI);
    vendedorInput.addEventListener('input', updateUI);
    cartItemsContainer.addEventListener('click', (e) => { if(e.target.classList.contains('remove-btn')){ removeItemFromCart(e.target.dataset.index); } });
    
    finishSaleBtn.addEventListener('click', openPaymentModal);
    btnConfirmPayment.addEventListener('click', confirmPayment);
    paymentModalCloseButton.onclick = () => { paymentModal.style.display = 'none'; };
    postSaleModalCloseButton.onclick = () => { resetForNextSale(); };

    btnPrintNf.addEventListener('click', () => showPreview('nf'));
    btnPrintGarantia.addEventListener('click', () => showPreview('garantia'));
    btnNewSale.addEventListener('click', resetForNextSale);
    btnClosePreview.addEventListener('click', () => { docPreviewModal.style.display = 'none'; postSaleModal.style.display = 'block'; });
    btnPrintDocument.addEventListener('click', () => window.print());
    
    window.addEventListener('afterprint', () => {
        docPreviewModal.style.display = 'none';
        postSaleModal.style.display = 'block';
    });
    
    // --- INICIALIZAÇÃO ---
    updateUI();
});