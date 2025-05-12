const { io } = require("socket.io-client");

// Estabelecer conexão com o servidor Socket.IO
const socket = io("http://localhost:3001", {
  auth: {
    token: "mock-token" // Token de autenticação para desenvolvimento
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000,
  transports: ["websocket", "polling"]
});

// Evento de conexão
socket.on("connect", () => {
  console.log("Conectado ao servidor Socket.IO");
  console.log("ID do Socket:", socket.id);
  
  // Emitir evento de usuário online
  socket.emit("user:online", { userId: "test-user" });
  
  // Enviar mensagem de teste
  socket.emit("message:send", {
    roomId: "global",
    senderId: "test-user",
    receiverId: "global",
    content: "Mensagem de teste do script"
  });
});

// Evento de erro de conexão
socket.on("connect_error", (error) => {
  console.error("Erro ao conectar ao servidor:", error.message);
});

// Evento de mensagem recebida
socket.on("message:receive", (message) => {
  console.log("Mensagem recebida:", message);
});

// Evento de usuário digitando
socket.on("user:typing", ({ roomId, userId, isTyping }) => {
  console.log(`Usuário ${userId} está ${isTyping ? "digitando" : "parou de digitar"} na sala ${roomId}`);
});

// Evento de desconexão
socket.on("disconnect", (reason) => {
  console.log("Desconectado do servidor:", reason);
});

// Evento de reconexão
socket.on("reconnect", (attemptNumber) => {
  console.log(`Reconectado após ${attemptNumber} tentativas`);
});

// Evento de tentativa de reconexão
socket.on("reconnect_attempt", (attemptNumber) => {
  console.log(`Tentativa de reconexão ${attemptNumber}`);
});

// Evento de erro de reconexão
socket.on("reconnect_error", (error) => {
  console.error("Erro na tentativa de reconexão:", error);
});

// Evento de falha na reconexão
socket.on("reconnect_failed", () => {
  console.error("Falha na reconexão após todas as tentativas");
});

console.log("Iniciando teste de conexão Socket.IO...");
console.log("Pressione Ctrl+C para encerrar o teste.");

// Manter o processo em execução
process.stdin.resume(); 