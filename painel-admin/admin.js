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

    // --- ELEMENTOS PRINCIPAIS DO DOM (DECLARADOS UMA SÓ VEZ AQUI) ---
    const mainContent = document.querySelector('.content'); // Declarado aqui em cima!
    const mainNavLinks = document.querySelectorAll('.sidebar .nav-link');
    const mainContentPanels = document.querySelectorAll('.content > .content-panel');
    const subNavLinks = document.querySelectorAll('.sub-nav-link');
    const subContentPanels = document.querySelectorAll('.sub-panel');

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

            if (targetId === 'cadastros') {
                const firstSubNavLink = document.querySelector('.sub-nav-link');
                const activeSubNavLink = document.querySelector('.sub-nav-link.active');
                if (firstSubNavLink && !activeSubNavLink) {
                    firstSubNavLink.click();
                }
            }
            if (targetId === 'relatorios') renderReports();
            if (targetId === 'historico') renderFunctions.historico();
        });
    });

    subNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
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
        sales: 'amanditaGames_sales'
    };

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

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

    document.querySelectorAll('.form-container').forEach(form => {
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
            }
        });
    });

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

    // --- FUNÇÕES CRUD (Criar, Ler, Atualizar, Deletar) ---
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

        if (item) {
            modalTitle.textContent = title;
            modalBody.innerHTML = detailsHtml;
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

    mainContent.addEventListener('click', (e) => {
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
            tabelaHistorico.innerHTML += `<tr><td class="code-column">${venda.recibo}</td><td>${new Date(venda.date).toLocaleString('pt-BR')}</td><td>${toTitleCase(venda.cliente.nome)}</td><td>${toTitleCase(venda.vendedor.nome)}</td><td>${totalItens}</td><td>${formatCurrency(venda.total)}</td><td class="actions"><button class="btn-view btn-reprint" data-id="${venda.recibo}" data-type="venda">Detalhes</button></td></tr>`;
        });
    }

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

    function formatCurrency(value) {
        return typeof value === 'number' ? value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }) : String(value);
    }

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
    // LÓGICA PARA OS NOVOS BOTÕES DE FLUIDEZ
    // ==========================================================
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

}); // <-- FIM DO 'DOMContentLoaded'