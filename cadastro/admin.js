document.addEventListener('DOMContentLoaded', () => {
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
        });
    });

    // --- BANCOS DE DADOS E CONTADORES ---
    let dbCategorias = [], dbProdutos = [], dbClientes = [], dbVendedores = [], dbFornecedores = [], dbCupons = [];
    let productCounter = 1, clientCounter = 1, sellerCounter = 1, supplierCounter = 1, categoryCounter = 1;
    let currentlyEditing = { id: null, type: null };

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

    detailsCloseButton.onclick = () => { detailsModal.style.display = "none"; }
    btnCancelDelete.onclick = () => { confirmModal.style.display = "none"; }
    if(confirmCloseButton) { confirmCloseButton.onclick = () => { confirmModal.style.display = "none"; }}
    
    window.onclick = (event) => {
        if (event.target == detailsModal) { detailsModal.style.display = "none"; }
        if (event.target == confirmModal) { confirmModal.style.display = "none"; }
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
                    const nomeFornecedor = fornecedor ? fornecedor.nome : 'Não informado';
                    const categoria = dbCategorias.find(c => String(c.id) === String(item.categoriaId));
                    const nomeCategoria = categoria ? categoria.nome : 'Sem categoria';
                    title = `Detalhes do Produto: ${item.nome}`;
                    detailsHtml = `<p><strong>Código Interno:</strong> ${item.codigo}</p><p><strong>Cód. Barras:</strong> ${item.barcode || 'N/A'}</p><p><strong>Nome:</strong> ${item.nome}</p><p><strong>Condição:</strong> ${item.condicao}</p><p><strong>Categoria:</strong> <span class="detail-highlight">${nomeCategoria}</span></p><p><strong>Plataforma:</strong> ${item.plataforma || 'N/A'}</p><hr><p><strong>Preço de Custo:</strong> R$ ${item.precoCusto}</p><p><strong>Preço de Venda:</strong> R$ ${item.precoVenda}</p><p><strong>Fornecedor:</strong> ${nomeFornecedor} (${item.fornecedorCodigo || 'N/A'})</p><hr><p><strong>Estoque Atual:</strong> ${item.estoque} unidades</p><p><strong>Estoque Mínimo:</strong> ${item.estoqueMinimo} unidades</p><p><strong>Localização:</strong> ${item.localizacao || 'N/A'}</p><hr><p><strong>Data de Lançamento:</strong> ${item.lancamento ? new Date(item.lancamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p><p><strong>Tags:</strong> ${item.tags || 'Nenhuma'}</p>`;
                }
                break;
            case 'categoria':
                item = dbCategorias.find(c => c.id == itemId);
                 if(item) {
                    title = `Detalhes da Categoria: ${item.nome}`;
                    detailsHtml = `<p><strong>ID:</strong> ${item.id}</p><p><strong>Nome:</strong> ${item.nome}</p>`;
                 }
                break;
            case 'cliente':
                item = dbClientes.find(c => c.codigo === itemId);
                if (item) {
                    title = `Detalhes do Cliente: ${item.nome}`;
                    detailsHtml = `<p><strong>Código:</strong> ${item.codigo}</p><p><strong>Nome:</strong> ${item.nome}</p><p><strong>CPF:</strong> ${item.cpf}</p><p><strong>Telefone:</strong> ${item.telefone}</p><p><strong>E-mail:</strong> ${item.email}</p><p><strong>Endereço:</strong> ${item.rua}, Nº ${item.numero} - ${item.bairro}, ${item.cidade}/${item.uf}</p><p><strong>CEP:</strong> ${item.cep}</p>`;
                }
                break;
            case 'vendedor':
                item = dbVendedores.find(v => v.codigo === itemId);
                if (item) {
                    title = `Detalhes do Vendedor: ${item.nome}`;
                     detailsHtml = `<p><strong>Código:</strong> ${item.codigo}</p><p><strong>Nome:</strong> ${item.nome}</p><p><strong>CPF:</strong> ${item.cpf}</p><p><strong>Telefone:</strong> ${item.telefone}</p><p><strong>E-mail:</strong> ${item.email}</p><p><strong>Endereço:</strong> ${item.rua}, Nº ${item.numero} - ${item.bairro}, ${item.cidade}/${item.uf}</p><p><strong>CEP:</strong> ${item.cep}</p>`;
                }
                break;
            case 'fornecedor':
                item = dbFornecedores.find(f => f.codigo === itemId);
                if (item) {
                    title = `Detalhes do Fornecedor: ${item.nome}`;
                    detailsHtml = `<p><strong>Código:</strong> ${item.codigo}</p><p><strong>Empresa:</strong> ${item.nome}</p><p><strong>CNPJ:</strong> ${item.cnpj}</p><p><strong>Contato:</strong> ${item.contato}</p><p><strong>Telefone:</strong> ${item.telefone}</p><p><strong>Endereço:</strong> ${item.rua}, Nº ${item.numero} - ${item.bairro}, ${item.cidade}/${item.uf}</p><p><strong>CEP:</strong> ${item.cep}</p>`;
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

    // --- LÓGICA DE AÇÕES (EVENT DELEGATION) ---
    const contentArea = document.querySelector('.content');
    contentArea.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-view') || target.classList.contains('btn-edit') || target.classList.contains('btn-delete')) {
            const itemId = target.dataset.id;
            const itemType = target.dataset.type;

            if (target.classList.contains('btn-view')) { showDetails(itemId, itemType); }
            if (target.classList.contains('btn-edit')) { editItem(itemId, itemType); }
            if (target.classList.contains('btn-delete')) { openConfirmModal(itemId, itemType); }
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
                    form.elements['prod-nome'].value = item.nome; form.elements['prod-barcode'].value = item.barcode; form.elements['prod-categoria'].value = item.categoriaId; form.elements['prod-condicao'].value = item.condicao; form.elements['prod-preco-custo'].value = item.precoCusto; form.elements['prod-preco'].value = item.precoVenda; form.elements['prod-fornecedor-codigo'].value = item.fornecedorCodigo; form.elements['prod-estoque'].value = item.estoque; form.elements['prod-estoque-minimo'].value = item.estoqueMinimo; form.elements['prod-localizacao'].value = item.localizacao; form.elements['prod-plataforma'].value = item.plataforma; form.elements['prod-lancamento'].value = item.lancamento; form.elements['prod-tags'].value = item.tags;
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
                 if(item) { form.elements['cli-nome'].value = item.nome; form.elements['cli-cpf'].value = item.cpf; form.elements['cli-email'].value = item.email; form.elements['cli-telefone'].value = item.telefone; form.elements['cli-cep'].value = item.cep; form.elements['cli-rua'].value = item.rua; form.elements['cli-numero'].value = item.numero; form.elements['cli-bairro'].value = item.bairro; form.elements['cli-cidade'].value = item.cidade; form.elements['cli-uf'].value = item.uf; button.textContent = 'Atualizar Cliente'; }
                break;
            case 'vendedor':
                 item = dbVendedores.find(v => v.codigo === itemId);
                 form = document.getElementById('form-vendedor');
                 button = document.getElementById('btn-salvar-vendedor');
                 if(item) { form.elements['vend-nome'].value = item.nome; form.elements['vend-cpf'].value = item.cpf; form.elements['vend-telefone'].value = item.telefone; form.elements['vend-email'].value = item.email; form.elements['vend-cep'].value = item.cep; form.elements['vend-rua'].value = item.rua; form.elements['vend-numero'].value = item.numero; form.elements['vend-bairro'].value = item.bairro; form.elements['vend-cidade'].value = item.cidade; form.elements['vend-uf'].value = item.uf; button.textContent = 'Atualizar Vendedor'; }
                break;
             case 'fornecedor':
                 item = dbFornecedores.find(f => f.codigo === itemId);
                 form = document.getElementById('form-fornecedor');
                 button = document.getElementById('btn-salvar-fornecedor');
                 if(item) { form.elements['forn-nome'].value = item.nome; form.elements['forn-cnpj'].value = item.cnpj; form.elements['forn-contato'].value = item.contato; form.elements['forn-telefone'].value = item.telefone; form.elements['forn-cep'].value = item.cep; form.elements['forn-rua'].value = item.rua; form.elements['forn-numero'].value = item.numero; form.elements['forn-bairro'].value = item.bairro; form.elements['forn-cidade'].value = item.cidade; form.elements['forn-uf'].value = item.uf; button.textContent = 'Atualizar Fornecedor'; }
                break;
             case 'cupom':
                item = dbCupons.find(c => c.codigo === itemId);
                form = document.getElementById('form-cupom');
                button = document.getElementById('btn-salvar-cupom');
                if (item) { form.elements['cupom-codigo'].value = item.codigo; form.elements['cupom-tipo'].value = item.tipo; form.elements['cupom-valor'].value = item.valor; form.elements['cupom-usos'].value = item.usos; button.textContent = 'Atualizar Cupom'; }
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
    formCategoria.addEventListener('submit', (e) => { e.preventDefault(); const nome = document.getElementById('cat-nome').value; if(!nome) return; if(currentlyEditing.type === 'categoria'){const item = dbCategorias.find(c => c.id == currentlyEditing.id); if(item) item.nome = nome;} else {const id = categoryCounter++; dbCategorias.push({ id, nome });} renderFunctions.categorias(); populateCategoryDropdown(); resetEditState(formCategoria); });
    renderFunctions.categorias = (data = dbCategorias) => { tabelaCategorias.innerHTML = ""; data.forEach(cat => { tabelaCategorias.innerHTML += `<tr><td>${cat.nome}</td><td class="actions"><button class="btn-view" data-id="${cat.id}" data-type="categoria">Ver</button><button class="btn-edit" data-id="${cat.id}" data-type="categoria">Editar</button><button class="btn-delete" data-id="${cat.id}" data-type="categoria">Excluir</button></td></tr>`; }); }
    function populateCategoryDropdown() { selectCategoriaProduto.innerHTML = '<option value="">Selecione...</option>'; dbCategorias.forEach(cat => { selectCategoriaProduto.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`; }); }

    // PRODUTOS
    const formProduto = document.getElementById('form-produto');
    const tabelaProdutos = document.getElementById('tabela-produtos');
    const prodFornecedorCodigoInput = document.getElementById('prod-fornecedor-codigo');
    const prodFornecedorNomeSpan = document.getElementById('prod-fornecedor-nome');
    prodFornecedorCodigoInput.addEventListener('input', () => { const codigo = prodFornecedorCodigoInput.value.toUpperCase(); if (!codigo) { prodFornecedorNomeSpan.textContent = ''; return; } const fornecedor = dbFornecedores.find(f => f.codigo === codigo); if (fornecedor) { prodFornecedorNomeSpan.textContent = fornecedor.nome; prodFornecedorNomeSpan.classList.remove('error'); } else { prodFornecedorNomeSpan.textContent = 'Código não encontrado'; prodFornecedorNomeSpan.classList.add('error'); } });
    formProduto.addEventListener('submit', (e) => { e.preventDefault(); const prodData = { nome: document.getElementById('prod-nome').value, barcode: document.getElementById('prod-barcode').value, categoriaId: document.getElementById('prod-categoria').value, condicao: document.getElementById('prod-condicao').value, precoCusto: document.getElementById('prod-preco-custo').value, precoVenda: document.getElementById('prod-preco').value, fornecedorCodigo: prodFornecedorCodigoInput.value.toUpperCase(), estoque: document.getElementById('prod-estoque').value, estoqueMinimo: document.getElementById('prod-estoque-minimo').value, localizacao: document.getElementById('prod-localizacao').value, plataforma: document.getElementById('prod-plataforma').value, lancamento: document.getElementById('prod-lancamento').value, tags: document.getElementById('prod-tags').value, }; if (currentlyEditing.type === 'produto') { const item = dbProdutos.find(p => p.codigo === currentlyEditing.id); if (item) Object.assign(item, prodData); } else { const cod = 'P' + String(productCounter++).padStart(3, '0'); dbProdutos.push({ codigo: cod, ...prodData }); } renderFunctions.produtos(); resetEditState(formProduto); prodFornecedorNomeSpan.textContent = ''; });
    renderFunctions.produtos = (data = dbProdutos) => { tabelaProdutos.innerHTML = ""; data.forEach(prod => { const fornecedor = dbFornecedores.find(f => f.codigo === prod.fornecedorCodigo); const nomeFornecedor = fornecedor ? fornecedor.nome : 'N/D'; tabelaProdutos.innerHTML += `<tr><td class="code-column">${prod.codigo}</td><td>${prod.nome}</td><td>${nomeFornecedor}</td><td>R$ ${prod.precoVenda}</td><td>${prod.estoque}</td><td class="actions"><button class="btn-view" data-id="${prod.codigo}" data-type="produto">Ver</button><button class="btn-edit" data-id="${prod.codigo}" data-type="produto">Editar</button><button class="btn-delete" data-id="${prod.codigo}" data-type="produto">Excluir</button></td></tr>`; }); }

    // CLIENTES
    const formCliente = document.getElementById('form-cliente');
    const tabelaClientes = document.getElementById('tabela-clientes');
    formCliente.addEventListener('submit', (e) => { e.preventDefault(); const cliData = { nome: document.getElementById('cli-nome').value, cpf: document.getElementById('cli-cpf').value, telefone: document.getElementById('cli-telefone').value, email: document.getElementById('cli-email').value, cep: document.getElementById('cli-cep').value, rua: document.getElementById('cli-rua').value, numero: document.getElementById('cli-numero').value, bairro: document.getElementById('cli-bairro').value, cidade: document.getElementById('cli-cidade').value, uf: document.getElementById('cli-uf').value }; if(currentlyEditing.type === 'cliente'){ const item = dbClientes.find(c => c.codigo === currentlyEditing.id); if(item) Object.assign(item, cliData); } else { const cod = 'C' + String(clientCounter++).padStart(3, '0'); dbClientes.push({ codigo: cod, ...cliData }); } renderFunctions.clientes(); resetEditState(formCliente); });
    renderFunctions.clientes = (data = dbClientes) => { tabelaClientes.innerHTML = ""; data.forEach(cliente => { tabelaClientes.innerHTML += `<tr><td class="code-column">${cliente.codigo}</td><td>${cliente.nome}</td><td>${cliente.cpf}</td><td>${cliente.telefone}</td><td class="actions"><button class="btn-view" data-id="${cliente.codigo}" data-type="cliente">Ver</button><button class="btn-edit" data-id="${cliente.codigo}" data-type="cliente">Editar</button><button class="btn-delete" data-id="${cliente.codigo}" data-type="cliente">Excluir</button></td></tr>`; }); }

    // VENDEDORES
    const formVendedor = document.getElementById('form-vendedor');
    const tabelaVendedores = document.getElementById('tabela-vendedores');
    formVendedor.addEventListener('submit', (e) => { e.preventDefault(); const vendData = { nome: document.getElementById('vend-nome').value, cpf: document.getElementById('vend-cpf').value, telefone: document.getElementById('vend-telefone').value, email: document.getElementById('vend-email').value, cep: document.getElementById('vend-cep').value, rua: document.getElementById('vend-rua').value, numero: document.getElementById('vend-numero').value, bairro: document.getElementById('vend-bairro').value, cidade: document.getElementById('vend-cidade').value, uf: document.getElementById('vend-uf').value }; if(currentlyEditing.type === 'vendedor'){ const item = dbVendedores.find(v => v.codigo === currentlyEditing.id); if(item) Object.assign(item, vendData); } else { const cod = 'V' + String(sellerCounter++).padStart(3, '0'); dbVendedores.push({ codigo: cod, ...vendData }); } renderFunctions.vendedores(); resetEditState(formVendedor); });
    renderFunctions.vendedores = (data = dbVendedores) => { tabelaVendedores.innerHTML = ""; data.forEach(vend => { tabelaVendedores.innerHTML += `<tr><td class="code-column">${vend.codigo}</td><td>${vend.nome}</td><td>${vend.cpf}</td><td>${vend.telefone}</td><td class="actions"><button class="btn-view" data-id="${vend.codigo}" data-type="vendedor">Ver</button><button class="btn-edit" data-id="${vend.codigo}" data-type="vendedor">Editar</button><button class="btn-delete" data-id="${vend.codigo}" data-type="vendedor">Excluir</button></td></tr>`; }); }

    // FORNECEDORES
    const formFornecedor = document.getElementById('form-fornecedor');
    const tabelaFornecedores = document.getElementById('tabela-fornecedores');
    formFornecedor.addEventListener('submit', (e) => { e.preventDefault(); const fornData = { nome: document.getElementById('forn-nome').value, cnpj: document.getElementById('forn-cnpj').value, contato: document.getElementById('forn-contato').value, telefone: document.getElementById('forn-telefone').value, cep: document.getElementById('forn-cep').value, rua: document.getElementById('forn-rua').value, numero: document.getElementById('forn-numero').value, bairro: document.getElementById('forn-bairro').value, cidade: document.getElementById('forn-cidade').value, uf: document.getElementById('forn-uf').value }; if(currentlyEditing.type === 'fornecedor'){ const item = dbFornecedores.find(f => f.codigo === currentlyEditing.id); if(item) Object.assign(item, fornData); } else { const cod = 'F' + String(supplierCounter++).padStart(3, '0'); dbFornecedores.push({ codigo: cod, ...fornData }); } renderFunctions.fornecedores(); resetEditState(formFornecedor); });
    renderFunctions.fornecedores = (data = dbFornecedores) => { tabelaFornecedores.innerHTML = ""; data.forEach(forn => { tabelaFornecedores.innerHTML += `<tr><td class="code-column">${forn.codigo}</td><td>${forn.nome}</td><td>${forn.cnpj}</td><td>${forn.telefone}</td><td class="actions"><button class="btn-view" data-id="${forn.codigo}" data-type="fornecedor">Ver</button><button class="btn-edit" data-id="${forn.codigo}" data-type="fornecedor">Editar</button><button class="btn-delete" data-id="${forn.codigo}" data-type="fornecedor">Excluir</button></td></tr>`; }); }
    
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
    
    // INICIALIZAÇÃO GERAL
    populateCategoryDropdown();
});