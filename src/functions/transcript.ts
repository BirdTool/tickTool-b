interface Message {
    id: string;
    author: {
        id: string;
        username: string;
        avatar: string | null;
        isSupporter?: boolean;
        role?: string;
    };
    content: string;
    timestamp: Date;
    isReply?: boolean;
    attachments?: Array<{
        url: string;
        contentType?: string;
        name?: string;
    }>;
}

interface TranscriptOptions {
    title: string;
    subtitle: string;
    watermarks?: {
        topRight?: string;
        bottomRight?: string;
        topLeft?: string;
        bottomLeft?: string;
    };
}

export function generateMessagesHTML(messages: Message[], options: TranscriptOptions): string {
    // Função para escapar HTML
    const escapeHtml = (unsafe: string): string => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Formata o conteúdo da mensagem
    const formatContent = (content: string): string => {
        let formatted = escapeHtml(content)
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/__([^_]+)__/g, '<u>$1</u>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>');
        
        // Formata links
        formatted = formatted.replace(/https?:\/\/[^\s]+/g, url => {
            return `<a href="${url}" style="color: var(--brand); text-decoration: none;">${url}</a>`;
        });
        
        return formatted;
    };

    // Formata a data para exibição
    const formatDate = (date: Date): { display: string, tooltip: string } => {
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        let displayDate;
        if (diffInHours < 24) {
            displayDate = `Hoje às ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffInHours < 48) {
            displayDate = `Ontem às ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            displayDate = date.toLocaleDateString([], { day: 'numeric', month: 'numeric' }) + 
                         ' às ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        const tooltipDate = date.toLocaleDateString([], { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return { display: displayDate, tooltip: tooltipDate };
    };

    // Gera o HTML para cada mensagem
    const messagesHTML = messages.map((message, index) => {
        const { display: displayDate, tooltip: tooltipDate } = formatDate(message.timestamp);
        const initials = message.author.username.split(' ').map(n => n[0]).join('').toUpperCase();
        const avatarStyle = message.author.avatar 
            ? `background-image: url('${message.author.avatar}'); background-size: cover;` 
            : `background-color: ${stringToColor(message.author.username)};`;
        
        const messageClass = message.isReply ? 'reply' : '';
        const supporterClass = message.author.isSupporter ? 'supporter' : '';
        
        // Processa anexos
        const attachmentsHTML = message.attachments?.map(att => {
            if (att.contentType?.startsWith('image/')) {
                return `<img src="${att.url}" alt="Anexo" style="max-width: 100%; border-radius: 4px; margin-top: 8px;">`;
            } else {
                return `<div style="margin-top: 8px;">
                    <a href="${att.url}" style="color: var(--brand); text-decoration: none;">
                        📎 ${att.name || 'Anexo'}
                    </a>
                </div>`;
            }
        }).join('') || '';

        return `
            <div class="${messageClass}" style="animation-delay: ${index * 0.1}s">
                <div class="message">
                    <div class="avatar ${supporterClass}" style="${avatarStyle}">${!message.author.avatar ? initials : ''}</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="username">${escapeHtml(message.author.username)}</span>
                            ${message.author.role ? `<span class="badge">${escapeHtml(message.author.role)}</span>` : ''}
                            <div class="date-container">
                                <span class="date">${displayDate}</span>
                                <div class="date-tooltip">${tooltipDate}</div>
                            </div>
                        </div>
                        <div class="message-body">
                            ${formatContent(message.content)}
                            ${attachmentsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Gera o HTML completo
    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)} | BirdTool</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Whitney:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap');
        
        :root {
            --background-primary: #36393f;
            --background-secondary: #2f3136;
            --background-tertiary: #202225;
            --text-normal: #dcddde;
            --text-muted: #72767d;
            --brand: #5865f2;
            --brand-hover: #4752c4;
            --status-online: #3ba55c;
            --status-idle: #faa61a;
            --status-dnd: #ed4245;
            --status-offline: #747f8d;
        }
        
        body {
            background-color: var(--background-primary);
            color: var(--text-normal);
            font-family: 'Whitney', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            background-image: radial-gradient(circle at 20% 30%, rgba(88, 101, 242, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(88, 101, 242, 0.1) 0%, transparent 50%);
        }
        
        .top {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 8px;
            justify-content: center;
            align-items: center;
            background-color: var(--background-tertiary);
            width: 90%;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border-left: 4px solid var(--brand);
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }
        
        .top:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }
        
        .top::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--brand), transparent);
            opacity: 0.5;
        }
        
        .top h1 {
            color: white;
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        
        .top h2 {
            color: var(--text-muted);
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
        
        .messages {
            width: 90%;
            max-width: 800px;
            margin: 20px auto;
        }
        
        .message {
            background-color: var(--background-secondary);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            display: flex;
            gap: 16px;
            position: relative;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            opacity: 0;
            animation: messageIn 0.3s ease forwards;
        }
        
        .message:hover {
            background-color: #34373c;
            border-color: rgba(114, 118, 125, 0.3);
        }
        
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--brand);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            font-family: 'Roboto', sans-serif;
        }
        
        .avatar::after {
            content: "";
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 3px solid var(--background-secondary);
            background-color: var(--status-online);
        }
        
        .avatar.supporter::after {
            background-color: var(--status-idle);
        }
        
        .message-content {
            flex-grow: 1;
        }
        
        .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            flex-wrap: wrap;
        }
        
        .username {
            font-weight: 600;
            color: white;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .username::after {
            content: "✔";
            color: var(--brand);
            font-size: 12px;
            margin-left: 2px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .message:hover .username::after {
            opacity: 1;
        }
        
        .badge {
            background-color: var(--brand);
            color: white;
            font-size: 10px;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 700;
            text-transform: uppercase;
        }
        
        .date {
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 400;
        }
        
        .message-body {
            font-size: 16px;
            line-height: 1.5;
            word-wrap: break-word;
        }
        
        .message-body p {
            margin: 6px 0;
        }
        
        .message-body p:first-child {
            margin-top: 0;
        }
        
        .message-body p:last-child {
            margin-bottom: 0;
        }
        
        .divider {
            height: 1px;
            background-color: rgba(79, 84, 92, 0.48);
            margin: 16px 0;
        }
        
        .reply {
            margin-left: 56px;
            position: relative;
        }
        
        .reply::before {
            content: "";
            position: absolute;
            left: -28px;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: #4f545c;
            transition: background-color 0.2s ease;
        }
        
        .reply:hover::before {
            background-color: var(--brand);
        }

        .watermark {
            position: fixed;
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 500;
            opacity: 0.7;
            transition: all 0.3s ease;
            z-index: 100;
        }
        
        .watermark:hover {
            opacity: 1;
            color: var(--brand);
        }
        
        .watermark1 {
            top: 16px;
            right: 16px;
        }
        
        .watermark2 {
            bottom: 16px;
            right: 16px;
        }
        
        .watermark3 {
            top: 16px;
            left: 16px;
        }
        
        .watermark4 {
            bottom: 16px;
            left: 16px;
        }

        @media (max-width: 660px) {
            .watermark1 {
                left: 50%;
                right: auto;
                transform: translateX(-50%);
                top: 12px;
            }
            
            .watermark2, .watermark3, .watermark4 {
                display: none;
            }
            
            .message {
                padding: 12px;
                gap: 12px;
            }
            
            .avatar {
                width: 36px;
                height: 36px;
                font-size: 14px;
            }
            
            .reply {
                margin-left: 48px;
            }
            
            .reply::before {
                left: -24px;
            }
        }

        /* Animação de entrada para mensagens */
        @keyframes messageIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Tooltip para data */
        .date-container {
            position: relative;
            display: inline-block;
        }
        
        .date-container:hover .date-tooltip {
            visibility: visible;
            opacity: 1;
        }
        
        .date-tooltip {
            visibility: hidden;
            width: 120px;
            background-color: #111;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 12px;
        }
        
        .date-tooltip::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #111 transparent transparent transparent;
        }
    </style>
</head>
<body>
    <div class="top">
        <h1>${escapeHtml(options.title)}</h1>
        <h2>${escapeHtml(options.subtitle)}</h2>
    </div>
    
    ${options.watermarks?.topRight ? `<div class="watermark watermark1"><p>${escapeHtml(options.watermarks.topRight)}</p></div>` : ''}
    ${options.watermarks?.bottomRight ? `<div class="watermark watermark2"><p>${escapeHtml(options.watermarks.bottomRight)}</p></div>` : ''}
    ${options.watermarks?.topLeft ? `<div class="watermark watermark3"><p>${escapeHtml(options.watermarks.topLeft)}</p></div>` : ''}
    ${options.watermarks?.bottomLeft ? `<div class="watermark watermark4"><p>${escapeHtml(options.watermarks.bottomLeft)}</p></div>` : ''}
    
    <div class="messages">
        ${messagesHTML}
    </div>
</body>
</html>`;
}

// Função auxiliar para gerar cor a partir de uma string (para avatares)
function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
}

// Exemplo de uso:
/*
const messages: Message[] = [
    {
        id: "1",
        author: {
            id: "123",
            username: "Jhon Doe",
            avatar: null,
            role: "Cliente"
        },
        content: "Olá, estou tendo um problema com meu aplicativo. Quando tento fazer login, recebo um erro 404.",
        timestamp: new Date(),
        isReply: false
    },
    {
        id: "2",
        author: {
            id: "456",
            username: "Suporte Mod",
            avatar: null,
            isSupporter: true,
            role: "Suporte"
        },
        content: "Olá Jhon! Vamos resolver isso juntos. Você poderia me informar:\n1. Qual versão do aplicativo você está usando?\n2. Que tipo de dispositivo e sistema operacional?\n3. O erro acontece sempre ou apenas em situações específicas?",
        timestamp: new Date(Date.now() + 15 * 60 * 1000),
        isReply: false
    }
];

const html = generateMessagesHTML(messages, {
    title: "Ticket #01",
    subtitle: "Criado por: Jhon Doe",
    watermarks: {
        topRight: "Feito por BirdTool",
        bottomRight: "Ticket #01",
        topLeft: "Suporte Técnico",
        bottomLeft: "Status: Aberto"
    }
});

console.log(html);
*/