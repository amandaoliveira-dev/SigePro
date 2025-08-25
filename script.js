document.addEventListener('DOMContentLoaded', () => {
   
    // --- CARREGANDO DADOS DO LOCALSTORAGE ---
    function loadData(key) {
        const data = localStorage.getItem(key);
        
        // Se não houver nada salvo, retorna nulo.
        if (!data) {
            return null;
        }

        // Tenta converter o texto para objeto.
        try {
            return JSON.parse(data);
        } 
        // Se der erro na conversão...
        catch (error) {
            // Mostra um aviso no console para você (o desenvolvedor) saber do problema.
            console.error(`ERRO: Dado corrompido encontrado no localStorage para a chave: "${key}"`);
            
            // Remove o dado ruim para não causar problemas no futuro.
            localStorage.removeItem(key);
            
            // Retorna nulo, como se não houvesse nada salvo.
            return null;
        }
    }

    const STORAGE_KEYS = {
        products: 'amanditaGames_products',
        clients: 'amanditaGames_clients', // Adicionado
    };

    // BANCOS DE DADOS
    // Carrega os produtos salvos pelo admin
    const dbProdutosArray = loadData(STORAGE_KEYS.products) || [];
    const mockDatabase = dbProdutosArray.reduce((obj, item) => {
        obj[item.codigo.toUpperCase()] = {
            nome: item.nome,
            preco: parseFloat(item.precoVenda),
            serial: item.serial,
            garantia: item.garantia
        };
        return obj;
    }, {});

    // ATUALIZADO: Carrega os clientes salvos pelo admin
    const dbClientesArray = loadData(STORAGE_KEYS.clients) || [];
    const mockClients = dbClientesArray.reduce((obj, item) => {
        obj[item.codigo.toUpperCase()] = item;
        return obj;
    }, {});

    // Vendedores e cupons continuam como exemplo por enquanto
    const mockCoupons = { "PROMO10": { type: 'fixed', value: 10.00, uses: 5, remaining: 5 }, "GAMER20": { type: 'fixed', value: 20.00, uses: 1, remaining: 1 } };
    const mockSellers = { "V001": { nome: "JOÃO VENDEDOR" } };

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
    const docPreviewModalCloseButton = docPreviewModal.querySelector('.close-button');

    // ESTADO DA APLICAÇÃO
    let cart = [];
    let appliedCoupon = null;
    let finalTotal = 0;
    let lastSaleData = {};
    let currentClient = null;
    let currentSeller = null;
    // ADICIONADA ESTAS DUAS LINHAS ABAIXO
    let subtotal = 0;
    let paymentDiscount = 0;

    // --- FUNÇÕES DE LÓGICA DO PDV ---
    const addProductToCart = () => { const productCode = produtoInput.value.toUpperCase(); const quantidade = parseInt(quantidadeInput.value); if (!mockDatabase[productCode]) { alert("Produto não encontrado!"); return; } if (isNaN(quantidade) || quantidade <= 0) { alert("Quantidade inválida."); return; } const existingProduct = cart.find(item => item.codigo === productCode && !item.isDiscount); if (existingProduct) { existingProduct.quantidade += quantidade; } else { cart.push({ codigo: productCode, nome: mockDatabase[productCode].nome, preco: mockDatabase[productCode].preco, quantidade: quantidade, isDiscount: false, }); } produtoInput.value = ""; quantidadeInput.value = "1"; produtoInput.focus(); updateUI(); };
    const addManualDiscount = () => { const description = manualDescDescEl.value; const value = parseFloat(manualDescValorEl.value.replace(',', '.')) || 0; if (!description || value <= 0) { alert("Por favor, preencha a descrição e um valor válido para o desconto."); return; } cart.push({ codigo: 'DESC', nome: description.toUpperCase(), preco: -value, quantidade: 1, isDiscount: true, }); manualDescDescEl.value = ""; manualDescValorEl.value = ""; updateUI(); };
    const applyCoupon = () => { const code = cupomInput.value.toUpperCase(); const coupon = mockCoupons[code]; cupomStatusEl.textContent = ""; appliedCoupon = null; if (!coupon) { cupomStatusEl.textContent = "Cupom inválido."; cupomStatusEl.className = 'error'; } else if (coupon.remaining <= 0) { cupomStatusEl.textContent = "Este cupom já foi totalmente resgatado."; cupomStatusEl.className = 'error'; } else { appliedCoupon = { code, ...coupon }; cupomStatusEl.textContent = `Cupom "${code}" aplicado! (-${formatCurrency(coupon.value)})`; cupomStatusEl.className = 'success'; } updateUI(); };
    const removeItemFromCart = (index) => { cart.splice(index, 1); updateUI(); };
   
    // SUBSTITUA SUA FUNÇÃO updateUI INTEIRA POR ESTA:

    const updateUI = () => {
        cartItemsContainer.innerHTML = "";
        // AÇÃO 1: A variável 'subtotal' não é mais calculada aqui dentro.
        // Ela agora é a nossa variável global.

        cart.forEach((item, index) => { 
            const totalItem = item.preco * item.quantidade; 
            // AÇÃO 2: A linha 'subtotal += totalItem' foi REMOVIDA daqui.
            const row = document.createElement('tr'); 
            if (item.isDiscount) row.className = 'discount-item'; 
            row.innerHTML = `<td>${item.codigo}</td><td>${toTitleCase(item.nome)}</td><td>${formatCurrency(item.preco)}</td><td>${item.quantidade}</td><td>${formatCurrency(totalItem)}</td><td><button class="remove-btn" data-index="${index}">✖</button></td>`; 
            cartItemsContainer.appendChild(row); 
        });
        
        let totalDescontos = cart.filter(i => i.isDiscount).reduce((acc, item) => acc + Math.abs(item.preco), 0);
        
        let couponDiscountValue = 0;
        if (appliedCoupon) { couponDiscountValue = appliedCoupon.value; }
        
        paymentDiscount = 0; 
        
        // AÇÃO 3: Aqui calculamos o subtotal SOMENTE dos produtos e guardamos na nossa variável global.
        subtotal = cart.filter(i => !i.isDiscount).reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        if (paymentMethodEl.value === 'pix' && subtotal > 0) { paymentDiscount = subtotal * 0.05; }
        
        totalDescontos += couponDiscountValue + paymentDiscount;

        // AÇÃO 4: O Total Geral agora é o Subtotal (só de produtos) MENOS o total de todos os descontos.
        finalTotal = subtotal - totalDescontos;
        
        subtotalEl.textContent = formatCurrency(subtotal); // Agora exibe o subtotal correto (só produtos)
        totalDescontosEl.textContent = formatCurrency(-totalDescontos);
        totalGeralEl.textContent = formatCurrency(finalTotal);
        
        currentClient = mockClients[clienteInput.value.toUpperCase()] || null;
        currentSeller = mockSellers[vendedorInput.value.toUpperCase()] || null;
        summaryClienteEl.textContent = currentClient ? toTitleCase(currentClient.nome) : "Consumidor Padrão";
        summaryVendedorEl.textContent = currentSeller ? toTitleCase(currentSeller.nome) : "Vendedor Padrão";
    };

    function openPaymentModal() { if (cart.length === 0) { alert("Nenhum item no carrinho!"); return; } updateUI(); const paymentMethod = paymentMethodEl.options[paymentMethodEl.selectedIndex].text; modalTotalVendaEl.textContent = formatCurrency(finalTotal); modalPaymentMethodEl.textContent = paymentMethod; paymentInputArea.innerHTML = ''; switch (paymentMethodEl.value) { case 'dinheiro': paymentInputArea.innerHTML = `<div class="form-group"><label for="valor-recebido">Valor Recebido (R$)</label><input type="number" id="valor-recebido" placeholder="50.00" step="0.01" min="0"></div><div class="troco-display"><span>Troco</span><strong id="troco-valor">R$ 0,00</strong></div>`; document.getElementById('valor-recebido').addEventListener('input', calculateChange); break; case 'pix': paymentInputArea.innerHTML = `<div class="pix-area"><p>Escaneie o QR Code para pagar</p><img src="https://i.imgur.com/g8fG1v1.png" alt="QR Code Falso"><p>amanda-games-pix@email.com</p></div>`; break; default: paymentInputArea.innerHTML = `<p style="text-align:center; font-size: 1.1em;">Por favor, insira o cartão na maquininha.</p>`; break; } paymentModal.style.display = 'block'; }
    function calculateChange() { const valorRecebidoInput = document.getElementById('valor-recebido'); const trocoValorEl = document.getElementById('troco-valor'); const valorRecebido = parseFloat(valorRecebidoInput.value.replace(',', '.')) || 0; const finalTotalInCents = Math.round(finalTotal * 100); const valorRecebidoInCents = Math.round(valorRecebido * 100); if (valorRecebidoInCents >= finalTotalInCents) { const trocoInCents = valorRecebidoInCents - finalTotalInCents; trocoValorEl.textContent = formatCurrency(trocoInCents / 100); } else { trocoValorEl.textContent = formatCurrency(0); } }

    function confirmPayment() {
        
        let valorRecebido = 0;
        let troco = 0;
        if (paymentMethodEl.value === 'dinheiro') {
            const valorRecebidoInput = document.getElementById('valor-recebido');
            valorRecebido = parseFloat(valorRecebidoInput.value.replace(',', '.')) || 0;
            if (valorRecebido >= finalTotal) { troco = valorRecebido - finalTotal; }
        }
        lastSaleData = {
            cliente: currentClient || { nome: 'CONSUMIDOR PADRÃO', cpf: '', telefone: '', rua: '', numero: '', bairro: '', cidade: '', uf: '' },
            vendedor: currentSeller || { nome: 'VENDEDOR PADRÃO' },
            itens: [...cart],
            total: finalTotal,
            subtotal: subtotal,
            paymentMethod: paymentMethodEl.options[paymentMethodEl.selectedIndex].text,
            valorRecebido: valorRecebido,
            troco: troco,
            date: new Date(),
            discounts: {
                manualItems: cart.filter(i => i.isDiscount),
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                couponValue: appliedCoupon ? appliedCoupon.value : 0,
                paymentValue: paymentDiscount
            }
        };
        paymentModal.style.display = 'none';
        postSaleModal.style.display = 'block';
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
    docPreviewModalCloseButton.onclick = () => {
        docPreviewModal.style.display = 'none';
        postSaleModal.style.display = 'block'; // Adicionamos esta linha
    };
    
    window.addEventListener('afterprint', () => {
        docPreviewModal.style.display = 'none';
        postSaleModal.style.display = 'block';
    });
    
    // --- INICIALIZAÇÃO ---
    updateUI();
});