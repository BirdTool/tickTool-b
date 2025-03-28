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
        
        .background {
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            opacity: 0.3; 
            z-index: -1; 
            max-width: 300px;
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
    <img src="data:image/png;base64,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" class="background">

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