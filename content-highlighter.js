// Content script: highlight multi-quantity items on Shopee and Mercado Livre

(function () {
  const SHOPEE_SELECTOR = 'div.item-amount';
  const MERCADO_LIVRE_SELECTOR = 'span.unit';

  function parseQuantityFromShopeeText(text) {
    // Expected formats: "x1", "x2", "x3"...
    const match = text.trim().match(/x(\d+)/i);
    return match ? parseInt(match[1], 10) : NaN;
  }

  function parseQuantityFromMercadoLivreText(text) {
    // Expected formats (Portuguese): "1 unidade", "2 unidades" etc.
    const match = text.trim().match(/(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
  }

  function applyHighlight(element) {
  if (!element) return;

  if (element.dataset.operaEcommerceHighlighted === 'true') return;
  element.dataset.operaEcommerceHighlighted = 'true';

 
  element.style.backgroundColor = '#f0eacbff';       // amarelo claro
  element.style.border = '1px solid #d4af69ff';      // borda dourada
  element.style.borderRadius = '6px';
  element.style.padding = '4px 8px';
  element.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.03)'; // contorno leve
}

  function insertShopeeWarningBanner() {
    // Se já existir, garante que está visível
    const existing = document.getElementById('alerta-2x-banner');
    if (existing) {
      existing.style.display = 'block';
      return;
    }

    // Div fixa no topo da lista de pedidos: "div.shopee-fixed-top-card"
    const topCard = document.querySelector('div.shopee-fixed-top-card');
    if (!topCard) return;

    const warning = document.createElement('div');
    warning.id = 'alerta-2x-banner';
    warning.textContent =
      'ATENÇÃO: Existem produtos com quantidade maior que 1 neste pedido. Verifique antes de separar.';
    warning.style.backgroundColor = '#fff3cd';
    warning.style.color = '#856404';
    warning.style.fontWeight = '600';
    warning.style.padding = '6px 10px';
    warning.style.margin = '6px 0';
    warning.style.borderRadius = '4px';
    warning.style.border = '1px solid #ffeeba';

    // Insere logo depois do card da Shopee (abaixo dele e acima da lista de pedidos)
    topCard.insertAdjacentElement('afterend', warning);
  }

  function hideShopeeWarningBanner() {
    const existing = document.getElementById('alerta-2x-banner');
    if (existing) {
      existing.style.display = 'none';
    }
  }

  function highlightShopee() {
    const nodes = document.querySelectorAll(SHOPEE_SELECTOR);
    let hasMultiQuantity = false;

    nodes.forEach((node) => {
      const quantity = parseQuantityFromShopeeText(node.textContent || '');
      if (!Number.isNaN(quantity) && quantity > 1) {
        hasMultiQuantity = true;
        applyHighlight(node);
      }
    });

    if (hasMultiQuantity) {
      insertShopeeWarningBanner();
    } else {
      hideShopeeWarningBanner();
    }
  }

  function insertMercadoLivreWarningBanner() {
    // Se já existir, só garante que está visível
    const existing = document.getElementById('alerta-2x-banner');
    if (existing) {
      existing.style.display = 'block';
      return;
    }

    // Section :"section.undefined.banner-auth__section"
    const bannerSection =
      document.querySelector('section.banner-auth__section') ||
      document.querySelector('section.undefined.banner-auth__section');

    if (!bannerSection) return;

    const warning = document.createElement('div');
    warning.id = 'alerta-2x-banner';
    warning.textContent =
      'ATENÇÃO: Existem produtos com quantidade maior que 1 neste pedido. Verifique antes de separar.';
    warning.style.backgroundColor = '#fff3cd';   // amarelo bem claro
    warning.style.color = '#856404';            // marrom escuro
    warning.style.fontWeight = '600';           // semi-bold
    warning.style.padding = '6px 10px';         
    warning.style.margin = '6px 0';             
    warning.style.borderRadius = '4px';
    warning.style.border = '1px solid #ffeeba'; // borda suave

    // Insere logo depois da section do banner (fica entre o banner e o conteúdo)
    bannerSection.insertAdjacentElement('afterend', warning);
  }

  function hideMercadoLivreWarningBanner() {
    const existing = document.getElementById('alerta-2x-banner');
    if (existing) {
      existing.style.display = 'none';
    }
  }

  function highlightMercadoLivre() {
    const nodes = document.querySelectorAll(MERCADO_LIVRE_SELECTOR);
    let hasMultiQuantity = false;

    nodes.forEach((node) => {
      const quantity = parseQuantityFromMercadoLivreText(node.textContent || '');
      if (!Number.isNaN(quantity) && quantity > 1) {
        hasMultiQuantity = true;

        
        applyHighlight(node);

        
        const container = node.closest(
          '.sc-product-row__container, .sc-product-row, .andes-card__content, .row-card-container, .product-container, tr'
        );
        if (container) {
          applyHighlight(container);
        }
      }
    });

    if (hasMultiQuantity) {
      insertMercadoLivreWarningBanner();
    } else {
      hideMercadoLivreWarningBanner();
    }
  }

  function runHighlight() {
    const host = window.location.hostname;
    if (host.includes('shopee')) {
      highlightShopee();
    } else if (host.includes('mercadolivre')) {
      highlightMercadoLivre();
    }
  }


  runHighlight();


  const observer = new MutationObserver(() => {
    runHighlight();
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
  });
})();
