# Tech Note — E-commerce e trade-in de eletrônicos seminovos

Loja fictícia de eletrônicos seminovos inspirada em marketplaces de trade-in. O
projeto inclui home, catálogo com filtros, página de produto, carrinho, checkout
simulado com Pix e cartão, além de um fluxo completo para vender o aparelho usado.

Tudo roda no navegador: pedidos, protocolos, favoritos, carrinho e login ficam no
`localStorage`, e as APIs são rotas mock do próprio Next.js. Nenhum pagamento real
é processado.

---

## ✨ Recursos

- **Home** com hero, faixas de categorias, ofertas, produtos abaixo de R$ 1.500,
  banners de trade-in, depoimentos e marcas.
- **Header completo**: logo, busca, seletor de CEP, favoritos, carrinho e conta.
  Menu de categorias com mega menu, busca com sugestões e menu mobile.
- **Catálogo** com filtros por categoria, marca, modelo, armazenamento, condição,
  ofertas, faixa de preço e ordenação, sincronizados com a URL.
- **Produto** com galeria, seletor de condição (Excelente / Muito bom / Bom),
  cálculo de frete por CEP, cupons, parcelamento, avaliações e relacionados.
- **Carrinho** com quantidade, cupom, frete, progresso de frete grátis e sugestões.
- **Checkout em 3 etapas** (dados e endereço, entrega, pagamento) com Pix
  (código copia e cola + QR simulado) e cartão de crédito em até 21x.
- **Trade-in em 4 etapas**: aparelho → condição → oferta → envio, com cálculo
  instantâneo, pagamento via Pix, crédito na loja com 10% extra ou troca assistida.
- **Minha conta** com pedidos, trocas, favoritos, login simulado e central de ajuda.
- **Área admin** (`/admin`) para cadastrar produtos direto pelo site, com descrição,
  upload de fotos e captura pela câmera do dispositivo (celulares e notebooks).
- **Design responsivo** (375, 768 e 1440 px), acessível por teclado, com toasts,
  focus ring e respeito a `prefers-reduced-motion`.

---

## 🧱 Stack

| Camada        | Tecnologia                              |
| ------------- | --------------------------------------- |
| Framework     | Next.js 16.4 (App Router, React 19)     |
| Linguagem     | TypeScript (strict)                     |
| Estilos       | Tailwind CSS 4                          |
| Estado        | Zustand 5 + `persist`                   |
| Ícones        | Lucide React                            |
| Fontes        | Plus Jakarta Sans + Sora via `next/font` |
| Dados         | JSON local + rotas mock em `/src/app/api` |

---

## 🚀 Como rodar

Requisito: **Node.js 20.9 ou superior**.

```bash
npm install
npm run dev
```

A aplicação abre em `http://localhost:3000`.

```bash
npm run typecheck   # checagem de tipos
npm run build       # build de produção
npm run start       # serve o build
```

> No Windows deste projeto, use `npm.cmd` caso o PowerShell bloqueie `npm.ps1`.

---

## 🗺️ Rotas

| Rota                     | Descrição                                          |
| ------------------------ | -------------------------------------------------- |
| `/`                      | Home                                               |
| `/catalogo`              | Catálogo com filtros via query string              |
| `/produto/[slug]`        | Detalhe do produto                                 |
| `/carrinho`              | Carrinho                                           |
| `/checkout`              | Checkout simulado                                  |
| `/vender`                | Avaliação e venda do aparelho usado                |
| `/conta`                 | Minha conta (`?aba=pedidos`, `trocas`, `favoritos`, `ajuda`) |
| `/ofertas`               | Redireciona para o catálogo em modo ofertas        |
| `/admin`                 | Painel admin (senha demo: `admin123`)              |
| `/api/cep`               | Consulta de CEP e cálculo de frete (mock)          |
| `/api/checkout`          | Criação de pedido simulado                         |
| `/api/tradein/quote`     | Cotação de trade-in                                |

Exemplos de filtros do catálogo:

```
/catalogo?categoria=Celulares&marca=Apple&condicao=excelente
/catalogo?ofertas=1&ordenar=menor-preco
/catalogo?busca=iphone&armazenamento=128GB
```

---

## 🎟️ Cupons de demonstração

| Cupom         | Regra                                                  |
| ------------- | ------------------------------------------------------ |
| `TECH10`      | 10% OFF na primeira compra                             |
| `NOTE10`      | 10% OFF em notebooks                                   |
| `BEMVINDO15`  | 15% OFF acima de R$ 2.000                              |
| `FRETEGRATIS` | Frete grátis                                           |

Pagamentos no Pix têm **5% de desconto** automático. Cartão em até **10x sem
juros**; de 11x a 21x com juros de 1,99% ao mês. Frete PAC grátis acima de
R$ 499.

---

## 🔐 Área admin (`/admin`)

Cadastre produtos com fotos direto pelo site (link discreto "Área admin" no
rodapé; senha de demonstração: `admin123`):

- **Upload de fotos** do dispositivo (até 6 por produto) e **foto pela câmera**
  com troca de câmera frontal/traseira — ideal para fotografar celulares e
  notebooks na hora.
- Fotos são comprimidas automaticamente (limite de 1280px, JPEG) e a primeira
  vira a **capa** do card.
- Formulário com nome, marca, modelo, categoria, armazenamento, cor, tela, ano,
  **preço por condição** (Bom como base preenche "Muito bom" ×1,08 e
  "Excelente" ×1,16), descrição, destaques, especificações, selo, cupom e nota.
- Produtos publicados entram no catálogo, na busca, na página de detalhe, no
  carrinho e no checkout deste navegador; podem ser **editados ou excluídos**
  pelo próprio painel (excluir também limpa as fotos do IndexedDB).

---

## 🗂️ Estrutura

```
src/
├─ app/
│  ├─ admin/                # painel de cadastro de produtos
│  ├─ api/                 # rotas mock (cep, checkout, tradein)
│  ├─ carrinho/            # página do carrinho
│  ├─ catalogo/            # catálogo
│  ├─ checkout/            # checkout
│  ├─ conta/               # minha conta
│  ├─ produto/[slug]/      # detalhe do produto (estático + cadastrado)
│  ├─ vender/              # wizard de trade-in
│  ├─ globals.css          # tema, cores e animações
│  ├─ layout.tsx           # header, footer, fontes, metadata
│  └─ page.tsx             # home
├─ components/
│  ├─ account/             # painel da conta
│  ├─ admin/               # login, formulário e seletor de fotos do painel
│  ├─ cart/                # carrinho
│  ├─ checkout/            # fluxo de checkout
│  ├─ home/                # seções da home
│  ├─ layout/              # header, footer, busca, CEP, menu mobile
│  ├─ product/             # card, grid, catálogo, detalhe e <ProductImage>
│  ├─ providers/           # hidratação das stores
│  ├─ tradein/             # wizard de venda
│  └─ ui/                  # componentes base
├─ data/
│  ├─ products.json        # 15 produtos com preços por condição
│  └─ tradein.json         # modelos e valores base de trade-in
├─ lib/                    # formatadores, regras de negócio, IndexedDB e tipos
└─ store/                  # Zustand: cart, favorites, preferences, user, toast,
                           # custom-products (produtos cadastrados pelo admin)
```

---

## 🎨 Identidade visual

- **Dourado** `brand-600 #976D0E` para ações principais, com champagne `brand-50 #FFFBF0` em realces.
- **Branco e off-white quente** `ink-50` como base das superfícies.
- **Quase preto quente** `ink-950 #0F0D0A` para tipografia e superfícies escuras.
- **Champagne** `lime-400 #E9C766` para destaques e badges em fundos escuros.
- **Verde sálvia** para economia no Pix.
- **Cobre** `sale-500 #B4551F` para selos de oferta.
- Tipografia: **Sora** para títulos e **Plus Jakarta Sans** para textos.

Os tokens ficam em `src/app/globals.css` (bloco `@theme`).

---

## 🧪 O que é simulado

- Consulta de CEP, frete e prazos.
- Pagamento Pix (QR e copia e cola) e cartão de crédito.
- Criação de pedido e geração de protocolo de trade-in.
- Login da conta (qualquer nome e e-mail válidos).
- Persistência local via `localStorage` (`technote:orders`, `technote:tradeins`,
  `technote:cart`, `technote:favorites`, `technote:preferences`, `technote:user`,
  `technote:custom-products`).
- Produtos cadastrados no painel admin ficam apenas neste navegador: dados do
  produto em `localStorage` e as fotos (comprimidas em JPEG leve) no
  **IndexedDB** (`technote-media`), resolvidas como blob URL na exibição.
- Login do painel admin: senha de demonstração `admin123` (sessão,
  `sessionStorage`).

Para começar do zero, limpe os dados do site no navegador.

---

## 📄 Licença

Projeto de demonstração. Marcas e produtos citados pertencem aos seus respectivos
proprietários. © 2026 Tech Note.
