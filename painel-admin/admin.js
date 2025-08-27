document.addEventListener('DOMContentLoaded', () => {

 // --- ELEMENTOS PRINCIPAIS DO DOM (DECLARADOS UMA SÓ VEZ AQUI) ---
    const mainContent = document.querySelector('.content'); // Declarado aqui em cima!
    const mainNavLinks = document.querySelectorAll('.sidebar .nav-link');
    const mainContentPanels = document.querySelectorAll('.content > .content-panel');
    const subNavLinks = document.querySelectorAll('.sub-nav-link');
    const subContentPanels = document.querySelectorAll('.sub-panel');

// ==========================================================
// --- LÓGICA DE NAVEGAÇÃO EM DOIS NÍVEIS ---
    mainNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            
            mainNavLinks.forEach(l => l.classList.remove('active'));
            mainContentPanels.forEach(p => p.classList.remove('active'));

            link.classList.add('active');
            const activePanel = document.getElementById(targetId);
            if (activePanel) activePanel.classList.add('active');

            // LÓGICA CORRIGIDA
            if (targetId === 'cadastros' || targetId === 'pdv') { // Usando 'pdv' como descobrimos
                // PRIMEIRO: Limpa TODAS as seleções dos sub-menus
                subNavLinks.forEach(l => l.classList.remove('active'));
                subContentPanels.forEach(p => p.classList.remove('active'));

                // SEGUNDO: Ativa o primeiro sub-item da aba correspondente
                const firstSubNavLink = activePanel.querySelector('.sub-nav-link');
                
                if (firstSubNavLink) {
                    const firstSubPanelId = firstSubNavLink.dataset.target;
                    const firstSubPanel = document.getElementById(firstSubPanelId);

                    firstSubNavLink.classList.add('active');
                    if (firstSubPanel) firstSubPanel.classList.add('active');
                }
            }
            
            if (targetId === 'relatorios') renderReports();
            if (targetId === 'historico') renderFunctions.historico();
        });
    });

    subNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // VERIFICAÇÃO ADICIONADA: Se o link não tiver um 'data-target',
            // ele é um link normal (como o nosso para o PDV), então não fazemos nada.
            if (!link.dataset.target) {
                return;
            }

            // O resto da lógica só executa para os links que são abas.
            e.preventDefault();
            const targetId = link.dataset.target;

            subNavLinks.forEach(l => l.classList.remove('active'));
            subContentPanels.forEach(p => p.classList.remove('active'));

            link.classList.add('active');
            const activeSubPanel = document.getElementById(targetId);
            if (activeSubPanel) activeSubPanel.classList.add('active');
        });
    });

    const STORAGE_KEYS = {
        products: 'amanditaGames_products',
        categories: 'amanditaGames_categories',
        clients: 'amanditaGames_clients',
        sellers: 'amanditaGames_sellers',
        suppliers: 'amanditaGames_suppliers',
        coupons: 'amanditaGames_coupons',
        sales: 'amanditaGames_sales',
        caixas: 'amanditaGames_caixas',
        caixaMovimentacoes: 'amanditaGames_caixaMovimentacoes'
    };

    document.querySelectorAll('.form-container').forEach(form => {
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
            }
        });
    });
// ==========================================================
// --- BANCOS DE DADOS E CONTADORES ---
    let dbCategorias = loadData(STORAGE_KEYS.categories) || [{
        id: 1,
        nome: 'JOGOS PS5'
    }, {
        id: 2,
        nome: 'ACESSÓRIOS'
    }];
    let dbProdutos = loadData(STORAGE_KEYS.products) || [];
    let dbVendedores = loadData(STORAGE_KEYS.sellers) || [];
    let dbClientes = loadData(STORAGE_KEYS.clients) || [];
    let dbFornecedores = loadData(STORAGE_KEYS.suppliers) || [];
    let dbCupons = loadData(STORAGE_KEYS.coupons) || [];
    let dbVendas = loadData(STORAGE_KEYS.sales) || [];
    let dbCaixas = loadData(STORAGE_KEYS.caixas) || [];
    let dbMovimentacoes = loadData(STORAGE_KEYS.caixaMovimentacoes) || [];

    let productCounter = dbProdutos.length ? Math.max(0, ...dbProdutos.map(p => parseInt(p.codigo.replace('P', '')))) + 1 : 1;
    let categoryCounter = dbCategorias.length ? Math.max(0, ...dbCategorias.map(c => c.id)) + 1 : 1;
    let clientCounter = dbClientes.length ? Math.max(0, ...dbClientes.map(c => parseInt(c.codigo.replace('C', '')))) + 1 : 1;
    let sellerCounter = dbVendedores.length ? Math.max(0, ...dbVendedores.map(v => parseInt(v.codigo.replace('V', '')))) + 1 : 1;
    let supplierCounter = dbFornecedores.length ? Math.max(0, ...dbFornecedores.map(f => parseInt(f.codigo.replace('F', '')))) + 1 : 1;

    let currentlyEditing = {
        id: null,
        type: null
    };
    let lastSaleData = {};
    let caixaAtual = null;
// ==========================================================
// --- ELEMENTOS GLOBAIS (MODAIS) ---
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
    const btnAbrirCaixa = document.getElementById('btn-abrir-caixa');
    const btnFecharCaixa = document.getElementById('btn-fechar-caixa');
    const valorFinalInput = document.getElementById('valor-final');
    const valorCalculadoEl = document.getElementById('valor-calculado-sistema'); 
    const diferencaCaixaEl = document.getElementById('diferenca-caixa');

// ==========================================================
// --- LÓGICA DOS MODAIS ---
    if (detailsCloseButton) {
        detailsCloseButton.onclick = () => {
            detailsModal.style.display = "none";
        }
    }
    if (btnCancelDelete) {
        btnCancelDelete.onclick = () => {
            confirmModal.style.display = "none";
        }
    }
    if (confirmCloseButton) {
        confirmCloseButton.onclick = () => {
            confirmModal.style.display = "none";
        }
    }
    if (postSaleCloseButton) {
        postSaleCloseButton.onclick = () => {
            postSaleModal.style.display = "none";
        }
    }
    if (docPreviewCloseButton) {
        docPreviewCloseButton.onclick = () => {
            docPreviewModal.style.display = "none";
        }
    }

    window.onclick = (event) => {
        if (event.target == detailsModal) {
            detailsModal.style.display = "none";
        }
        if (event.target == confirmModal) {
            confirmModal.style.display = "none";
        }
        if (event.target == postSaleModal) {
            postSaleModal.style.display = "none";
        }
        if (event.target == docPreviewModal) {
            docPreviewModal.style.display = "none";
        }
    }
// ==========================================================
// --- FUNÇÕES CRUD (Criar, Ler, Atualizar, Deletar) ---
    function showDetails(itemId, itemType) {
        let item;
        let detailsHtml = '';
        let title = 'Detalhes';
        let actionsHtml = ''; // Espaço para os botões de impressão

        if (itemType === 'venda') {
            item = dbVendas.find(v => v.recibo === itemId);
            // ADICIONE ESTA LINHA ABAIXO:
            lastSaleData = item; // Guardamos a venda encontrada na "memória" global
            if (item) {
                title = `Detalhes da Venda - Recibo Nº ${item.recibo}`;

                let itemsTable = item.itens.map(p => `<tr><td>${p.codigo}</td><td>${toTitleCase(p.nome)}</td><td>${p.quantidade}x</td><td>${formatCurrency(p.preco)}</td></tr>`).join('');

                detailsHtml = `
                    <p><strong>Cliente:</strong> ${toTitleCase(item.cliente.nome)}</p>
                    <p><strong>Vendedor:</strong> ${toTitleCase(item.vendedor.nome)}</p>
                    <p><strong>Data:</strong> ${new Date(item.date).toLocaleString('pt-BR')}</p>
                    <hr>
                    <h4>Itens:</h4>
                    <table class="doc-table">
                        <thead><tr><th>Cód.</th><th>Produto</th><th>Qtd.</th><th>Preço</th></tr></thead>
                        <tbody>${itemsTable}</tbody>
                    </table>
                    <hr>
                    <p><strong>Subtotal:</strong> ${formatCurrency(item.subtotal)}</p>
                    <p><strong>Total Descontos:</strong> ${formatCurrency(item.subtotal - item.total)}</p>
                    <p><strong>TOTAL PAGO:</strong> <span class="detail-highlight">${formatCurrency(item.total)}</span></p>
                `;

                // Adiciona os botões de impressão
                actionsHtml = `
                    <div class="modal-print-actions">
                        <button class="btn-secondary btn-modal-print" data-type="nf">📄 2ª Via Recibo</button>
                        <button class="btn-secondary btn-modal-print" data-type="garantia">📜 2ª Via Garantia</button>
                    </div>
                `;
            }
        } else {
            // A lógica antiga para os outros tipos de item (produto, cliente, etc.)
            // Esta parte é para garantir que a função "Ver" dos outros cadastros continue funcionando
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
                // Os outros cases (categoria, cliente, etc.) continuam aqui...
                case 'categoria':
                    item = dbCategorias.find(c => c.id == itemId);
                    if (item) {
                        title = `Detalhes da Categoria: ${toTitleCase(item.nome)}`;
                        detailsHtml = `<p><strong>ID:</strong> ${item.id}</p><p><strong>Nome:</strong> ${toTitleCase(item.nome)}</p><p><strong>Descrição:</strong> ${item.descricao || 'Nenhuma'}</p>`;
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
        }

        if (item) {
            modalTitle.textContent = title;
            modalBody.innerHTML = detailsHtml + actionsHtml; // Juntamos os detalhes e os botões
            detailsModal.style.display = "block";
        }
    }

    function deleteItem(itemId, itemType) {
        let db, renderFn, key, storageKey;
        switch (itemType) {
            case 'produto':
                db = dbProdutos;
                renderFn = renderFunctions.produtos;
                key = 'codigo';
                storageKey = STORAGE_KEYS.products;
                break;
            case 'categoria':
                db = dbCategorias;
                renderFn = renderFunctions.categorias;
                key = 'id';
                storageKey = STORAGE_KEYS.categories;
                break;
            case 'cliente':
                db = dbClientes;
                renderFn = renderFunctions.clientes;
                key = 'codigo';
                storageKey = STORAGE_KEYS.clients;
                break;
            case 'vendedor':
                db = dbVendedores;
                renderFn = renderFunctions.vendedores;
                key = 'codigo';
                storageKey = STORAGE_KEYS.sellers;
                break;
            case 'fornecedor':
                db = dbFornecedores;
                renderFn = renderFunctions.fornecedores;
                key = 'codigo';
                storageKey = STORAGE_KEYS.suppliers;
                break;
            case 'cupom':
                db = dbCupons;
                renderFn = renderFunctions.cupons;
                key = 'codigo';
                storageKey = STORAGE_KEYS.coupons;
                break;
        }
        if (!db) return;
        const itemIndex = db.findIndex(item => String(item[key]) === String(itemId));
        if (itemIndex > -1) {
            db.splice(itemIndex, 1);
            if (storageKey) saveData(storageKey, db);
            if (renderFn) renderFn(db);
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
        currentlyEditing = {
            id: itemId,
            type: itemType
        };
        let item, form, button;
        switch (itemType) {
            case 'produto':
                item = dbProdutos.find(p => p.codigo === itemId);
                form = document.getElementById('form-produto');
                button = document.getElementById('btn-salvar-produto');
                if (item && form) {
                    form.elements['prod-nome'].value = item.nome || '';
                    form.elements['prod-barcode'].value = item.barcode || '';
                    form.elements['prod-categoria'].value = item.categoriaId || '';
                    form.elements['prod-condicao'].value = item.condicao || 'Novo';
                    form.elements['prod-garantia'].value = item.garantia || '3 Meses';
                    form.elements['prod-serial'].value = item.serial || '';
                    form.elements['prod-preco-custo'].value = item.precoCusto || '';
                    form.elements['prod-preco'].value = item.precoVenda || '';
                    form.elements['prod-fornecedor-codigo'].value = item.fornecedorCodigo || '';
                    form.elements['prod-estoque'].value = item.estoque || 0;
                    form.elements['prod-estoque-minimo'].value = item.estoqueMinimo || 0;
                    form.elements['prod-localizacao'].value = item.localizacao || '';
                    form.elements['prod-plataforma'].value = item.plataforma || '';
                    form.elements['prod-lancamento'].value = item.lancamento || '';
                    form.elements['prod-tags'].value = item.tags || '';
                    document.getElementById('prod-fornecedor-codigo').dispatchEvent(new Event('input'));
                    button.textContent = 'Atualizar Produto';
                }
                break;
            case 'categoria':
                item = dbCategorias.find(c => c.id == itemId);
                form = document.getElementById('form-categoria');
                button = document.getElementById('btn-salvar-categoria');
                if (item && form) {
                    form.elements['cat-nome'].value = item.nome;
                    button.textContent = 'Atualizar Categoria';
                }
                break;
            case 'cliente':
                item = dbClientes.find(c => c.codigo === itemId);
                form = document.getElementById('form-cliente');
                button = document.getElementById('btn-salvar-cliente');
                if (item && form) {
                    form.elements['cli-nome'].value = item.nome || '';
                    form.elements['cli-cpf'].value = item.cpf || '';
                    form.elements['cli-email'].value = item.email || '';
                    form.elements['cli-telefone'].value = item.telefone || '';
                    form.elements['cli-cep'].value = item.cep || '';
                    form.elements['cli-rua'].value = item.rua || '';
                    form.elements['cli-numero'].value = item.numero || '';
                    form.elements['cli-bairro'].value = item.bairro || '';
                    form.elements['cli-cidade'].value = item.cidade || '';
                    form.elements['cli-uf'].value = item.uf || '';
                    button.textContent = 'Atualizar Cliente';
                }
                break;
            case 'vendedor':
                item = dbVendedores.find(v => v.codigo === itemId);
                form = document.getElementById('form-vendedor');
                button = document.getElementById('btn-salvar-vendedor');
                if (item && form) {
                    form.elements['vend-nome'].value = item.nome || '';
                    form.elements['vend-cpf'].value = item.cpf || '';
                    form.elements['vend-telefone'].value = item.telefone || '';
                    form.elements['vend-email'].value = item.email || '';
                    form.elements['vend-cep'].value = item.cep || '';
                    form.elements['vend-rua'].value = item.rua || '';
                    form.elements['vend-numero'].value = item.numero || '';
                    form.elements['vend-bairro'].value = item.bairro || '';
                    form.elements['vend-cidade'].value = item.cidade || '';
                    form.elements['vend-uf'].value = item.uf || '';
                    button.textContent = 'Atualizar Vendedor';
                }
                break;
            case 'fornecedor':
                item = dbFornecedores.find(f => f.codigo === itemId);
                form = document.getElementById('form-fornecedor');
                button = document.getElementById('btn-salvar-fornecedor');
                if (item && form) {
                    form.elements['forn-nome'].value = item.nome || '';
                    form.elements['forn-cnpj'].value = item.cnpj || '';
                    form.elements['forn-contato'].value = item.contato || '';
                    form.elements['forn-telefone'].value = item.telefone || '';
                    form.elements['forn-cep'].value = item.cep || '';
                    form.elements['forn-rua'].value = item.rua || '';
                    form.elements['forn-numero'].value = item.numero || '';
                    form.elements['forn-bairro'].value = item.bairro || '';
                    form.elements['forn-cidade'].value = item.cidade || '';
                    form.elements['forn-uf'].value = item.uf || '';
                    button.textContent = 'Atualizar Fornecedor';
                }
                break;
            case 'cupom':
                item = dbCupons.find(c => c.codigo === itemId);
                form = document.getElementById('form-cupom');
                button = document.getElementById('btn-salvar-cupom');
                if (item && form) {
                    form.elements['cupom-codigo'].value = item.codigo || '';
                    form.elements['cupom-tipo'].value = item.tipo || 'fixed';
                    form.elements['cupom-valor'].value = item.valor || '';
                    form.elements['cupom-usos'].value = item.usos || 1;
                    button.textContent = 'Atualizar Cupom';
                }
                break;
        }
        mainContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function resetEditState(form) {
        let buttonText = 'Salvar';
        switch (form.id) {
            case 'form-produto':
                buttonText = 'Salvar Produto';
                break;
            case 'form-categoria':
                buttonText = 'Salvar Categoria';
                break;
            case 'form-cliente':
                buttonText = 'Salvar Cliente';
                break;
            case 'form-vendedor':
                buttonText = 'Salvar Vendedor';
                break;
            case 'form-fornecedor':
                buttonText = 'Salvar Fornecedor';
                break;
            case 'form-cupom':
                buttonText = 'Salvar Cupom';
                break;
        }
        currentlyEditing = {
            id: null,
            type: null
        };
        if (form) {
            form.querySelector('.btn-primary').textContent = buttonText;
            form.reset();
        }
    }

    function setupEnterKeyNavigation(formElement) {
        const focusableElements = Array.from(
            formElement.querySelectorAll('input, select, textarea, button:not([type="button"])')
        );

        formElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const currentElement = e.target;
                const currentIndex = focusableElements.indexOf(currentElement);

                // Se o Enter for pressionado em um campo que não seja o último
                if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
                    e.preventDefault(); // Impede o comportamento padrão (como submeter o form)
                    const nextElement = focusableElements[currentIndex + 1];
                    nextElement.focus(); // Move o foco para o próximo elemento
                }
            }
        });
    }

    function renderCaixaView() {
        const fechadoView = document.getElementById('caixa-fechado-view');
        const abertoView = document.getElementById('caixa-aberto-view');

        if (caixaAtual) {
            fechadoView.style.display = 'none';
            abertoView.style.display = 'block';
            document.getElementById('info-data-abertura').textContent = new Date(caixaAtual.dataAbertura).toLocaleString('pt-BR');
            document.getElementById('info-valor-abertura').textContent = formatCurrency(caixaAtual.valorAbertura);
            document.getElementById('valor-final').value = '';
            calcularEExibirFechamento(); // Calcula os valores assim que a tela abre
        } else {
            fechadoView.style.display = 'block';
            abertoView.style.display = 'none';
            document.getElementById('valor-inicial').value = '';
        }
        renderMovimentacoesView(); // ATUALIZA A TELA DE SANGRIAS/SUPRIMENTOS
    }

    function calcularEExibirFechamento() {
        if (!caixaAtual) return; // Só executa se um caixa estiver aberto

        // 1. Pega o valor inicial do caixa
        let valorCalculado = caixaAtual.valorAbertura;

        // 2. Soma as VENDAS EM DINHEIRO feitas durante esta sessão
        const vendasDaSessao = dbVendas.filter(venda => 
            new Date(venda.date) > new Date(caixaAtual.dataAbertura) &&
            venda.paymentMethod === 'Dinheiro'
        );
        const totalVendasDinheiro = vendasDaSessao.reduce((acc, venda) => acc + venda.total, 0);
        valorCalculado += totalVendasDinheiro;

        // 3. Soma os SUPRIMENTOS e subtrai as SANGRIAS desta sessão
        const movimentacoesDaSessao = dbMovimentacoes.filter(mov => mov.caixaId === caixaAtual.id);
        movimentacoesDaSessao.forEach(mov => {
            if (mov.tipo === 'SUPRIMENTO') {
                valorCalculado += mov.valor;
            } else if (mov.tipo === 'SANGRIA') {
                valorCalculado -= mov.valor;
            }
        });

        // Exibe o valor calculado na tela
        valorCalculadoEl.textContent = formatCurrency(valorCalculado);

        // 4. Calcula e exibe a DIFERENÇA (Sobra/Falta)
        const valorFinalDigitado = parseFloat(valorFinalInput.value) || 0;
        const diferenca = valorFinalDigitado - valorCalculado;

        diferencaCaixaEl.textContent = formatCurrency(diferenca);
        diferencaCaixaEl.classList.remove('sobra', 'falta'); // Limpa as cores
        if (diferenca > 0) {
            diferencaCaixaEl.classList.add('sobra');
        } else if (diferenca < 0) {
            diferencaCaixaEl.classList.add('falta');
        }

        return { valorCalculado, diferenca }; // Retorna os valores para uso posterior
    }

    if (valorFinalInput) {
        valorFinalInput.addEventListener('input', calcularEExibirFechamento);
    }
        document.addEventListener('click', (e) => {
        const target = e.target; // O 'target' agora é pego aqui dentro

        // Lógica para os botões de ação nas tabelas de cadastro
        if (target.classList.contains('btn-view') || target.classList.contains('btn-edit') || target.classList.contains('btn-delete')) {
            // Previne que a mesma lógica se aplique aos botões de reimpressão
            if (!target.classList.contains('btn-sale-details')) {
                const itemId = target.dataset.id;
                const itemType = target.dataset.type;

                if (target.classList.contains('btn-view')) {
                    showDetails(itemId, itemType);
                }
                if (target.classList.contains('btn-edit')) {
                    editItem(itemId, itemType);
                }
                if (target.classList.contains('btn-delete')) {
                    openConfirmModal(itemId, itemType);
                }
            }
        }

        // Se o botão de detalhes de VENDA na tabela for clicado
        if (target.classList.contains('btn-sale-details')) {
            const vendaId = target.dataset.id;
            showDetails(vendaId, 'venda');
        }

        // Se um dos botões de impressão DENTRO DO MODAL for clicado
        if (target.classList.contains('btn-modal-print')) {
            const printType = target.dataset.type;
            // Apenas checamos se a "memória" (lastSaleData) não está vazia
            if (lastSaleData) {
                showPreview(printType);
            }
        }
    });

// ==========================================================
// --- SEÇÃO DE CADASTROS (Handlers e Renderização) ---
    const renderFunctions = {};

    // CATEGORIAS
    const formCategoria = document.getElementById('form-categoria');
    const tabelaCategorias = document.getElementById('tabela-categorias');
    const selectCategoriaProduto = document.getElementById('prod-categoria');
    if (formCategoria) {
        formCategoria.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('cat-nome').value.toUpperCase();
            const descricao = document.getElementById('cat-descricao').value;
            if (!nome) return;
            if (currentlyEditing.type === 'categoria') {
                const item = dbCategorias.find(c => c.id == currentlyEditing.id);
                if (item) {
                    item.nome = nome;
                    item.descricao = descricao;
                }
            } else {
                const id = categoryCounter++;
                dbCategorias.push({
                    id,
                    nome,
                    descricao
                });
            }
            saveData(STORAGE_KEYS.categories, dbCategorias);
            renderFunctions.categorias();
            populateCategoryDropdown();
            resetEditState(formCategoria);
        });
    }
    renderFunctions.categorias = (data = dbCategorias) => {
        if (!tabelaCategorias) return;
        tabelaCategorias.innerHTML = "";
        data.forEach(cat => {
            tabelaCategorias.innerHTML += `<tr><td>${toTitleCase(cat.nome)}</td><td>${cat.descricao || 'N/A'}</td><td class="actions"><button class="btn-view" data-id="${cat.id}" data-type="categoria">Ver</button><button class="btn-edit" data-id="${cat.id}" data-type="categoria">Editar</button><button class="btn-delete" data-id="${cat.id}" data-type="categoria">Excluir</button></td></tr>`;
        });
    }

    function populateCategoryDropdown() {
        if (!selectCategoriaProduto) return;
        selectCategoriaProduto.innerHTML = '<option value="">Selecione...</option>';
        dbCategorias.forEach(cat => {
            selectCategoriaProduto.innerHTML += `<option value="${cat.id}">${toTitleCase(cat.nome)}</option>`;
        });
    }

// ==========================================================
// PRODUTOS
    const formProduto = document.getElementById('form-produto');
    const tabelaProdutos = document.getElementById('tabela-produtos');
    const prodFornecedorCodigoInput = document.getElementById('prod-fornecedor-codigo');
    const prodFornecedorNomeSpan = document.getElementById('prod-fornecedor-nome');
    if (prodFornecedorCodigoInput) {
        prodFornecedorCodigoInput.addEventListener('input', () => {
            const codigo = prodFornecedorCodigoInput.value.toUpperCase();
            if (!codigo) {
                prodFornecedorNomeSpan.textContent = '';
                return;
            }
            const fornecedor = dbFornecedores.find(f => f.codigo === codigo);
            if (fornecedor) {
                prodFornecedorNomeSpan.textContent = toTitleCase(fornecedor.nome);
                prodFornecedorNomeSpan.classList.remove('error');
            } else {
                prodFornecedorNomeSpan.textContent = 'Código não encontrado';
                prodFornecedorNomeSpan.classList.add('error');
            }
        });
    }
    if (formProduto) {
        formProduto.addEventListener('submit', (e) => {
            e.preventDefault();
            const prodData = {
                nome: document.getElementById('prod-nome').value.toUpperCase(),
                barcode: document.getElementById('prod-barcode').value,
                categoriaId: document.getElementById('prod-categoria').value,
                condicao: document.getElementById('prod-condicao').value,
                garantia: document.getElementById('prod-garantia').value,
                serial: document.getElementById('prod-serial').value.toUpperCase(),
                precoCusto: document.getElementById('prod-preco-custo').value,
                precoVenda: document.getElementById('prod-preco').value,
                fornecedorCodigo: prodFornecedorCodigoInput.value.toUpperCase(),
                estoque: document.getElementById('prod-estoque').value,
                estoqueMinimo: document.getElementById('prod-estoque-minimo').value,
                localizacao: document.getElementById('prod-localizacao').value.toUpperCase(),
                plataforma: document.getElementById('prod-plataforma').value.toUpperCase(),
                lancamento: document.getElementById('prod-lancamento').value,
                tags: document.getElementById('prod-tags').value.toUpperCase()
            };
            if (currentlyEditing.type === 'produto') {
                const item = dbProdutos.find(p => p.codigo === currentlyEditing.id);
                if (item) Object.assign(item, prodData);
            } else {
                const cod = 'P' + String(productCounter++).padStart(3, '0');
                dbProdutos.push({
                    codigo: cod,
                    ...prodData
                });
            }
            saveData(STORAGE_KEYS.products, dbProdutos);
            renderFunctions.produtos();
            resetEditState(formProduto);
            if (prodFornecedorNomeSpan) prodFornecedorNomeSpan.textContent = '';
        });
    }
    renderFunctions.produtos = (data = dbProdutos) => {
        if (!tabelaProdutos) return;
        tabelaProdutos.innerHTML = "";
        data.forEach(prod => {
            const fornecedor = dbFornecedores.find(f => f.codigo === prod.fornecedorCodigo);
            const nomeFornecedor = fornecedor ? toTitleCase(fornecedor.nome) : 'N/D';
            tabelaProdutos.innerHTML += `<tr><td class="code-column">${prod.codigo}</td><td>${toTitleCase(prod.nome)}</td><td>${nomeFornecedor}</td><td>${formatCurrency(parseFloat(prod.precoVenda))}</td><td>${prod.estoque}</td><td class="actions"><button class="btn-view" data-id="${prod.codigo}" data-type="produto">Ver</button><button class="btn-edit" data-id="${prod.codigo}" data-type="produto">Editar</button><button class="btn-delete" data-id="${prod.codigo}" data-type="produto">Excluir</button></td></tr>`;
        });
    }
// ==========================================================
// CLIENTES
    const formCliente = document.getElementById('form-cliente');
    const tabelaClientes = document.getElementById('tabela-clientes');
    if (formCliente) {
        formCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            const cliData = {
                nome: document.getElementById('cli-nome').value.toUpperCase(),
                cpf: document.getElementById('cli-cpf').value,
                telefone: document.getElementById('cli-telefone').value,
                email: document.getElementById('cli-email').value,
                cep: document.getElementById('cli-cep').value,
                rua: document.getElementById('cli-rua').value.toUpperCase(),
                numero: document.getElementById('cli-numero').value,
                bairro: document.getElementById('cli-bairro').value.toUpperCase(),
                cidade: document.getElementById('cli-cidade').value.toUpperCase(),
                uf: document.getElementById('cli-uf').value.toUpperCase()
            };
            if (currentlyEditing.type === 'cliente') {
                const item = dbClientes.find(c => c.codigo === currentlyEditing.id);
                if (item) Object.assign(item, cliData);
            } else {
                const cod = 'C' + String(clientCounter++).padStart(3, '0');
                dbClientes.push({
                    codigo: cod,
                    ...cliData
                });
            }
            saveData(STORAGE_KEYS.clients, dbClientes);
            renderFunctions.clientes();
            resetEditState(formCliente);
        });
    }
    renderFunctions.clientes = (data = dbClientes) => {
        if (!tabelaClientes) return;
        tabelaClientes.innerHTML = "";
        data.forEach(cliente => {
            tabelaClientes.innerHTML += `<tr><td class="code-column">${cliente.codigo}</td><td>${toTitleCase(cliente.nome)}</td><td>${cliente.cpf}</td><td>${cliente.telefone}</td><td class="actions"><button class="btn-view" data-id="${cliente.codigo}" data-type="cliente">Ver</button><button class="btn-edit" data-id="${cliente.codigo}" data-type="cliente">Editar</button><button class="btn-delete" data-id="${cliente.codigo}" data-type="cliente">Excluir</button></td></tr>`;
        });
    }
// ==========================================================
// VENDEDORES
    const formVendedor = document.getElementById('form-vendedor');
    const tabelaVendedores = document.getElementById('tabela-vendedores');
    if (formVendedor) {
        formVendedor.addEventListener('submit', (e) => {
            e.preventDefault();
            const vendData = {
                nome: document.getElementById('vend-nome').value.toUpperCase(),
                cpf: document.getElementById('vend-cpf').value,
                telefone: document.getElementById('vend-telefone').value,
                email: document.getElementById('vend-email').value,
                cep: document.getElementById('vend-cep').value,
                rua: document.getElementById('vend-rua').value.toUpperCase(),
                numero: document.getElementById('vend-numero').value,
                bairro: document.getElementById('vend-bairro').value.toUpperCase(),
                cidade: document.getElementById('vend-cidade').value.toUpperCase(),
                uf: document.getElementById('vend-uf').value.toUpperCase()
            };
            if (currentlyEditing.type === 'vendedor') {
                const item = dbVendedores.find(v => v.codigo === currentlyEditing.id);
                if (item) Object.assign(item, vendData);
            } else {
                const cod = 'V' + String(sellerCounter++).padStart(3, '0');
                dbVendedores.push({
                    codigo: cod,
                    ...vendData
                });
            }
            saveData(STORAGE_KEYS.sellers, dbVendedores);
            renderFunctions.vendedores();
            resetEditState(formVendedor);
        });
    }
    renderFunctions.vendedores = (data = dbVendedores) => {
        if (!tabelaVendedores) return;
        tabelaVendedores.innerHTML = "";
        data.forEach(vend => {
            tabelaVendedores.innerHTML += `<tr><td class="code-column">${vend.codigo}</td><td>${toTitleCase(vend.nome)}</td><td>${vend.cpf}</td><td>${vend.telefone}</td><td class="actions"><button class="btn-view" data-id="${vend.codigo}" data-type="vendedor">Ver</button><button class="btn-edit" data-id="${vend.codigo}" data-type="vendedor">Editar</button><button class="btn-delete" data-id="${vend.codigo}" data-type="vendedor">Excluir</button></td></tr>`;
        });
    }
// ==========================================================
// FORNECEDORES
    const formFornecedor = document.getElementById('form-fornecedor');
    const tabelaFornecedores = document.getElementById('tabela-fornecedores');
    if (formFornecedor) {
        formFornecedor.addEventListener('submit', (e) => {
            e.preventDefault();
            const fornData = {
                nome: document.getElementById('forn-nome').value.toUpperCase(),
                cnpj: document.getElementById('forn-cnpj').value,
                contato: document.getElementById('forn-contato').value.toUpperCase(),
                telefone: document.getElementById('forn-telefone').value,
                cep: document.getElementById('forn-cep').value,
                rua: document.getElementById('forn-rua').value.toUpperCase(),
                numero: document.getElementById('forn-numero').value,
                bairro: document.getElementById('forn-bairro').value.toUpperCase(),
                cidade: document.getElementById('forn-cidade').value.toUpperCase(),
                uf: document.getElementById('forn-uf').value.toUpperCase()
            };
            if (currentlyEditing.type === 'fornecedor') {
                const item = dbFornecedores.find(f => f.codigo === currentlyEditing.id);
                if (item) Object.assign(item, fornData);
            } else {
                const cod = 'F' + String(supplierCounter++).padStart(3, '0');
                dbFornecedores.push({
                    codigo: cod,
                    ...fornData
                });
            }
            saveData(STORAGE_KEYS.suppliers, dbFornecedores);
            renderFunctions.fornecedores();
            resetEditState(formFornecedor);
        });
    }
    renderFunctions.fornecedores = (data = dbFornecedores) => {
        if (!tabelaFornecedores) return;
        tabelaFornecedores.innerHTML = "";
        data.forEach(forn => {
            tabelaFornecedores.innerHTML += `<tr><td class="code-column">${forn.codigo}</td><td>${toTitleCase(forn.nome)}</td><td>${forn.cnpj}</td><td>${forn.telefone}</td><td class="actions"><button class="btn-view" data-id="${forn.codigo}" data-type="fornecedor">Ver</button><button class="btn-edit" data-id="${forn.codigo}" data-type="fornecedor">Editar</button><button class="btn-delete" data-id="${forn.codigo}" data-type="fornecedor">Excluir</button></td></tr>`;
        });
    }
// ==========================================================
// CUPONS
    const formCupom = document.getElementById('form-cupom');
    const tabelaCupons = document.getElementById('tabela-cupons');
    if (formCupom) {
        formCupom.addEventListener('submit', (e) => {
            e.preventDefault();
            const cupomData = {
                codigo: document.getElementById('cupom-codigo').value.toUpperCase(),
                tipo: document.getElementById('cupom-tipo').value,
                valor: document.getElementById('cupom-valor').value,
                usos: document.getElementById('cupom-usos').value
            };
            if (currentlyEditing.type === 'cupom') {
                const item = dbCupons.find(c => c.codigo === currentlyEditing.id);
                if (item) Object.assign(item, cupomData);
            } else {
                dbCupons.push(cupomData);
            }
            saveData(STORAGE_KEYS.coupons, dbCupons);
            renderFunctions.cupons();
            resetEditState(formCupom);
        });
    }
    renderFunctions.cupons = (data = dbCupons) => {
        if (!tabelaCupons) return;
        tabelaCupons.innerHTML = "";
        data.forEach(cupom => {
            tabelaCupons.innerHTML += `<tr><td class="code-column">${cupom.codigo}</td><td>${cupom.tipo}</td><td>${cupom.valor}</td><td>${cupom.usos}</td><td class="actions"><button class="btn-view" data-id="${cupom.codigo}" data-type="cupom">Ver</button><button class="btn-edit" data-id="${cupom.codigo}" data-type="cupom">Editar</button><button class="btn-delete" data-id="${cupom.codigo}" data-type="cupom">Excluir</button></td></tr>`;
        });
    }
// ==========================================================
// --- FUNÇÕES DE BUSCA E RELATÓRIOS ---
    function setupSearch(inputId, renderKey, database, searchKeys) {
        const searchInput = document.getElementById(inputId);
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm === '') {
                renderFunctions[renderKey](database);
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

    function renderReports() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const vendasDoDia = dbVendas.filter(venda => {
            const dataVenda = new Date(venda.date);
            dataVenda.setHours(0, 0, 0, 0);
            return dataVenda.getTime() === hoje.getTime();
        });

        document.getElementById('report-faturamento-dia').textContent = formatCurrency(vendasDoDia.reduce((acc, venda) => acc + venda.total, 0));
        document.getElementById('report-vendas-dia').textContent = vendasDoDia.length;
        document.getElementById('report-ticket-medio').textContent = formatCurrency(vendasDoDia.length > 0 ? vendasDoDia.reduce((acc, venda) => acc + venda.total, 0) / vendasDoDia.length : 0);
        document.getElementById('report-itens-vendidos').textContent = vendasDoDia.reduce((acc, venda) => acc + venda.itens.reduce((accItem, item) => accItem + item.quantidade, 0), 0);

        const produtosContagem = {};
        vendasDoDia.forEach(venda => {
            venda.itens.forEach(item => {
                produtosContagem[item.codigo] = (produtosContagem[item.codigo] || 0) + item.quantidade;
            });
        });
        const produtosMaisVendidos = Object.entries(produtosContagem).sort(([, a], [, b]) => b - a).slice(0, 5);
        const listaProdutosVendidos = document.getElementById('lista-produtos-vendidos');
        listaProdutosVendidos.innerHTML = '';
        produtosMaisVendidos.forEach(([codigo, qtd]) => {
            const produto = dbProdutos.find(p => p.codigo === codigo);
            if (produto) {
                listaProdutosVendidos.innerHTML += `<li><span>${toTitleCase(produto.nome)}</span><span>${qtd} un.</span></li>`;
            }
        });

        const vendasPorVendedor = {};
        vendasDoDia.forEach(venda => {
            if (venda.vendedor && venda.vendedor.codigo) {
                vendasPorVendedor[venda.vendedor.codigo] = (vendasPorVendedor[venda.vendedor.codigo] || 0) + venda.total;
            }
        });
        const listaVendasVendedor = document.getElementById('lista-vendas-vendedor');
        listaVendasVendedor.innerHTML = '';
        for (const [codigo, total] of Object.entries(vendasPorVendedor)) {
            const vendedor = dbVendedores.find(v => v.codigo === codigo);
            if (vendedor) {
                listaVendasVendedor.innerHTML += `<li><span>${toTitleCase(vendedor.nome)}</span><span>${formatCurrency(total)}</span></li>`;
            }
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

    const tabelaHistorico = document.getElementById('tabela-historico');
    renderFunctions.historico = (data = dbVendas) => {
        if (!tabelaHistorico) return;
        tabelaHistorico.innerHTML = "";
        data.forEach(venda => {
            const totalItens = venda.itens.reduce((acc, item) => acc + item.quantidade, 0);
            tabelaHistorico.innerHTML += `<tr><td class="code-column">${venda.recibo}</td><td>${new Date(venda.date).toLocaleString('pt-BR')}</td><td>${toTitleCase(venda.cliente.nome)}</td><td>${toTitleCase(venda.vendedor.nome)}</td><td>${totalItens}</td><td>${formatCurrency(venda.total)}</td><td class="actions"><button class="btn-view btn-sale-details" data-id="${venda.recibo}" data-type="venda">Detalhes</button></td></tr>`;
        });
    }
// ==========================================================
// --- FUNÇÕES DE IMPRESSÃO ---
    const btnPrintNf = document.getElementById('btn-print-nf');
    const btnPrintGarantia = document.getElementById('btn-print-garantia');
    const docContentEl = document.getElementById('document-content');
    const btnClosePreview = document.getElementById('btn-close-preview');
    const btnPrintDocument = document.getElementById('btn-print-document');

    if (btnPrintNf) btnPrintNf.addEventListener('click', () => showPreview('nf'));
    if (btnPrintGarantia) btnPrintGarantia.addEventListener('click', () => showPreview('garantia'));
    if (btnClosePreview) btnClosePreview.addEventListener('click', () => {
        docPreviewModal.style.display = 'none';
        if (postSaleModal) postSaleModal.style.display = 'block';
    });
    if (btnPrintDocument) btnPrintDocument.addEventListener('click', () => window.print());
    window.addEventListener('afterprint', () => {
        if (docPreviewModal) {
            docPreviewModal.style.display = 'none';
        }
    });

    function showPreview(type) {
        docContentEl.innerHTML = generateDocumentHTML(type, lastSaleData, dbProdutos);
        if (postSaleModal) postSaleModal.style.display = 'none';
        if (docPreviewModal) docPreviewModal.style.display = 'block';
    }
// ==========================================================
// --- LÓGICA DE ABERTURA E FECHAMENTO DE CAIXA ---
    if (btnAbrirCaixa) {
        btnAbrirCaixa.addEventListener('click', () => {
            const valorInicialInput = document.getElementById('valor-inicial');
            const valorAbertura = parseFloat(valorInicialInput.value);

            if (isNaN(valorAbertura) || valorAbertura < 0) {
                alert('Por favor, insira um valor de abertura válido.');
                return;
            }

            // Cria o novo registro de caixa
            caixaAtual = {
                id: Date.now(),
                dataAbertura: new Date().toISOString(),
                valorAbertura: valorAbertura,
                status: 'ABERTO',
                // Campos para o fechamento
                dataFechamento: null,
                valorFechamento: null,
            };

            dbCaixas.push(caixaAtual);
            saveData(STORAGE_KEYS.caixas, dbCaixas);
            renderCaixaView(); // Atualiza a tela
        });
    }

    if (btnFecharCaixa) {
        btnFecharCaixa.addEventListener('click', () => {
            const valorFinalInput = document.getElementById('valor-final');
            const valorFechamento = parseFloat(valorFinalInput.value);

            if (isNaN(valorFechamento) || valorFechamento < 0) {
                alert('Por favor, insira um valor de fechamento válido.');
                return;
            }

            // Pega os valores finais calculados
            const { valorCalculado, diferenca } = calcularEExibirFechamento();

            const caixaParaFechar = dbCaixas.find(c => c.id === caixaAtual.id);
            if (caixaParaFechar) {
                caixaParaFechar.dataFechamento = new Date().toISOString();
                caixaParaFechar.valorFechamento = valorFechamento;
                caixaParaFechar.valorCalculadoSistema = valorCalculado; // SALVA O VALOR CALCULADO
                caixaParaFechar.diferenca = diferenca; // SALVA A DIFERENÇA
                caixaParaFechar.status = 'FECHADO';

                saveData(STORAGE_KEYS.caixas, dbCaixas);
                caixaAtual = null;
                renderCaixaView();
            }
        });
    }

// --- LÓGICA DE SANGRIAS E SUPRIMENTOS ---
    const btnRegistrarSangria = document.getElementById('btn-registrar-sangria');
    const btnRegistrarSuprimento = document.getElementById('btn-registrar-suprimento');

    function renderMovimentacoesView() {
        const bloqueadoView = document.getElementById('movimentacoes-bloqueado-view');
        const movimentacoesView = document.getElementById('movimentacoes-view');

        if (caixaAtual) { // Se o caixa está aberto, mostra os formulários
            bloqueadoView.style.display = 'none';
            movimentacoesView.style.display = 'block';
        } else { // Se o caixa está fechado, mostra a mensagem de bloqueio
            bloqueadoView.style.display = 'block';
            movimentacoesView.style.display = 'none';
        }
    }

    if (btnRegistrarSangria) {
        btnRegistrarSangria.addEventListener('click', () => {
            const valor = parseFloat(document.getElementById('sangria-valor').value);
            const motivo = document.getElementById('sangria-motivo').value;

            if (isNaN(valor) || valor <= 0) {
                alert('Por favor, insira um valor válido para a sangria.');
                return;
            }

            // Cria o registro da movimentação
            dbMovimentacoes.push({
                id: Date.now(),
                caixaId: caixaAtual.id,
                tipo: 'SANGRIA',
                valor: valor,
                motivo: motivo,
                data: new Date().toISOString()
            });

            saveData(STORAGE_KEYS.caixaMovimentacoes, dbMovimentacoes);
            alert(`Sangria de ${formatCurrency(valor)} registrada com sucesso!`);
            document.getElementById('sangria-valor').value = '';
            document.getElementById('sangria-motivo').value = '';
        });
    }

    if (btnRegistrarSuprimento) {
        btnRegistrarSuprimento.addEventListener('click', () => {
            const valor = parseFloat(document.getElementById('suprimento-valor').value);
            const motivo = document.getElementById('suprimento-motivo').value;

            if (isNaN(valor) || valor <= 0) {
                alert('Por favor, insira um valor válido para o suprimento.');
                return;
            }

            dbMovimentacoes.push({
                id: Date.now(),
                caixaId: caixaAtual.id,
                tipo: 'SUPRIMENTO',
                valor: valor,
                motivo: motivo,
                data: new Date().toISOString()
            });

            saveData(STORAGE_KEYS.caixaMovimentacoes, dbMovimentacoes);
            alert(`Suprimento de ${formatCurrency(valor)} registrado com sucesso!`);
            document.getElementById('suprimento-valor').value = '';
            document.getElementById('suprimento-motivo').value = '';
        });
    }



// ==========================================================
// --- INICIALIZAÇÃO GERAL ---

    // Tenta encontrar um caixa que foi deixado aberto
    caixaAtual = dbCaixas.find(c => c.status === 'ABERTO') || null;
    renderCaixaView(); // Renderiza a visão correta do caixa (aberto ou fechado)

    const activeSidebarLink = document.querySelector('.sidebar .nav-link.active');
    if (activeSidebarLink) {
        activeSidebarLink.click();
    }

    renderFunctions.produtos();
    renderFunctions.categorias();
    renderFunctions.clientes();
    renderFunctions.vendedores();
    renderFunctions.fornecedores();
    renderFunctions.cupons();
    populateCategoryDropdown();


// ==========================================================
// --- NAVEGAÇÃO POR "ENTER" NOS FORMULÁRIOS ---
    document.querySelectorAll('.form-container').forEach(form => {
        setupEnterKeyNavigation(form);
    });

// ==========================================================
// LÓGICA PARA OS NOVOS BOTÕES DE FLUIDEZ
    
    const clearFormButtons = document.querySelectorAll('.btn-limpar');
    clearFormButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Pega o ID do formulário alvo que definimos no HTML (ex: '#form-produto')
            const formSelector = button.dataset.formTarget;
            if (formSelector) {
                // Encontra o formulário na página usando o seletor
                const formToClear = document.querySelector(formSelector);
                if (formToClear) {
                    formToClear.reset(); // Limpa o formulário encontrado!

                    // Lógica extra para o campo de fornecedor
                    const fornecedorInput = formToClear.querySelector('#prod-fornecedor-codigo');
                    if (fornecedorInput) {
                        fornecedorInput.dispatchEvent(new Event('input'));
                    }
                }
            }
        });
    });

    const btnScrollUp = document.getElementById('btn-scroll-up');
    const btnScrollDown = document.getElementById('btn-scroll-down');

    if (btnScrollUp && btnScrollDown && mainContent) {
        btnScrollUp.addEventListener('click', () => {
            mainContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        btnScrollDown.addEventListener('click', () => {
            const activePanel = document.querySelector('#cadastros .sub-panel.active');
            if (activePanel) {
                const tableHeader = activePanel.querySelector('.table-header');
                if (tableHeader) {
                    tableHeader.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });


        // Substitua o bloco 'mainContent.addEventListener' antigo por este:
        mainContent.addEventListener('scroll', () => {
            const hasScroll = mainContent.scrollHeight > mainContent.clientHeight;
            const isCadastrosActive = document.getElementById('cadastros').classList.contains('active');

            if (hasScroll && isCadastrosActive) {
                // --- LÓGICA DO BOTÃO DE SUBIR (▲) ---
                // Se rolou mais de 200px para baixo, mostra o botão de subir.
                if (mainContent.scrollTop > 200) {
                    btnScrollUp.classList.add('visible');
                } else {
                    btnScrollUp.classList.remove('visible');
                }

                // --- NOVA LÓGICA DO BOTÃO DE DESCER (▼) ---
                // Checa se a rolagem chegou ao fim da página (com uma margem de 5px).
                const isAtBottom = mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 5;
                
                if (isAtBottom) {
                    // Se está no fim, esconde o botão de descer.
                    btnScrollDown.classList.remove('visible');
                } else {
                    // Se não está no fim, mostra o botão de descer.
                    btnScrollDown.classList.add('visible');
                }

            } else {
                // Se não há scroll ou não está na aba de cadastros, esconde ambos.
                btnScrollUp.classList.remove('visible');
                btnScrollDown.classList.remove('visible');
            }
        });
    }

}); 