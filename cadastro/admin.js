document.addEventListener('DOMContentLoaded', () => {
    // FUNÇÃO DE FORMATAÇÃO
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

    // --- LÓGICA DE NAVEGAÇÃO DAS ABAS ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentPanels = document.querySelectorAll('.content-panel');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            
            navLinks.forEach(l => l.classList.remove('active'));
            contentPanels.forEach(p => p.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'relatorios') {
                renderReports();
            }
            if (targetId === 'historico') {
                renderFunctions.historico();
            }
        });
    });

    // --- BANCOS DE DADOS E CONTADORES ---
    let dbCategorias = [{id: 1, nome: 'JOGOS PS5'}, {id: 2, nome: 'ACESSÓRIOS'}];
    let dbProdutos = [
        {codigo: 'P001', nome: 'JOGO PS5 - GOD OF WAR', precoVenda: '350.00', estoque: 2, estoqueMinimo: 3, garantia: "3 Meses", serial: "N/A", barcode: "711719541189", categoriaId: 1, precoCusto: "280.00", fornecedorCodigo: "F001", plataforma: "PS5", tags: "AÇÃO, AVENTURA"},
        {codigo: 'P002', nome: 'CONTROLE DUALSENSE PS5', precoVenda: '450.00', estoque: 10, estoqueMinimo: 5, garantia: "1 Ano", serial: "AX123456789B", barcode: "711719540861", categoriaId: 2, precoCusto: "350.00", fornecedorCodigo: "F001", plataforma: "PS5", tags: "ACESSÓRIO, CONTROLE"},
        {codigo: 'P003', nome: 'CABO HDMI 8K', precoVenda: '90.00', estoque: 4, estoqueMinimo: 5, garantia: "3 Meses", serial: "N/A", barcode: "789000000003", categoriaId: 2, precoCusto: "50.00", fornecedorCodigo: "F001", plataforma: "N/A", tags: "CABO, ACESSÓRIO"}
    ];
    let dbVendedores = [ {codigo: 'V001', nome: 'AMANDA', cpf: '111.111.111-11'}, {codigo: 'V002', nome: 'JOÃO', cpf: '222.222.222-22'} ];
    let dbClientes = [{codigo: 'C001', nome: 'CLIENTE FIEL', cpf: "111.222.333-44", telefone: "(85) 99999-8888", rua: "RUA DAS FLORES", numero: "123", bairro: "CENTRO", cidade: "FORTALEZA", uf: "CE"}];
    let dbFornecedores = [{codigo: 'F001', nome: "SONY BRASIL", cnpj:"11.222.333/0001-44", telefone: "11-98765-4321", contato: "CARLOS"}];
    let dbCupons = [];
    let dbVendas = [
        { recibo: '981542', date: new Date('2025-08-21T15:10:10'), cliente: dbClientes[0], vendedor: dbVendedores[1], itens: [{codigo: 'P002', nome: 'CONTROLE DUALSENSE PS5', preco: 450.00, quantidade: 2, serial: 'AX123456789B', garantia: '1 Ano'}], total: 899.00, subtotal: 900.00, paymentMethod: 'Cartão de Crédito', valorRecebido: 0, troco: 0, discounts: { manualItems: [], couponCode: 'PROMO10', couponValue: 1.00, paymentValue: 0 } },
        { recibo: '981513', date: new Date(), cliente: { nome: 'CONSUMIDOR PADRÃO' }, vendedor: dbVendedores[0], itens: [{codigo: 'P001', nome: 'JOGO PS5 - GOD OF WAR', preco: 349.90, quantidade: 1, serial: 'N/A', garantia: '3 Meses'}], total: 332.41, subtotal: 349.90, paymentMethod: 'PIX (5% de Desconto)', valorRecebido: 0, troco: 0, discounts: { manualItems: [], couponCode: null, couponValue: 0, paymentValue: 17.49 } },
    ];
    let productCounter = 4, clientCounter = 2, sellerCounter = 3, supplierCounter = 2, categoryCounter = 3;
    let currentlyEditing = { id: null, type: null };
    let lastSaleData = {};

    // --- LÓGICA DAS MODAIS ---
    const detailsModal = document.getElementById('details-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const detailsCloseButton = detailsModal.querySelector('.close-button');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const confirmCloseButton = confirmModal.querySelector('.close-button');
    const postSaleModal = document.getElementById('post-sale-modal');
    const postSaleCloseButton = postSaleModal.querySelector('.close-button');
    const docPreviewModal = document.getElementById('document-preview-modal');
    const docPreviewCloseButton = docPreviewModal.querySelector('.close-button');


    if(detailsCloseButton) { detailsCloseButton.onclick = () => { detailsModal.style.display = "none"; } }
    if(btnCancelDelete) { btnCancelDelete.onclick = () => { confirmModal.style.display = "none"; } }
    if(confirmCloseButton) { confirmCloseButton.onclick = () => { confirmModal.style.display = "none"; }}
    if(postSaleCloseButton) { postSaleCloseButton.onclick = () => { postSaleModal.style.display = "none"; }}
    if(docPreviewCloseButton) { docPreviewCloseButton.onclick = () => { docPreviewModal.style.display = "none"; }}
    
    window.onclick = (event) => {
        if (event.target == detailsModal) { detailsModal.style.display = "none"; }
        if (event.target == confirmModal) { confirmModal.style.display = "none"; }
        if (event.target == postSaleModal) { postSaleModal.style.display = "none"; }
        if (event.target == docPreviewModal) { docPreviewModal.style.display = "none"; }
    }
    
    function showDetails(itemId, itemType) {
        let item;
        let detailsHtml = '';
        let title = 'Detalhes';

        switch (itemType) {
            case 'produto':
                item = dbProdutos.find(p => p.codigo === itemId);
                if (item) {
                    const fornecedor = dbFornecedores.find(f => f.codigo === item.fornecedorCodigo);
                    const nomeFornecedor = fornecedor ? toTitleCase(fornecedor.nome) : 'Não informado';
                    const categoria = dbCategorias.find(c => String(c.id) === String(item.categoriaId));
                    const nomeCategoria = categoria ? toTitleCase(categoria.nome) : 'Sem categoria';
                    title = `Detalhes do Produto: ${toTitleCase(item.nome)}`;
                    detailsHtml = `<p><strong>Código Interno:</strong> ${item.codigo}</p><p><strong>Cód. Barras:</strong> ${item.barcode || 'N/A'}</p><p><strong>Nº de Série:</strong> ${item.serial || 'N/A'}</p><p><strong>Nome:</strong> ${toTitleCase(item.nome)}</p><p><strong>Condição:</strong> ${item.condicao}</p><p><strong>Garantia:</strong> ${item.garantia}</p><p><strong>Categoria:</strong> <span class="detail-highlight">${nomeCategoria}</span></p><p><strong>Plataforma:</strong> ${toTitleCase(item.plataforma)}</p><hr><p><strong>Preço de Custo:</strong> ${formatCurrency(parseFloat(item.precoCusto))}</p><p><strong>Preço de Venda:</strong> ${formatCurrency(parseFloat(item.precoVenda))}</p><p><strong>Fornecedor:</strong> ${nomeFornecedor} (${item.fornecedorCodigo || 'N/A'})</p><hr><p><strong>Estoque Atual:</strong> ${item.estoque} unidades</p><p><strong>Estoque Mínimo:</strong> ${item.estoqueMinimo} unidades</p><p><strong>Localização:</strong> ${toTitleCase(item.localizacao)}</p><hr><p><strong>Data de Lançamento:</strong> ${item.lancamento ? new Date(item.lancamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p><p><strong>Tags:</strong> ${toTitleCase(item.tags)}</p>`;
                }
                break;
            case 'categoria':
                item = dbCategorias.find(c => c.id == itemId);
                 if(item) {
                    title = `Detalhes da Categoria: ${toTitleCase(item.nome)}`;
                    detailsHtml = `<p><strong>ID:</strong> ${item.id}</p><p><strong>Nome:</strong> ${toTitleCase(item.nome)}</p>`;
                 }
                break;
            case 'cliente':
                item = dbClientes.find(c => c.codigo === itemId);
                if (item) {
                    title = `Detalhes do Cliente: ${toTitleCase(item.nome)}`;
                    detailsHtml = `<p><strong>Código:</strong> ${item.codigo}</p><p><strong>Nome:</strong> ${toTitleCase(item.nome)}</p><p><strong>CPF:</strong> ${item.cpf}</p><p><strong>Telefone:</strong> ${item.telefone}</p><p><strong>E-mail:</strong> ${item.email}</p><p><strong>Endereço:</strong> ${toTitleCase(item.rua)}, Nº ${item.numero} - ${toTitleCase(item.bairro)}, ${toTitleCase(item.cidade)}/${item.uf.toUpperCase()}</p><p><strong>CEP:</strong> ${item.cep}</p>`;
                }
                break;
            case 'vendedor':
                item = dbVendedores.find(v => v.codigo === itemId);
                if (item) {
                    title = `Detalhes do Vendedor: ${toTitleCase(item.nome)}`;
                     detailsHtml = `<p><strong>Código:</strong> ${item.codigo}</p><p><strong>Nome:</strong> ${toTitleCase(item.nome)}</p><p><strong>CPF:</strong> ${item.cpf}</p><p><strong>Telefone:</strong> ${item.telefone}</p><p><strong>E-mail:</strong> ${item.email}</p><p><strong>Endereço:</strong> ${toTitleCase(item.rua)}, Nº ${item.numero} - ${toTitleCase(item.bairro)}, ${toTitleCase(item.cidade)}/${item.uf.toUpperCase()}</p><p><strong>CEP:</strong> ${item.cep}</p>`;
                }
                break;
            case 'fornecedor':
                item = dbFornecedores.find(f => f.codigo === itemId);
                if (item) {
                    title = `Detalhes do Fornecedor: ${toTitleCase(item.nome)}`;
                    detailsHtml = `<p><strong>Código:</strong> ${item.codigo}</p><p><strong>Empresa:</strong> ${toTitleCase(item.nome)}</p><p><strong>CNPJ:</strong> ${item.cnpj}</p><p><strong>Contato:</strong> ${toTitleCase(item.contato)}</p><p><strong>Telefone:</strong> ${item.telefone}</p><p><strong>Endereço:</strong> ${toTitleCase(item.rua)}, Nº ${item.numero} - ${toTitleCase(item.bairro)}, ${toTitleCase(item.cidade)}/${item.uf.toUpperCase()}</p><p><strong>CEP:</strong> ${item.cep}</p>`;
                }
                break;
            case 'cupom':
                item = dbCupons.find(c => c.codigo === itemId);
                if (item) {
                    title = `Detalhes do Cupom: ${item.codigo}`;
                    detailsHtml = `<p><strong>Código:</strong> ${item.codigo}</p><p><strong>Tipo:</strong> ${item.tipo}</p><p><strong>Valor:</strong> ${item.valor}</p><p><strong>Usos Totais:</strong> ${item.usos}</p>`;
                }
                break;
        }

        if (item) {
            modalTitle.textContent = title;
            modalBody.innerHTML = detailsHtml;
            detailsModal.style.display = "block";
        }
    }

    // --- LÓGICA DE AÇÕES ---
    const contentArea = document.querySelector('.content');
    contentArea.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-view') || target.classList.contains('btn-edit') || target.classList.contains('btn-delete')) {
            const itemId = target.dataset.id;
            const itemType = target.dataset.type;

            if (target.classList.contains('btn-view') && !target.classList.contains('btn-reprint')) { 
                showDetails(itemId, itemType); 
            }
            if (target.classList.contains('btn-edit')) { 
                editItem(itemId, itemType); 
            }
            if (target.classList.contains('btn-delete')) { 
                openConfirmModal(itemId, itemType); 
            }
        }
        if (target.classList.contains('btn-reprint')) {
            const vendaId = target.dataset.id;
            const venda = dbVendas.find(v => v.recibo === vendaId);
            if (venda) {
                lastSaleData = venda;
                if (postSaleModal) {
                    const newSaleButton = postSaleModal.querySelector('.btn-link');
                    if (newSaleButton) newSaleButton.style.display = 'none';
                    postSaleModal.style.display = 'block';
                }
            }
        }
    });

    function deleteItem(itemId, itemType) {
        let db, renderFn, key;
        switch (itemType) {
            case 'produto': db = dbProdutos; renderFn = renderFunctions.produtos; key = 'codigo'; break;
            case 'categoria': db = dbCategorias; renderFn = renderFunctions.categorias; key = 'id'; break;
            case 'cliente': db = dbClientes; renderFn = renderFunctions.clientes; key = 'codigo'; break;
            case 'vendedor': db = dbVendedores; renderFn = renderFunctions.vendedores; key = 'codigo'; break;
            case 'fornecedor': db = dbFornecedores; renderFn = renderFunctions.fornecedores; key = 'codigo'; break;
            case 'cupom': db = dbCupons; renderFn = renderFunctions.cupons; key = 'codigo'; break;
        }
        const itemIndex = db.findIndex(item => String(item[key]) === String(itemId));
        if (itemIndex > -1) {
            db.splice(itemIndex, 1);
            renderFn();
        }
    }

    function openConfirmModal(itemId, itemType) {
        confirmModalText.textContent = "Tem certeza que deseja excluir o item do cadastro?";
        confirmModal.style.display = 'block';
        btnConfirmDelete.onclick = () => {
            deleteItem(itemId, itemType);
            confirmModal.style.display = 'none';
        };
    }

    function editItem(itemId, itemType) {
        currentlyEditing = { id: itemId, type: itemType };
        let item, form, button;
        switch (itemType) {
            case 'produto':
                item = dbProdutos.find(p => p.codigo === itemId);
                form = document.getElementById('form-produto');
                button = document.getElementById('btn-salvar-produto');
                if (item) {
                    form.elements['prod-nome'].value = item.nome; 
                    form.elements['prod-barcode'].value = item.barcode; 
                    form.elements['prod-categoria'].value = item.categoriaId; 
                    form.elements['prod-condicao'].value = item.condicao; 
                    form.elements['prod-garantia'].value = item.garantia; 
                    form.elements['prod-serial'].value = item.serial; 
                    form.elements['prod-preco-custo'].value = item.precoCusto; 
                    form.elements['prod-preco'].value = item.precoVenda; 
                    form.elements['prod-fornecedor-codigo'].value = item.fornecedorCodigo; 
                    form.elements['prod-estoque'].value = item.estoque; 
                    form.elements['prod-estoque-minimo'].value = item.estoqueMinimo; 
                    form.elements['prod-localizacao'].value = item.localizacao; 
                    form.elements['prod-plataforma'].value = item.plataforma; 
                    form.elements['prod-lancamento'].value = item.lancamento; 
                    form.elements['prod-tags'].value = item.tags;
                    document.getElementById('prod-fornecedor-codigo').dispatchEvent(new Event('input'));
                    button.textContent = 'Atualizar Produto';
                }
                break;
            case 'categoria':
                item = dbCategorias.find(c => c.id == itemId);
                form = document.getElementById('form-categoria');
                button = document.getElementById('btn-salvar-categoria');
                if(item) { form.elements['cat-nome'].value = item.nome; button.textContent = 'Atualizar Categoria'; }
                break;
            case 'cliente':
                 item = dbClientes.find(c => c.codigo === itemId);
                 form = document.getElementById('form-cliente');
                 button = document.getElementById('btn-salvar-cliente');
                 if(item) { 
                     form.elements['cli-nome'].value = item.nome; 
                     form.elements['cli-cpf'].value = item.cpf; 
                     form.elements['cli-email'].value = item.email; 
                     form.elements['cli-telefone'].value = item.telefone; 
                     form.elements['cli-cep'].value = item.cep; 
                     form.elements['cli-rua'].value = item.rua; 
                     form.elements['cli-numero'].value = item.numero; 
                     form.elements['cli-bairro'].value = item.bairro; 
                     form.elements['cli-cidade'].value = item.cidade; 
                     form.elements['cli-uf'].value = item.uf; 
                     button.textContent = 'Atualizar Cliente'; 
                 }
                break;
            case 'vendedor':
                 item = dbVendedores.find(v => v.codigo === itemId);
                 form = document.getElementById('form-vendedor');
                 button = document.getElementById('btn-salvar-vendedor');
                 if(item) { 
                     form.elements['vend-nome'].value = item.nome; 
                     form.elements['vend-cpf'].value = item.cpf; 
                     form.elements['vend-telefone'].value = item.telefone; 
                     form.elements['vend-email'].value = item.email; 
                     form.elements['vend-cep'].value = item.cep; 
                     form.elements['vend-rua'].value = item.rua; 
                     form.elements['vend-numero'].value = item.numero; 
                     form.elements['vend-bairro'].value = item.bairro; 
                     form.elements['vend-cidade'].value = item.cidade; 
                     form.elements['vend-uf'].value = item.uf; 
                     button.textContent = 'Atualizar Vendedor'; 
                 }
                break;
             case 'fornecedor':
                  item = dbFornecedores.find(f => f.codigo === itemId);
                  form = document.getElementById('form-fornecedor');
                  button = document.getElementById('btn-salvar-fornecedor');
                  if(item) { 
                      form.elements['forn-nome'].value = item.nome; 
                      form.elements['forn-cnpj'].value = item.cnpj; 
                      form.elements['forn-contato'].value = item.contato; 
                      form.elements['forn-telefone'].value = item.telefone; 
                      form.elements['forn-cep'].value = item.cep; 
                      form.elements['forn-rua'].value = item.rua; 
                      form.elements['forn-numero'].value = item.numero; 
                      form.elements['forn-bairro'].value = item.bairro; 
                      form.elements['forn-cidade'].value = item.cidade; 
                      form.elements['forn-uf'].value = item.uf; 
                      button.textContent = 'Atualizar Fornecedor'; 
                  }
                 break;
              case 'cupom':
                item = dbCupons.find(c => c.codigo === itemId);
                form = document.getElementById('form-cupom');
                button = document.getElementById('btn-salvar-cupom');
                if (item) { 
                    form.elements['cupom-codigo'].value = item.codigo; 
                    form.elements['cupom-tipo'].value = item.tipo; 
                    form.elements['cupom-valor'].value = item.valor; 
                    form.elements['cupom-usos'].value = item.usos; 
                    button.textContent = 'Atualizar Cupom'; 
                }
                break;
        }
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function resetEditState(form) {
        let buttonText = 'Salvar';
        switch(form.id) {
            case 'form-produto': buttonText = 'Salvar Produto'; break;
            case 'form-categoria': buttonText = 'Salvar Categoria'; break;
            case 'form-cliente': buttonText = 'Salvar Cliente'; break;
            case 'form-vendedor': buttonText = 'Salvar Vendedor'; break;
            case 'form-fornecedor': buttonText = 'Salvar Fornecedor'; break;
            case 'form-cupom': buttonText = 'Salvar Cupom'; break;
        }
        currentlyEditing = { id: null, type: null };
        form.querySelector('.btn-primary').textContent = buttonText;
        form.reset();
    }

    // --- LÓGICA DE CADASTROS ---
    const renderFunctions = {};

    // CATEGORIAS
    const formCategoria = document.getElementById('form-categoria');
    const tabelaCategorias = document.getElementById('tabela-categorias');
    const selectCategoriaProduto = document.getElementById('prod-categoria');
    formCategoria.addEventListener('submit', (e) => { e.preventDefault(); const nome = document.getElementById('cat-nome').value.toUpperCase(); if(!nome) return; if(currentlyEditing.type === 'categoria'){const item = dbCategorias.find(c => c.id == currentlyEditing.id); if(item) item.nome = nome;} else {const id = categoryCounter++; dbCategorias.push({ id, nome });} renderFunctions.categorias(); populateCategoryDropdown(); resetEditState(formCategoria); });
    renderFunctions.categorias = (data = dbCategorias) => { tabelaCategorias.innerHTML = ""; data.forEach(cat => { tabelaCategorias.innerHTML += `<tr><td>${toTitleCase(cat.nome)}</td><td class="actions"><button class="btn-view" data-id="${cat.id}" data-type="categoria">Ver</button><button class="btn-edit" data-id="${cat.id}" data-type="categoria">Editar</button><button class="btn-delete" data-id="${cat.id}" data-type="categoria">Excluir</button></td></tr>`; }); }
    function populateCategoryDropdown() { selectCategoriaProduto.innerHTML = '<option value="">Selecione...</option>'; dbCategorias.forEach(cat => { selectCategoriaProduto.innerHTML += `<option value="${cat.id}">${toTitleCase(cat.nome)}</option>`; }); }

    // PRODUTOS
    const formProduto = document.getElementById('form-produto');
    const tabelaProdutos = document.getElementById('tabela-produtos');
    const prodFornecedorCodigoInput = document.getElementById('prod-fornecedor-codigo');
    const prodFornecedorNomeSpan = document.getElementById('prod-fornecedor-nome');
    prodFornecedorCodigoInput.addEventListener('input', () => { const codigo = prodFornecedorCodigoInput.value.toUpperCase(); if (!codigo) { prodFornecedorNomeSpan.textContent = ''; return; } const fornecedor = dbFornecedores.find(f => f.codigo === codigo); if (fornecedor) { prodFornecedorNomeSpan.textContent = toTitleCase(fornecedor.nome); prodFornecedorNomeSpan.classList.remove('error'); } else { prodFornecedorNomeSpan.textContent = 'Código não encontrado'; prodFornecedorNomeSpan.classList.add('error'); } });
    formProduto.addEventListener('submit', (e) => { e.preventDefault(); const prodData = { nome: document.getElementById('prod-nome').value.toUpperCase(), barcode: document.getElementById('prod-barcode').value, categoriaId: document.getElementById('prod-categoria').value, condicao: document.getElementById('prod-condicao').value, garantia: document.getElementById('prod-garantia').value, serial: document.getElementById('prod-serial').value.toUpperCase(), precoCusto: document.getElementById('prod-preco-custo').value, precoVenda: document.getElementById('prod-preco').value, fornecedorCodigo: prodFornecedorCodigoInput.value.toUpperCase(), estoque: document.getElementById('prod-estoque').value, estoqueMinimo: document.getElementById('prod-estoque-minimo').value, localizacao: document.getElementById('prod-localizacao').value.toUpperCase(), plataforma: document.getElementById('prod-plataforma').value.toUpperCase(), lancamento: document.getElementById('prod-lancamento').value, tags: document.getElementById('prod-tags').value.toUpperCase(), }; if (currentlyEditing.type === 'produto') { const item = dbProdutos.find(p => p.codigo === currentlyEditing.id); if (item) Object.assign(item, prodData); } else { const cod = 'P' + String(productCounter++).padStart(3, '0'); dbProdutos.push({ codigo: cod, ...prodData }); } renderFunctions.produtos(); resetEditState(formProduto); prodFornecedorNomeSpan.textContent = ''; });
    renderFunctions.produtos = (data = dbProdutos) => { tabelaProdutos.innerHTML = ""; data.forEach(prod => { const fornecedor = dbFornecedores.find(f => f.codigo === prod.fornecedorCodigo); const nomeFornecedor = fornecedor ? toTitleCase(fornecedor.nome) : 'N/D'; tabelaProdutos.innerHTML += `<tr><td class="code-column">${prod.codigo}</td><td>${toTitleCase(prod.nome)}</td><td>${nomeFornecedor}</td><td>${formatCurrency(parseFloat(prod.precoVenda))}</td><td>${prod.estoque}</td><td class="actions"><button class="btn-view" data-id="${prod.codigo}" data-type="produto">Ver</button><button class="btn-edit" data-id="${prod.codigo}" data-type="produto">Editar</button><button class="btn-delete" data-id="${prod.codigo}" data-type="produto">Excluir</button></td></tr>`; }); }

    // CLIENTES
    const formCliente = document.getElementById('form-cliente');
    const tabelaClientes = document.getElementById('tabela-clientes');
    formCliente.addEventListener('submit', (e) => { e.preventDefault(); const cliData = { nome: document.getElementById('cli-nome').value.toUpperCase(), cpf: document.getElementById('cli-cpf').value, telefone: document.getElementById('cli-telefone').value, email: document.getElementById('cli-email').value, cep: document.getElementById('cli-cep').value, rua: document.getElementById('cli-rua').value.toUpperCase(), numero: document.getElementById('cli-numero').value, bairro: document.getElementById('cli-bairro').value.toUpperCase(), cidade: document.getElementById('cli-cidade').value.toUpperCase(), uf: document.getElementById('cli-uf').value.toUpperCase() }; if(currentlyEditing.type === 'cliente'){ const item = dbClientes.find(c => c.codigo === currentlyEditing.id); if(item) Object.assign(item, cliData); } else { const cod = 'C' + String(clientCounter++).padStart(3, '0'); dbClientes.push({ codigo: cod, ...cliData }); } renderFunctions.clientes(); resetEditState(formCliente); });
    renderFunctions.clientes = (data = dbClientes) => { tabelaClientes.innerHTML = ""; data.forEach(cliente => { tabelaClientes.innerHTML += `<tr><td class="code-column">${cliente.codigo}</td><td>${toTitleCase(cliente.nome)}</td><td>${cliente.cpf}</td><td>${cliente.telefone}</td><td class="actions"><button class="btn-view" data-id="${cliente.codigo}" data-type="cliente">Ver</button><button class="btn-edit" data-id="${cliente.codigo}" data-type="cliente">Editar</button><button class="btn-delete" data-id="${cliente.codigo}" data-type="cliente">Excluir</button></td></tr>`; }); }

    // VENDEDORES
    const formVendedor = document.getElementById('form-vendedor');
    const tabelaVendedores = document.getElementById('tabela-vendedores');
    formVendedor.addEventListener('submit', (e) => { e.preventDefault(); const vendData = { nome: document.getElementById('vend-nome').value.toUpperCase(), cpf: document.getElementById('vend-cpf').value, telefone: document.getElementById('vend-telefone').value, email: document.getElementById('vend-email').value, cep: document.getElementById('vend-cep').value, rua: document.getElementById('vend-rua').value.toUpperCase(), numero: document.getElementById('vend-numero').value, bairro: document.getElementById('vend-bairro').value.toUpperCase(), cidade: document.getElementById('vend-cidade').value.toUpperCase(), uf: document.getElementById('vend-uf').value.toUpperCase() }; if(currentlyEditing.type === 'vendedor'){ const item = dbVendedores.find(v => v.codigo === currentlyEditing.id); if(item) Object.assign(item, vendData); } else { const cod = 'V' + String(sellerCounter++).padStart(3, '0'); dbVendedores.push({ codigo: cod, ...vendData }); } renderFunctions.vendedores(); resetEditState(formVendedor); });
    renderFunctions.vendedores = (data = dbVendedores) => { tabelaVendedores.innerHTML = ""; data.forEach(vend => { tabelaVendedores.innerHTML += `<tr><td class="code-column">${vend.codigo}</td><td>${toTitleCase(vend.nome)}</td><td>${vend.cpf}</td><td>${vend.telefone}</td><td class="actions"><button class="btn-view" data-id="${vend.codigo}" data-type="vendedor">Ver</button><button class="btn-edit" data-id="${vend.codigo}" data-type="vendedor">Editar</button><button class="btn-delete" data-id="${vend.codigo}" data-type="vendedor">Excluir</button></td></tr>`; }); }

    // FORNECEDORES
    const formFornecedor = document.getElementById('form-fornecedor');
    const tabelaFornecedores = document.getElementById('tabela-fornecedores');
    formFornecedor.addEventListener('submit', (e) => { e.preventDefault(); const fornData = { nome: document.getElementById('forn-nome').value.toUpperCase(), cnpj: document.getElementById('forn-cnpj').value, contato: document.getElementById('forn-contato').value.toUpperCase(), telefone: document.getElementById('forn-telefone').value, cep: document.getElementById('forn-cep').value, rua: document.getElementById('forn-rua').value.toUpperCase(), numero: document.getElementById('forn-numero').value, bairro: document.getElementById('forn-bairro').value.toUpperCase(), cidade: document.getElementById('forn-cidade').value.toUpperCase(), uf: document.getElementById('forn-uf').value.toUpperCase() }; if(currentlyEditing.type === 'fornecedor'){ const item = dbFornecedores.find(f => f.codigo === currentlyEditing.id); if(item) Object.assign(item, fornData); } else { const cod = 'F' + String(supplierCounter++).padStart(3, '0'); dbFornecedores.push({ codigo: cod, ...fornData }); } renderFunctions.fornecedores(); resetEditState(formFornecedor); });
    renderFunctions.fornecedores = (data = dbFornecedores) => { tabelaFornecedores.innerHTML = ""; data.forEach(forn => { tabelaFornecedores.innerHTML += `<tr><td class="code-column">${forn.codigo}</td><td>${toTitleCase(forn.nome)}</td><td>${forn.cnpj}</td><td>${forn.telefone}</td><td class="actions"><button class="btn-view" data-id="${forn.codigo}" data-type="fornecedor">Ver</button><button class="btn-edit" data-id="${forn.codigo}" data-type="fornecedor">Editar</button><button class="btn-delete" data-id="${forn.codigo}" data-type="fornecedor">Excluir</button></td></tr>`; }); }
    
    // CUPONS
    const formCupom = document.getElementById('form-cupom');
    const tabelaCupons = document.getElementById('tabela-cupons');
    formCupom.addEventListener('submit', (e) => { e.preventDefault(); const cupomData = { codigo: document.getElementById('cupom-codigo').value.toUpperCase(), tipo: document.getElementById('cupom-tipo').value, valor: document.getElementById('cupom-valor').value, usos: document.getElementById('cupom-usos').value }; if(currentlyEditing.type === 'cupom'){ const item = dbCupons.find(c => c.codigo === currentlyEditing.id); if(item) Object.assign(item, cupomData);} else { dbCupons.push(cupomData); } renderFunctions.cupons(); resetEditState(formCupom); });
    renderFunctions.cupons = (data = dbCupons) => { tabelaCupons.innerHTML = ""; data.forEach(cupom => { tabelaCupons.innerHTML += `<tr><td class="code-column">${cupom.codigo}</td><td>${cupom.tipo}</td><td>${cupom.valor}</td><td>${cupom.usos}</td><td class="actions"><button class="btn-view" data-id="${cupom.codigo}" data-type="cupom">Ver</button><button class="btn-edit" data-id="${cupom.codigo}" data-type="cupom">Editar</button><button class="btn-delete" data-id="${cupom.codigo}" data-type="cupom">Excluir</button></td></tr>`; }); }

    // LÓGICA DE BUSCA
    function setupSearch(inputId, renderKey, database, searchKeys) {
        const searchInput = document.getElementById(inputId);
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm === '') {
                renderFunctions[renderKey](); 
                return;
            }
            const filteredData = database.filter(item => 
                searchKeys.some(key => 
                    item[key] && item[key].toString().toLowerCase().includes(searchTerm)
                )
            );
            renderFunctions[renderKey](filteredData);
        });
    }

    // INICIALIZAÇÃO DAS BUSCAS
    setupSearch('search-produtos', 'produtos', dbProdutos, ['nome', 'codigo', 'barcode']);
    setupSearch('search-categorias', 'categorias', dbCategorias, ['nome']);
    setupSearch('search-clientes', 'clientes', dbClientes, ['nome', 'cpf', 'codigo']);
    setupSearch('search-vendedores', 'vendedores', dbVendedores, ['nome', 'cpf', 'codigo']);
    setupSearch('search-fornecedores', 'fornecedores', dbFornecedores, ['nome', 'cnpj', 'codigo']);
    setupSearch('search-cupons', 'cupons', dbCupons, ['codigo']);
    
    // --- LÓGICA DE RELATÓRIOS ---
    function renderReports() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const vendasDoDia = dbVendas.filter(venda => {
            const dataVenda = new Date(venda.date);
            dataVenda.setHours(0, 0, 0, 0);
            return dataVenda.getTime() === hoje.getTime();
        });
        
        const faturamentoDia = vendasDoDia.reduce((acc, venda) => acc + venda.total, 0);
        const vendasDia = vendasDoDia.length;
        const ticketMedio = vendasDia > 0 ? faturamentoDia / vendasDia : 0;
        const itensVendidos = vendasDoDia.reduce((acc, venda) => acc + venda.itens.reduce((accItem, item) => accItem + item.quantidade, 0), 0);
        
        document.getElementById('report-faturamento-dia').textContent = formatCurrency(faturamentoDia);
        document.getElementById('report-vendas-dia').textContent = vendasDia;
        document.getElementById('report-ticket-medio').textContent = formatCurrency(ticketMedio);
        document.getElementById('report-itens-vendidos').textContent = itensVendidos;

        const produtosContagem = {};
        vendasDoDia.forEach(venda => {
            venda.itens.forEach(item => {
                produtosContagem[item.codigo] = (produtosContagem[item.codigo] || 0) + item.quantidade;
            });
        });
        const produtosMaisVendidos = Object.entries(produtosContagem).sort(([,a],[,b]) => b - a).slice(0, 5);
        const listaProdutosVendidos = document.getElementById('lista-produtos-vendidos');
        listaProdutosVendidos.innerHTML = '';
        produtosMaisVendidos.forEach(([codigo, qtd]) => {
            const produto = dbProdutos.find(p => p.codigo === codigo);
            if (produto) { listaProdutosVendidos.innerHTML += `<li><span>${toTitleCase(produto.nome)}</span><span>${qtd} un.</span></li>`; }
        });

        const vendasPorVendedor = {};
        vendasDoDia.forEach(venda => {
            const vendedor = dbVendedores.find(v => v.codigo === venda.vendedor.codigo);
            if(vendedor) {
                vendasPorVendedor[vendedor.codigo] = (vendasPorVendedor[vendedor.codigo] || 0) + venda.total;
            }
        });
        const listaVendasVendedor = document.getElementById('lista-vendas-vendedor');
        listaVendasVendedor.innerHTML = '';
        for (const [codigo, total] of Object.entries(vendasPorVendedor)) {
            const vendedor = dbVendedores.find(v => v.codigo === codigo);
            if(vendedor) { listaVendasVendedor.innerHTML += `<li><span>${toTitleCase(vendedor.nome)}</span><span>${formatCurrency(total)}</span></li>`; }
        }

        const estoqueBaixo = dbProdutos.filter(p => p.estoque <= p.estoqueMinimo);
        const listaEstoqueBaixo = document.getElementById('lista-estoque-baixo');
        listaEstoqueBaixo.innerHTML = '';
        if (estoqueBaixo.length > 0) {
            estoqueBaixo.forEach(p => {
                listaEstoqueBaixo.innerHTML += `<li><span>${toTitleCase(p.nome)}</span><span>${p.estoque} / ${p.estoqueMinimo}</span></li>`;
            });
        } else {
            listaEstoqueBaixo.innerHTML = `<li><span>Nenhum item com estoque baixo!</span><span>🎉</span></li>`;
        }

        const ultimasVendas = vendasDoDia.slice(-3).reverse();
        const listaUltimasVendas = document.getElementById('lista-ultimas-vendas');
        listaUltimasVendas.innerHTML = '';
        ultimasVendas.forEach(venda => {
            listaUltimasVendas.innerHTML += `<li><span>${toTitleCase(venda.cliente.nome)}</span><span>${formatCurrency(venda.total)}</span></li>`;
        });
    }

    // --- LÓGICA DE HISTÓRICO DE VENDAS ---
    const tabelaHistorico = document.getElementById('tabela-historico');
    renderFunctions.historico = (data = dbVendas) => {
        tabelaHistorico.innerHTML = "";
        data.forEach(venda => {
            const totalItens = venda.itens.reduce((acc, item) => acc + item.quantidade, 0);
            tabelaHistorico.innerHTML += `<tr><td class="code-column">${venda.recibo}</td><td>${new Date(venda.date).toLocaleString('pt-BR')}</td><td>${toTitleCase(venda.cliente.nome)}</td><td>${toTitleCase(venda.vendedor.nome)}</td><td>${totalItens}</td><td>${formatCurrency(venda.total)}</td><td class="actions"><button class="btn-view btn-reprint" data-id="${venda.recibo}" data-type="venda">Detalhes</button></td></tr>`;
        });
    }

    // LÓGICA PARA MODAIS DE IMPRESSÃO
    const btnReprintNf = document.getElementById('btn-reprint-nf');
    const btnReprintGarantia = document.getElementById('btn-reprint-garantia');
    const docContentEl = document.getElementById('document-content');
    const btnClosePreview = document.getElementById('btn-close-preview');
    const btnPrintDocument = document.getElementById('btn-print-document');

    if (btnReprintNf) btnReprintNf.addEventListener('click', () => showPreview('nf'));
    if (btnReprintGarantia) btnReprintGarantia.addEventListener('click', () => showPreview('garantia'));
    
    if (btnClosePreview) btnClosePreview.addEventListener('click', () => { 
        docPreviewModal.style.display = 'none'; 
        if(postSaleModal) postSaleModal.style.display = 'block'; 
    });

    if (btnPrintDocument) btnPrintDocument.addEventListener('click', () => window.print());
    
    window.addEventListener('afterprint', () => { 
        if(docPreviewModal) { 
            docPreviewModal.style.display = 'none'; 
        } 
    });
    
    function formatCurrency(value) { return typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : String(value); }

    function showPreview(type) {
        docContentEl.innerHTML = generateDocumentHTML(type);
        if (postSaleModal) postSaleModal.style.display = 'none';
        if (docPreviewModal) docPreviewModal.style.display = 'block';
    }

    function generateDocumentHTML(type) {
        const docNumber = lastSaleData.recibo;
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
            if(lastSaleData.discounts) {
                if(lastSaleData.discounts.manualItems && lastSaleData.discounts.manualItems.length > 0) {
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
            const totalDiscountValue = (lastSaleData.subtotal && lastSaleData.total) ? (lastSaleData.subtotal - lastSaleData.total) : 0;
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
                itemsGarantiaHtml += `<tr><td>${toTitleCase(item.nome)}</td><td>${item.serial || 'N/A'}</td><td>${item.garantia || 'N/A'}</td></tr>`;
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
    
    // --- INICIALIZAÇÃO GERAL ---
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
        document.getElementById(activeLink.dataset.target).classList.add('active');
        if(activeLink.dataset.target === 'historico') { renderFunctions.historico(); }
        if(activeLink.dataset.target === 'relatorios') { renderReports(); }
    }
    
    renderFunctions.produtos();
    renderFunctions.categorias();
    renderFunctions.clientes();
    renderFunctions.vendedores();
    renderFunctions.fornecedores();
    renderFunctions.cupons();
    populateCategoryDropdown();
});