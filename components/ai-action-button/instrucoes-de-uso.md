## Componente `AIActionButton`

### Props
- `onClick?: () => void`  
  Função executada ao clicar no botão. Opcional; caso ausente, nenhum comportamento adicional é disparado.

### Descrição
Botão flutuante posicionado no canto inferior direito da tela, destinado a acionar futuras funcionalidades de assistente de IA. O botão é responsivo, acessível (`aria-label`) e mantém contraste adequado com o tema padrão do projeto.

### Exemplo de uso
```tsx
import AIActionButton from "@/components/ai-action-button/ai-action-button"

export default function Page() {
  const handleOpenAssistant = () => {
    // TODO: implementar abertura do assistente
  }

  return (
    <>
      {/* Conteúdo da página */}
      <AIActionButton onClick={handleOpenAssistant} />
    </>
  )
}
```

