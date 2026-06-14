# AcadFlow Mobile

Aplicativo mobile do **AcadFlow** — sistema de gestão acadêmica para submissão e acompanhamento de certificados de atividades complementares.

Desenvolvido com **React Native + Expo** como parte do Projeto Integrador do curso de Desenvolvimento Mobile no SENAC.

---

## Sobre o projeto

O AcadFlow Mobile permite que alunos enviem certificados de atividades complementares diretamente pelo celular. O app realiza leitura automática dos dados do certificado via OCR, envia o arquivo para o backend e exibe o histórico de submissões com o respectivo status de aprovação do coordenador.

---

## Funcionalidades

- Autenticação com e-mail e senha via JWT
- Dashboard com progresso de horas complementares (gráfico donut animado + barra de progresso)
- Resumo de submissões por status (Pendente / Aprovado / Rejeitado)
- Listagem das últimas submissões na tela inicial
- Seletor de curso ativo (para alunos matriculados em múltiplos cursos)
- Submissão de certificados com foto da câmera ou da galeria
- Leitura automática dos dados do certificado via OCR (Tesseract)
- Preenchimento automático dos campos após o OCR
- Tela de histórico completo com filtros por status e categoria
- Modal de detalhes da submissão com preview do certificado e observação do coordenador
- Logout com confirmação via alerta

---

## Tecnologias e dependências

| Pacote | Versão | Uso |
|---|---|---|
| `expo` | ~54.0.35 | Plataforma base |
| `react` | 19.1.0 | UI |
| `react-native` | 0.81.5 | Framework mobile |
| `@react-navigation/native` | ^7.2.4 | Navegação |
| `@react-navigation/native-stack` | ^7.15.1 | Stack navigator |
| `@react-navigation/bottom-tabs` | ^7.16.1 | Tab navigator |
| `axios` | ^1.16.1 | Requisições HTTP ao backend |
| `expo-image-picker` | ~17.0.11 | Câmera e galeria |
| `expo-status-bar` | ~3.0.9 | Barra de status |
| `react-native-safe-area-context` | ~5.6.0 | Safe area |
| `react-native-screens` | ~4.16.0 | Otimização de navegação |
| `react-native-svg` | 15.12.1 | Gráfico donut (SVG) |

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go instalado no celular **ou** emulador Android/iOS configurado

---

## Instalação e execução

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Mobile-Projeto-Integrador.git
cd Mobile-Projeto-Integrador

# Instale as dependências
npm install

# Inicie o projeto
npm start
```

Após iniciar, escaneie o QR code com o Expo Go (Android) ou com a câmera (iOS).

Para rodar diretamente em emulador:

```bash
npm run android   # Android
npm run ios       # iOS
npm run web       # Web (experimental)
```

---

## Estrutura de pastas

```
Mobile-Projeto-Integrador/
├── App.js                        # Raiz do app — controla AuthNavigator / AppNavigator
├── index.js                      # Entry point (registerRootComponent)
├── app.json                      # Configurações do Expo
├── package.json
├── assets/                       # Ícones e splash screen
└── src/
    ├── components/
    │   ├── CertificadoModal.js   # Modal de detalhes da submissão
    │   ├── CursoSelector.js      # Seletor de curso ativo (pill ou dropdown)
    │   ├── SubmissaoCard.js      # Card de item na lista de submissões
    │   ├── InputField.js         # (placeholder)
    │   └── StatusBadge.js        # (placeholder)
    ├── hooks/
    │   ├── useCamera.js          # (placeholder)
    │   └── useSubmissoes.js      # (placeholder)
    ├── navigation/
    │   ├── AppNavigator.js       # Stack + Tab navigator (telas autenticadas)
    │   └── AuthNavigator.js      # Stack navigator (login)
    ├── screens/
    │   ├── LoginScreen.js        # Tela de login
    │   ├── HomeScreen.js         # Dashboard do aluno
    │   ├── NovaSubmissaoScreen.js # Formulário de envio de certificado
    │   └── MinhasSubmissoesScreen.js # Histórico com filtros
    ├── services/
    │   ├── api.js                # Instância axios + interceptor JWT
    │   ├── authService.js        # Login / logout
    │   ├── activityService.js    # Cursos, alunos, categorias, submissões
    │   ├── ocrService.js         # Leitura de certificado via OCR
    │   └── submissaoService.js   # (placeholder)
    ├── store/
    │   ├── authStore.js          # Estado de sessão em memória (token, role, user, cursoAtivo)
    │   └── submissaoStore.js     # (placeholder)
    ├── theme/
    │   └── colors.js             # Paleta de cores e sombras
    └── utils/
        ├── formatters.js         # (placeholder)
        └── validators.js         # (placeholder)
```

---

## Telas e navegação

### Fluxo de navegação

```
App.js
├── AuthNavigator  (logado = false)
│   └── LoginScreen
└── AppNavigator   (logado = true)
    └── MainStack
        ├── Tabs (TabNavigator)
        │   ├── Home           → HomeScreen
        │   ├── NovaSubmissaoTab → NovaSubmissaoScreen
        │   └── MinhasSubmissoes → MinhasSubmissoesScreen
        └── NovaSubmissao (Stack) → NovaSubmissaoScreen
```

O `App.js` controla o estado `logado` via `useState`. Ao fazer login com sucesso, o `AuthNavigator` é substituído pelo `AppNavigator`. O logout limpa a sessão no `authStore` e reverte para o `AuthNavigator`.

---

### LoginScreen

Tela de autenticação do aluno.

**Funcionalidades:**
- Campos de e-mail e senha
- Validação de campos vazios
- Indicador de loading durante requisição
- Exibição de mensagem de erro
- Banner informativo sobre cold-start do servidor Render
- Card com credenciais de demonstração (toque preenche os campos automaticamente)

---

### HomeScreen

Dashboard principal do aluno.

**Funcionalidades:**
- Saudação dinâmica (Bom dia / Boa tarde / Boa noite) com primeiro nome
- Avatar com inicial do nome — toque abre alerta de logout
- `CursoSelector` para troca de curso ativo
- **Gráfico donut animado** com horas realizadas vs. meta do curso (usando `react-native-svg`)
- Métricas: percentual concluído, meta total, quantidade de aprovados
- **Barra de progresso animada** (via `Animated.Value`)
- Chips de resumo por status: Pendente, Aprovado, Rejeitado
- Listagem das últimas 3 submissões com link "Ver todos"
- Estado vazio com botão de ação para envio do primeiro certificado
- `CertificadoModal` integrado para detalhes ao tocar em um card

**Dados carregados:**
- Cursos do aluno: `GET /alunos/{id}/cursos`
- Dados do aluno: `GET /alunos/{id}`
- Submissões do curso ativo: `GET /submissoes/aluno/{id}?cursoId={cursoId}`

---

### NovaSubmissaoScreen

Formulário de submissão de novo certificado.

**Funcionalidades:**
- Upload de imagem via **câmera** ou **galeria** (`expo-image-picker`)
- Preview da imagem selecionada com opção de remoção
- OCR automático ao selecionar a imagem (chama `ocrService`)
- Indicador de loading durante leitura OCR
- Preenchimento automático dos campos: nome do aluno, nome do evento, carga horária, data de conclusão
- Select customizado para curso (busca do backend)
- Select customizado para categoria (filtrado pelo curso selecionado)
- Máscara automática no campo de data (DD/MM/AAAA)
- Validação completa de todos os campos com mensagens de erro inline
- Tela de sucesso após envio com opção de nova submissão
- `KeyboardAvoidingView` para comportamento correto com teclado

**Dados carregados:**
- Cursos: `GET /alunos/{id}/cursos`
- Categorias: `GET /categorias?cursoId={cursoId}`

**Envio:**
- `POST /submissoes` — `multipart/form-data` com a submissão em JSON + arquivo de imagem

---

### MinhasSubmissoesScreen

Histórico completo de submissões do aluno.

**Funcionalidades:**
- `CursoSelector` para troca de curso ativo
- Listagem com `FlatList` e pull-to-refresh
- **Filtros por status** (Todos / Pendente / Aprovado / Rejeitado) e **por categoria**
- Bottom sheet de filtros com indicador de filtros ativos (badge numérico)
- Contagem de resultados filtrados
- Tags ativas exibidas na toolbar
- FAB (botão flutuante) para nova submissão
- `CertificadoModal` ao tocar em qualquer card

**Dados carregados:**
- Cursos: `GET /alunos/{id}/cursos`
- Submissões: `GET /submissoes/aluno/{id}?cursoId={cursoId}`

---

## Componentes

### CertificadoModal

Modal deslizante de baixo (bottom sheet) com os detalhes completos de uma submissão.

**Props:**

| Prop | Tipo | Descrição |
|---|---|---|
| `certificado` | `object \| null` | Objeto da submissão. `null` fecha o modal. |
| `onClose` | `() => void` | Callback de fechamento |

**Conteúdo exibido:**
- Nome do certificado e badge de status
- Preview da imagem (toque abre URL original via `Linking`)
- Seção "Identificação": aluno, curso, categoria
- Seção "Dados do Certificado" (OCR): nome no certificado, evento/curso, carga horária, data de conclusão
- Seção "Análise": data de envio, horas aproveitadas, observação do coordenador

---

### CursoSelector

Seletor de curso ativo com comportamento adaptativo.

**Props:**

| Prop | Tipo | Descrição |
|---|---|---|
| `cursos` | `Array<{id, nome}>` | Lista de cursos do aluno |
| `cursoAtivo` | `{id, nome} \| null` | Curso selecionado |
| `onChange` | `(curso) => void` | Callback ao trocar de curso |
| `loading` | `boolean` | Exibe spinner enquanto carrega |

**Comportamento:**
- 0 cursos: renderiza nada
- 1 curso: pill informativa (sem interação)
- 2+ cursos: dropdown com lista de opções e checkmark no ativo

---

### SubmissaoCard

Card de item na lista de submissões.

**Props:**

| Prop | Tipo | Descrição |
|---|---|---|
| `titulo` | `string` | Nome do certificado (OCR) ou categoria |
| `horas` | `number` | Horas aproveitadas |
| `categoria` | `string` | Nome da categoria |
| `status` | `string` | `PENDENTE`, `APROVADO` ou `REJEITADO` |
| `data` | `string` | Data ISO de envio |
| `observacao` | `string` | Observação do coordenador |
| `curso` | `string` | Nome do curso |

---

## Serviços

### `api.js`

Instância Axios configurada com:
- `baseURL`: `https://back-end-projeto-integrador.onrender.com`
- Interceptor de request que injeta o token JWT no header `Authorization: Bearer <token>`

---

### `authService.js`

| Método | Descrição |
|---|---|
| `login(email, password)` | Chama `POST /auth/login`, decodifica o payload JWT, salva sessão no `authStore` |
| `logout()` | Limpa a sessão do `authStore` |

**Resposta esperada do backend:**
```json
{ "token": "eyJ...", "role": "ROLE_ALUNO" }
```

O payload JWT deve conter `userId` e `sub` (e-mail).

---

### `activityService.js`

| Método | Endpoint | Descrição |
|---|---|---|
| `getCategorias()` | `GET /categorias` | Todas as categorias |
| `getCategoriasByCurso(cursoId)` | `GET /categorias?cursoId=` | Categorias de um curso |
| `getAluno(alunoId)` | `GET /alunos/{id}` | Dados do aluno |
| `getCursosByAluno(alunoId)` | `GET /alunos/{id}/cursos` | Cursos do aluno |
| `getSubmissoesByAluno(alunoId, cursoId?)` | `GET /submissoes/aluno/{id}` | Submissões (filtro opcional por curso) |
| `inserirSubmissao({...})` | `POST /submissoes` | Envia certificado com dados OCR |

**Payload de `inserirSubmissao`:**
```js
{
  alunoId, categoriaId, cursoId,
  fileUri, fileName, fileType,
  dadosOcr: { nomeAlunoOcr, nomeCursoOcr, cargaHorariaOcr, dataConclusaoOcr }
}
```

---

### `ocrService.js`

Integração com o microserviço de OCR (Tesseract, hospedado no Render).

| Método | Endpoint | Descrição |
|---|---|---|
| `lerCertificado({ uri, name, type })` | `POST /ler-certificado` | Envia imagem e retorna dados extraídos |

**Retorno:**
```json
{
  "nomeAlunoOcr": "...",
  "nomeCursoOcr": "...",
  "cargaHorariaOcr": 40,
  "dataConclusaoOcr": "..."
}
```

Inclui retry automático: até 3 tentativas com 5 segundos de espera entre elas em caso de erro `503` (servidor acordando no Render).

---

## Store e estado

### `authStore.js`

Gerencia o estado de sessão em **memória** (sem persistência — a sessão é perdida ao fechar o app).

| Método | Descrição |
|---|---|
| `setSession({ token, role, user })` | Persiste token, role e dados do usuário |
| `getToken()` | Retorna o token JWT atual |
| `getRole()` | Retorna a role (`ROLE_ALUNO`, etc.) |
| `getUser()` | Retorna `{ id, email }` |
| `isAuthenticated()` | Retorna `true` se há token |
| `getCursoAtivo()` | Retorna `{ id, nome }` do curso ativo |
| `setCursoAtivo(curso)` | Define o curso ativo |
| `inicializarCursoAtivo(cursos)` | Define o primeiro curso da lista como ativo (só se não houver nenhum definido) |
| `clearSession()` | Limpa todos os dados (logout) |

> Para adicionar persistência entre sessões, substitua as variáveis em memória por chamadas ao `AsyncStorage`.

---

## Tema e cores

Definido em `src/theme/colors.js`.

**Paleta principal:**

| Token | Valor | Uso |
|---|---|---|
| `accent` | `#4d8fe8` | Cor principal (azul AcadFlow) |
| `accentLight` | `#e8f0fe` | Fundo de elementos ativos |
| `bg` | `#1A222D` | Fundo das telas |
| `card` | `#253342` | Superfície de cards |
| `inputBg` | `#2E3E52` | Fundo de inputs |
| `textPrimary` | `#F8FAFC` | Texto principal |
| `textSecondary` | `#5a6079` | Texto secundário |
| `textMuted` | `#a8afc4` | Texto de suporte |
| `success` | `#12a150` | Aprovado |
| `warning` | `#d97706` | Pendente |
| `danger` | `#dc2626` | Rejeitado |

**Sombras disponíveis:** `shadows.sm` e `shadows.md` (compatíveis com Android via `elevation`).

---

## Integração com o backend

O app se comunica com o backend Spring Boot hospedado no Render:

```
https://back-end-projeto-integrador.onrender.com
```

Todas as rotas (exceto `/auth/login`) exigem o header:
```
Authorization: Bearer <JWT>
```

O interceptor em `api.js` injeta esse header automaticamente em toda requisição.

---

## Integração com OCR

O microserviço de OCR está hospedado separadamente:

```
https://ocr-tesseract-python.onrender.com
```

Ao selecionar ou fotografar um certificado na `NovaSubmissaoScreen`, o app envia automaticamente a imagem para `POST /ler-certificado` e preenche os campos do formulário com os dados retornados. Caso o OCR falhe, o aluno pode preencher os campos manualmente.

---

## Credenciais de demonstração

Na tela de login há um card de demonstração. Ao tocar, os campos são preenchidos automaticamente:

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `aluno@senac.com` | `123456` |

---

## Observações sobre o ambiente

- O backend e o OCR estão no **plano gratuito do Render**, que hiberna instâncias após inatividade. A **primeira requisição pode levar até 30 segundos**. Isso é informado ao usuário via banner na tela de login.
- A sessão é armazenada apenas em memória. Fechar o app força um novo login.
- A orientação do app está fixada em **portrait** (`app.json`).
- A nova arquitetura do React Native (`newArchEnabled: true`) está habilitada.

---

## Equipe

Projeto Integrador — Turma de Desenvolvimento Mobile, SENAC  
Professor: Geraldo Gomes

| Nome |
|---|
| André Costa |
| Caio Victor |
| Leticia |
| Luciana |
| Priscila |
