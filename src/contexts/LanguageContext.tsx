import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

export const translations: Translations = {
  "search_placeholder": {
    pt: "Busque por um jogo...",
    en: "Search for a game...",
    es: "Busca un juego..."
  },
  "dashboard": {
    pt: "Dashboard",
    en: "Dashboard",
    es: "Panel"
  },
  "logout": {
    pt: "Sair",
    en: "Logout",
    es: "Salir"
  },
  "login": {
    pt: "Entrar",
    en: "Login",
    es: "Entrar"
  },
  "register": {
    pt: "Criar Conta",
    en: "Create Account",
    es: "Crear Cuenta"
  },
  "hero_title_1": {
    pt: "Biblioteca De",
    en: "Steam Games",
    es: "Biblioteca De"
  },
  "hero_title_2": {
    pt: "Jogos Steam",
    en: "Library",
    es: "Juegos Steam"
  },
  "hero_desc": {
    pt: "Tenha acesso instantâneo aos melhores jogos. Entre, baixe e jogue offline com segurança e garantia.",
    en: "Get instant access to the best games. Log in, download, and play offline safely with a guarantee.",
    es: "Obtén acceso instantáneo a los mejores juegos. Inicia sesión, descarga y juega sin conexión con total seguridad y garantía."
  },
  "hero_search": {
    pt: "Encontre o seu próximo jogo favorito...",
    en: "Find your next favorite game...",
    es: "Encuentra tu próximo juego favorito..."
  },
  "highlights": {
    pt: "Lançamentos e destaques",
    en: "Releases and highlights",
    es: "Lanzamientos y destacados"
  },
  "recently_added": {
    pt: "Adicionados recentemente",
    en: "Recently added",
    es: "Agregados recientemente"
  },
  "all_games": {
    pt: "Todos os jogos",
    en: "All games",
    es: "Todos los juegos"
  },
  "no_games_search": {
    pt: "Nenhum jogo encontrado com esse termo.",
    en: "No games found with this term.",
    es: "No se encontraron juegos con este término."
  },
  "guarantee": {
    pt: "Jogue Agora",
    en: "Play Now",
    es: "Juega Ahora"
  },
  "included": {
    pt: "Incluído",
    en: "Included",
    es: "Incluido"
  },
  "active_sub": {
    pt: "Assinatura Ativa",
    en: "Active Subscription",
    es: "Suscripción Activa"
  },
  "access": {
    pt: "Acessar",
    en: "Access",
    es: "Acceder"
  },
  "release": {
    pt: "Lançamento",
    en: "Release",
    es: "Lanzamiento"
  },
  "genre": {
    pt: "Gênero",
    en: "Genre",
    es: "Género"
  },
  "game_access": {
    pt: "Acesso ao Jogo",
    en: "Game Access",
    es: "Acceso al Juego"
  },
  "steam_user": {
    pt: "Usuário Steam",
    en: "Steam Username",
    es: "Usuario Steam"
  },
  "steam_pass": {
    pt: "Senha Steam",
    en: "Steam Password",
    es: "Contraseña Steam"
  },
  "copy_user": {
    pt: "Copiar Usuário",
    en: "Copy Username",
    es: "Copiar Usuario"
  },
  "copy_pass": {
    pt: "Copiar Senha",
    en: "Copy Password",
    es: "Copiar Contraseña"
  },
  "game_not_found": {
    pt: "Jogo não encontrado",
    en: "Game not found",
    es: "Juego no encontrado"
  },
  "back_home": {
    pt: "Voltar para a página inicial",
    en: "Back to home page",
    es: "Volver a la página de inicio"
  },
  "no_desc": {
    pt: "Nenhuma descrição disponível para este jogo.",
    en: "No description available for this game.",
    es: "No hay descripción disponible para este juego."
  },
  "steps_title": {
    pt: "Siga os passos abaixo:",
    en: "Follow the steps below:",
    es: "Sigue los pasos a continuación:"
  },
  "steps_desc": {
    pt: "abra a Steam, faça o login com as credenciais, baixe o jogo, inicie uma vez e depois coloque a Steam em Modo Offline para jogar.",
    en: "open Steam, log in with credentials, download the game, launch it once and then put Steam in Offline Mode to play.",
    es: "abre Steam, inicia sesión con las credenciales, descarga el juego, inícialo una vez y luego pon Steam en Modo Desconectado para jugar."
  },
  "important_rule_title": {
    pt: "Importante: Regra de Uso",
    en: "Important: Usage Rule",
    es: "Importante: Regla de Uso"
  },
  "important_rule_desc": {
    pt: "Nunca altere os dados da conta, ative o modo Família ou Steam Guard. Jogue estritamente em modo Offline para evitar desconexões e problemas com outros usuários.",
    en: "Never change account details, activate Family view or Steam Guard. Play strictly in Offline mode to avoid disconnections and problems with other users.",
    es: "Nunca cambies los datos de la cuenta, actives el modo Familia o Steam Guard. Juega estrictamente en modo Desconectado para evitar desconexiones y problemas con otros usuarios."
  },
  "login_needed": {
    pt: "Login Necessário",
    en: "Login Required",
    es: "Inicio de Sesión Requerido"
  },
  "login_needed_desc": {
    pt: "Para visualizar as credenciais da conta Steam e baixar o jogo, você precisa estar logado na plataforma.",
    en: "To view the Steam account credentials and download the game, you need to be logged into the platform.",
    es: "Para ver las credenciales de la cuenta de Steam y descargar el juego, debes estar logueado en la plataforma."
  },
  "copied": {
    pt: "Copiado!",
    en: "Copied!",
    es: "¡Copiado!"
  },
  "admin_title": {
    pt: "Administração",
    en: "Administration",
    es: "Administración"
  },
  "admin_dashboard": {
    pt: "Dashboard",
    en: "Dashboard",
    es: "Panel"
  },
  "admin_games": {
    pt: "Jogos",
    en: "Games",
    es: "Juegos"
  },
  "admin_users": {
    pt: "Usuários",
    en: "Users",
    es: "Usuarios"
  },
  "admin_logs": {
    pt: "Logs",
    en: "Logs",
    es: "Registros"
  },
  "admin_users_soon": {
    pt: "Gerenciamento de Usuários",
    en: "User Management",
    es: "Gestión de Usuarios"
  },
  "admin_logs_soon": {
    pt: "Visualizador de Logs",
    en: "Logs Viewer",
    es: "Visor de Registros"
  },
  "admin_manage_users": {
    pt: "Gerenciar Usuários",
    en: "Manage Users",
    es: "Gestionar Usuarios"
  },
  "admin_add_user": {
    pt: "Criar Novo Usuário",
    en: "Create New User",
    es: "Crear Nuevo Usuario"
  },
  "admin_user_email": {
    pt: "E-mail do Usuário",
    en: "User Email",
    es: "Correo del Usuario"
  },
  "admin_user_role": {
    pt: "Cargo / Role",
    en: "Role",
    es: "Rol"
  },
  "admin_user_created": {
    pt: "Data de Cadastro",
    en: "Registration Date",
    es: "Fecha de Registro"
  },
  "admin_change_role": {
    pt: "Alterar Cargo",
    en: "Change Role",
    es: "Cambiar Rol"
  },
  "admin_delete_user": {
    pt: "Excluir Usuário",
    en: "Delete User",
    es: "Eliminar Usuario"
  },
  "admin_confirm_delete_user": {
    pt: "Tem certeza que deseja excluir este usuário?",
    en: "Are you sure you want to delete this user?",
    es: "¡Estás seguro de que deseas eliminar este usuario?"
  },
  "admin_logs_title": {
    pt: "Logs de Atividades do Sistema",
    en: "System Activity Logs",
    es: "Registros de Actividades del Sistema"
  },
  "admin_log_action": {
    pt: "Ação",
    en: "Action",
    es: "Acción"
  },
  "admin_log_details": {
    pt: "Detalhes",
    en: "Details",
    es: "Detalles"
  },
  "admin_log_date": {
    pt: "Data e Hora",
    en: "Date & Time",
    es: "Fecha y Hora"
  },
  "admin_clear_logs": {
    pt: "Limpar Registros",
    en: "Clear Logs",
    es: "Limpiar Registros"
  },
  "back_to_site": {
    pt: "Voltar ao Site",
    en: "Back to Site",
    es: "Volver al Sitio"
  },
  "admin_overview": {
    pt: "Visão Geral",
    en: "Overview",
    es: "Visión General"
  },
  "admin_total_games": {
    pt: "Total de Jogos",
    en: "Total Games",
    es: "Total de Juegos"
  },
  "admin_registered_users": {
    pt: "Usuários Registrados",
    en: "Registered Users",
    es: "Usuarios Registrados"
  },
  "admin_log_records": {
    pt: "Registros de Logs",
    en: "Log Records",
    es: "Registros de Logs"
  },
  "admin_welcome_dashboard": {
    pt: "Bem-vindo ao Dashboard",
    en: "Welcome to Dashboard",
    es: "Bienvenido al Panel"
  },
  "admin_dashboard_desc": {
    pt: "Utilize o menu lateral para gerenciar os jogos da biblioteca, usuários e verificar os logs de acesso.",
    en: "Use the sidebar menu to manage library games, users and check access logs.",
    es: "Utilice el menú lateral para gestionar los juegos de la biblioteca, los usuarios y verificar los registros de acceso."
  },
  "admin_send_notif": {
    pt: "Enviar Notificação",
    en: "Send Notification",
    es: "Enviar Notificación"
  },
  "admin_notif_desc": {
    pt: "Notifique todos online instantaneamente",
    en: "Notify everyone online instantly",
    es: "Notifique a todos en línea al instante"
  },
  "admin_notif_title": {
    pt: "Título da Notificação",
    en: "Notification Title",
    es: "Título de la Notificación"
  },
  "admin_notif_msg": {
    pt: "Mensagem...",
    en: "Message...",
    es: "Mensaje..."
  },
  "admin_notif_send": {
    pt: "Disparar Notificação",
    en: "Fire Notification",
    es: "Lanzar Notificación"
  },
  "admin_notif_sending": {
    pt: "Enviando...",
    en: "Sending...",
    es: "Enviando..."
  },
  "admin_notif_success": {
    pt: "Notificação enviada com sucesso para todos os usuários online!",
    en: "Notification successfully sent to all online users!",
    es: "¡Notificación enviada con éxito a todos los usuarios en línea!"
  },
  "admin_notif_err": {
    pt: "Erro ao enviar notificação: ",
    en: "Error sending notification: ",
    es: "Error al enviar notificación: "
  },
  "admin_manage_games": {
    pt: "Gerenciar Jogos",
    en: "Manage Games",
    es: "Gestionar Juegos"
  },
  "admin_add_game": {
    pt: "Adicionar Jogo",
    en: "Add Game",
    es: "Añadir Juego"
  },
  "admin_table_cover": {
    pt: "Capa & Título",
    en: "Cover & Title",
    es: "Portada y Título"
  },
  "admin_table_category": {
    pt: "Categoria",
    en: "Category",
    es: "Categoría"
  },
  "admin_table_actions": {
    pt: "Ações",
    en: "Actions",
    es: "Acciones"
  },
  "admin_no_games": {
    pt: "Nenhum jogo cadastrado.",
    en: "No games registered.",
    es: "Ningún juego registrado."
  },
  "admin_delete_confirm": {
    pt: "Tem certeza que deseja excluir?",
    en: "Are you sure you want to delete?",
    es: "¿Estás seguro de que deseas eliminar?"
  },
  "admin_err_delete": {
    pt: "Erro ao excluir: ",
    en: "Error deleting: ",
    es: "Error al eliminar: "
  },
  "admin_err_save": {
    pt: "Erro ao salvar: ",
    en: "Error saving: ",
    es: "Error al guardar: "
  },
  "admin_add_new": {
    pt: "Adicionar Novo Jogo",
    en: "Add New Game",
    es: "Añadir Nuevo Juego"
  },
  "admin_game_title": {
    pt: "Título",
    en: "Title",
    es: "Título"
  },
  "admin_cover_url": {
    pt: "URL da Capa",
    en: "Cover URL",
    es: "URL de la Portada"
  },
  "admin_desc": {
    pt: "Descrição",
    en: "Description",
    es: "Descripción"
  },
  "admin_images": {
    pt: "Imagens (uma URL por linha)",
    en: "Images (one URL per line)",
    es: "Imágenes (una URL por línea)"
  },
  "admin_reqs": {
    pt: "Requisitos do Sistema",
    en: "System Requirements",
    es: "Requisitos del Sistema"
  },
  "admin_select": {
    pt: "Selecione...",
    en: "Select...",
    es: "Seleccionar..."
  },
  "admin_cancel": {
    pt: "Cancelar",
    en: "Cancel",
    es: "Cancelar"
  },
  "admin_save_game": {
    pt: "Salvar Jogo",
    en: "Save Game",
    es: "Guardar Juego"
  },
  "copy": {
    pt: "Copiar",
    en: "Copy",
    es: "Copiar"
  },
  "download_steam": {
    pt: "Baixar Steam",
    en: "Download Steam",
    es: "Descargar Steam"
  },
  "sys_req": {
    pt: "Requisitos do Sistema",
    en: "System Requirements",
    es: "Requisitos del Sistema"
  },
  "favorites_title": {
    pt: "Meus Favoritos",
    en: "My Favorites",
    es: "Mis Favoritos"
  },
  "favorites_desc": {
    pt: "Jogos que você salvou para jogar depois.",
    en: "Games you saved to play later.",
    es: "Juegos que guardaste para jugar después."
  },
  "no_favorites": {
    pt: "Nenhum favorito ainda",
    en: "No favorites yet",
    es: "No hay favoritos aún"
  },
  "favorites_explore": {
    pt: "Explore os jogos e clique no coração para adicionar aqui.",
    en: "Explore games and click the heart to add them here.",
    es: "Explora los juegos y haz clic en el corazón para agregarlos aquí."
  },
  "login_req": {
    pt: "Faça Login",
    en: "Log In",
    es: "Iniciar Sesión"
  },
  "login_req_desc": {
    pt: "Você precisa estar logado para ver seus favoritos.",
    en: "You need to be logged in to view your favorites.",
    es: "Debes iniciar sesión para ver tus favoritos."
  },
  "email": {
    pt: "E-mail",
    en: "Email",
    es: "Correo electrónico"
  },
  "password": {
    pt: "Senha",
    en: "Password",
    es: "Contraseña"
  },
  "entering": {
    pt: "Entrando...",
    en: "Logging in...",
    es: "Entrando..."
  },
  "dont_have_account": {
    pt: "Não tem uma conta?",
    en: "Don't have an account?",
    es: "¿No tienes una cuenta?"
  },
  "register_now": {
    pt: "Cadastre-se",
    en: "Register now",
    es: "Regístrate ahora"
  },
  "creating": {
    pt: "Criando...",
    en: "Creating...",
    es: "Creando..."
  },
  "already_have_account": {
    pt: "Já tem uma conta?",
    en: "Already have an account?",
    es: "¿Ya tienes una cuenta?"
  },
  "footer_desc": {
    pt: "A melhor plataforma para jogar offline com segurança.",
    en: "The best platform to play offline securely.",
    es: "La mejor plataforma para jugar sin conexión de forma segura."
  },
  "useful_links": {
    pt: "Links Úteis",
    en: "Useful Links",
    es: "Enlaces Útiles"
  },
  "home": {
    pt: "Início",
    en: "Home",
    es: "Inicio"
  },
  "support": {
    pt: "Suporte",
    en: "Support",
    es: "Soporte"
  },
  "terms": {
    pt: "Termos de Uso",
    en: "Terms of Use",
    es: "Términos de Uso"
  },
  "security": {
    pt: "Segurança",
    en: "Security",
    es: "Seguridad"
  },
  "lifetime_warranty": {
    pt: "Garantia Vitalícia",
    en: "Lifetime Warranty",
    es: "Garantía de por Vida"
  },
  "secure_payment": {
    pt: "Pagamento Seguro",
    en: "Secure Payment",
    es: "Pago Seguro"
  },
  "rights": {
    pt: "Todos os direitos reservados.",
    en: "All rights reserved.",
    es: "Todos los derechos reservados."
  },
  "settings": {
    pt: "Configurações",
    en: "Settings",
    es: "Configuraciones"
  },
  "notifications": {
    pt: "Notificações",
    en: "Notifications",
    es: "Notificaciones"
  },
  "no_notifications": {
    pt: "Nenhuma notificação.",
    en: "No notifications.",
    es: "No hay notificaciones."
  },
  "can_i_run_it": {
    pt: "Requisitos do PC",
    en: "PC Requirements",
    es: "Requisitos del PC"
  },
  "releases_highlights": {
    pt: "Lançamentos e destaques",
    en: "Releases and highlights",
    es: "Lanzamientos y destacados"
  },
  "most_played": {
    pt: "Lançamentos e destaques",
    en: "Releases and highlights",
    es: "Lanzamientos y destacados"
  },
  "categories": {
    pt: "Categorias",
    en: "Categories",
    es: "Categorías"
  },
  "how_it_works": {
    pt: "Saiba como funciona",
    en: "How it works",
    es: "Cómo funciona"
  },
  "showing": {
    pt: "Exibindo",
    en: "Showing",
    es: "Mostrando"
  },
  "of": {
    pt: "de",
    en: "of",
    es: "de"
  },
  "categories_label": {
    pt: "categorias",
    en: "categories",
    es: "categorías"
  },
  "games_label": {
    pt: "jogos",
    en: "games",
    es: "juegos"
  },
  "see_games": {
    pt: "Ver Jogos",
    en: "View Games",
    es: "Ver Juegos"
  },
  "back_to_menu": {
    pt: "Voltar ao Menu",
    en: "Back to Menu",
    es: "Volver al Menú"
  },
  "how_it_works_hero_title_1": {
    pt: "Como funciona a nossa",
    en: "How does our",
    es: "Cómo funciona nuestra"
  },
  "how_it_works_hero_title_2": {
    pt: "plataforma",
    en: "platform work",
    es: "plataforma"
  },
  "how_it_works_hero_desc": {
    pt: "Aprenda em menos de 1 minuto como selecionar um jogo, acessar as credenciais Steam autorizadas e começar a jogar imediatamente no seu computador.",
    en: "Learn in less than 1 minute how to select a game, access authorized Steam credentials and start playing immediately on your computer.",
    es: "Aprende en menos de 1 minuto cómo seleccionar un juego, acceder a las credenciales autorizadas de Steam y comenzar a jugar de inmediato en tu computadora."
  },
  "step_by_step_guide": {
    pt: "Guia Passo a Passo",
    en: "Step by Step Guide",
    es: "Guía Paso a Paso"
  },
  "simple_step_by_step": {
    pt: "Passo a Passo Simples",
    en: "Simple Step by Step",
    es: "Paso a Paso Simple"
  },
  "step_1_title": {
    pt: "Escolha seu Jogo",
    en: "Choose your Game",
    es: "Elige tu Juego"
  },
  "step_1_desc": {
    pt: "Navegue pelo nosso catálogo com centenas de jogos Steam atualizados e escolha o seu título favorito.",
    en: "Browse our catalog with hundreds of updated Steam games and choose your favorite title.",
    es: "Navega por nuestro catálogo con cientos de juegos de Steam actualizados y elige tu título favorito."
  },
  "step_2_title": {
    pt: "Obtenha as Credenciais",
    en: "Get Credentials",
    es: "Obtén las Credenciales"
  },
  "step_2_desc": {
    pt: "Acesse a página do jogo para visualizar o nome de usuário e a senha da conta com o jogo já licenciado.",
    en: "Go to the game page to view the username and password of the account with the licensed game.",
    es: "Accede a la página del juego para ver el usuario y la contraseña de la cuenta con el juego ya licenciado."
  },
  "step_3_title": {
    pt: "Logue na Steam",
    en: "Log into Steam",
    es: "Inicia sesión en Steam"
  },
  "step_3_desc": {
    pt: "Abra seu aplicativo Steam oficial no computador, faça login com as credenciais fornecidas e baixe o jogo.",
    en: "Open your official Steam desktop app, log in with the provided credentials, and download the game.",
    es: "Abre tu aplicación oficial de Steam en la computadora, inicia sesión con las credenciales proporcionadas y descarga el juego."
  },
  "step_4_title": {
    pt: "Jogue Sem Limites",
    en: "Play Without Limits",
    es: "Juega Sin Límites"
  },
  "step_4_desc": {
    pt: "Alterne para o Modo Offline na Steam e divirta-se com a campanha completa do jogo sem interrupções!",
    en: "Switch to Offline Mode on Steam and enjoy the full game campaign without interruptions!",
    es: "¡Cambia al Modo Desconectado en Steam y disfruta de la campaña completa del juego sin interrupciones!"
  },
  "guarantee_title": {
    pt: "Garantia & Segurança Total",
    en: "Total Guarantee & Security",
    es: "Garantía & Seguridad Total"
  },
  "guarantee_desc": {
    pt: "Contas protegidas e monitoradas constantemente. Suporte rápido para eventuais dúvidas.",
    en: "Constantly protected and monitored accounts. Fast support for any questions.",
    es: "Cuentas protegidas y monitoreadas constantemente. Soporte rápido para cualquier duda."
  },
  "explore_games_now": {
    pt: "Explorar Jogos Agora",
    en: "Explore Games Now",
    es: "Explorar Juegos Ahora"
  },
  "faq_title": {
    pt: "Perguntas Frequentes (FAQ)",
    en: "Frequently Asked Questions (FAQ)",
    es: "Preguntas Frecuentes (FAQ)"
  },
  "faq_q1": {
    pt: "O que é esta plataforma?",
    en: "What is this platform?",
    es: "¿Qué es esta plataforma?"
  },
  "faq_a1": {
    pt: "Nossa plataforma oferece acesso direto a contas Steam autenticadas e verificadas para você baixar e jogar seus games favoritos com total praticidade e economia.",
    en: "Our platform offers direct access to authenticated and verified Steam accounts for you to download and play your favorite games with complete convenience and economy.",
    es: "Nuestra plataforma ofrece acceso directo a cuentas de Steam autenticadas y verificadas para que descargues y juegues a tus juegos favoritos con total comodidad y economía."
  },
  "faq_q2": {
    pt: "Como funciona o acesso às contas?",
    en: "How does account access work?",
    es: "¿Cómo funciona el acceso a las cuentas?"
  },
  "faq_a2": {
    pt: "Ao selecionar um jogo no site, você visualiza o Login e a Senha da conta contendo o jogo. Basta inserir esses dados na sua Steam oficial, realizar o download e curtir.",
    en: "When selecting a game on the site, you view the Login and Password of the account containing the game. Just enter these details into your official Steam, download and enjoy.",
    es: "Al seleccionar un juego en el sitio, ves el Usuario y la Contraseña de la cuenta que contiene el juego. Solo ingresa esos datos en tu Steam oficial, descarga y disfruta."
  },
  "faq_q3": {
    pt: "É seguro utilizar este serviço?",
    en: "Is it safe to use this service?",
    es: "¿Es seguro usar este servicio?"
  },
  "faq_a3": {
    pt: "Sim! Todas as nossas contas são verificadas pela nossa equipe e possuem garantia. O download ocorre diretamente pelos servidores oficiais da Valve / Steam.",
    en: "Yes! All our accounts are verified by our team and come with a guarantee. The download happens directly through official Valve / Steam servers.",
    es: "¡Sí! Todas nuestras cuentas son verificadas por nuestro equipo y cuentan con garantía. La descarga se realiza directamente desde los servidores oficiales de Valve / Steam."
  },
  "faq_q4": {
    pt: "Posso jogar no Modo Offline?",
    en: "Can I play in Offline Mode?",
    es: "¿Puedo jugar en Modo Desconectado?"
  },
  "faq_a4": {
    pt: "Sim! Recomendamos ativar o Modo Offline na Steam após o término do download para garantir uma experiência contínua sem filas ou quedas de conexão.",
    en: "Yes! We recommend enabling Offline Mode on Steam after download finishes to ensure a seamless experience without queues or disconnections.",
    es: "¡Sí! Recomendamos activar el Modo Desconectado en Steam después de terminar la descarga para garantizar una experiencia continua sin filas ni desconexiones."
  },
  "support_talk": {
    pt: "Falar com Suporte",
    en: "Talk to Support",
    es: "Hablar con Soporte"
  },
  "support_service": {
    pt: "Atendimento",
    en: "Customer Service",
    es: "Atención al Cliente"
  },
  "support_service_desc": {
    pt: "Estamos aqui para ajudar 24/7. Entre em contato conosco.",
    en: "We are here to help 24/7. Contact us.",
    es: "Estamos aquí para ayudar 24/7. Contáctanos."
  },
  "my_account": {
    pt: "Minha Conta",
    en: "My Account",
    es: "Mi Cuenta"
  },
  "profile_details": {
    pt: "Detalhes do Perfil",
    en: "Profile Details",
    es: "Detalles del Perfil"
  },
  "user_id": {
    pt: "ID do Usuário",
    en: "User ID",
    es: "ID de Usuario"
  },
  "member_since": {
    pt: "Membro desde",
    en: "Member since",
    es: "Miembro desde"
  },
  "security_info": {
    pt: "Para alterar sua senha ou atualizar suas credenciais de segurança, por favor entre em contato com o administrador do sistema.",
    en: "To change your password or update your security credentials, please contact the system administrator.",
    es: "Para cambiar tu contraseña o actualizar tus credenciales de seguridad, por favor ponte en contacto con el administrador del sistema."
  },
  "change_password": {
    pt: "Alterar Senha",
    en: "Change Password",
    es: "Cambiar Contraseña"
  },
  "related_games": {
    pt: "Jogos Relacionados",
    en: "Related Games",
    es: "Juegos Relacionados"
  },
  "category_not_found": {
    pt: "Categoria não encontrada",
    en: "Category not found",
    es: "Categoría no encontrada"
  },
  "back_to_start": {
    pt: "Voltar para o Início",
    en: "Back to Start",
    es: "Volver al Inicio"
  },
  "explore_category_games": {
    pt: "Explore todos os jogos desta categoria",
    en: "Explore all games in this category",
    es: "Explora todos los juegos de esta categoría"
  },
  "no_games_category": {
    pt: "Nenhum jogo encontrado nesta categoria no momento.",
    en: "No games found in this category at the moment.",
    es: "No se encontraron juegos en esta categoría por el momento."
  },
  "logged_in_as": {
    pt: "Logado como",
    en: "Logged in as",
    es: "Iniciado sesión como"
  },
  "clear": {
    pt: "Limpar",
    en: "Clear",
    es: "Limpiar"
  },
  "save_credentials_q": {
    pt: "Salvar credenciais?",
    en: "Save credentials?",
    es: "¿Guardar credenciales?"
  },
  "search_results": {
    pt: "Resultados da busca",
    en: "Search results",
    es: "Resultados de la búsqueda"
  },
  "no_results_found": {
    pt: "Nenhum resultado encontrado",
    en: "No results found",
    es: "No se encontraron resultados"
  },
  "play_now": {
    pt: "Jogar Agora",
    en: "Play Now",
    es: "Jugar Ahora"
  },
  "featured": {
    pt: "Destaque",
    en: "Featured",
    es: "Destacado"
  },
  "popular": {
    pt: "Popular",
    en: "Popular",
    es: "Popular"
  },
  "account_not_working": {
    pt: "Conta não funciona? Falar com Suporte",
    en: "Account not working? Contact Support",
    es: "¿La cuenta no funciona? Hablar con Soporte"
  },
  "favorite_game": {
    pt: "Favoritar Jogo",
    en: "Favorite Game",
    es: "Añadir a Favoritos"
  },
  "game_favorited": {
    pt: "Jogo Favoritado",
    en: "Game Favorited",
    es: "Juego Guardado"
  },
  "available_accounts": {
    pt: "Contas disponíveis:",
    en: "Available accounts:",
    es: "Cuentas disponibles:"
  },
  "username_label": {
    pt: "Nome de Usuário",
    en: "Username",
    es: "Nombre de Usuario"
  },
  "save": {
    pt: "Salvar",
    en: "Save",
    es: "Guardar"
  },
  "saved_successfully": {
    pt: "Salvo com sucesso!",
    en: "Saved successfully!",
    es: "¡Guardado con éxito!"
  },
  "detected_hardware": {
    pt: "Hardware Detectado",
    en: "Detected Hardware",
    es: "Hardware Detectado"
  },
  "adjust_specs": {
    pt: "Ajustar Especificações",
    en: "Adjust Specifications",
    es: "Ajustar Especificaciones"
  },
  "ram_label": {
    pt: "Memória RAM",
    en: "RAM Memory",
    es: "Memoria RAM"
  },
  "processor_cores": {
    pt: "Núcleos do Processador",
    en: "Processor Cores",
    es: "Núcleos del Procesador"
  },
  "gpu_label": {
    pt: "Placa de Vídeo (GPU)",
    en: "Graphics Card (GPU)",
    es: "Tarjeta de Vídeo (GPU)"
  },
  "os_label": {
    pt: "Sistema Operacional",
    en: "Operating System",
    es: "Sistema Operativo"
  },
  "can_run_game": {
    pt: "Seu PC Roda este Jogo!",
    en: "Your PC Can Run This Game!",
    es: "¡Tu PC Corre Este Juego!"
  },
  "cannot_run_game": {
    pt: "Atenção aos Requisitos",
    en: "Check Requirements",
    es: "Atención a los Requisitos"
  },
  "minimum": {
    pt: "Mínimo",
    en: "Minimum",
    es: "Mínimo"
  },
  "recommended": {
    pt: "Recomendado",
    en: "Recommended",
    es: "Recomendado"
  },
  "cat_Terror": {
    pt: "Terror",
    en: "Horror",
    es: "Terror"
  },
  "cat_Mundo Aberto": {
    pt: "Mundo Aberto",
    en: "Open World",
    es: "Mundo Abierto"
  },
  "cat_Corrida": {
    pt: "Corrida",
    en: "Racing",
    es: "Carreras"
  },
  "cat_Ação": {
    pt: "Ação",
    en: "Action",
    es: "Acción"
  },
  "cat_RPG": {
    pt: "RPG",
    en: "RPG",
    es: "RPG"
  },
  "cat_Esportes": {
    pt: "Esportes",
    en: "Sports",
    es: "Deportes"
  },
  "cat_Estratégia": {
    pt: "Estratégia",
    en: "Strategy",
    es: "Estrategia"
  },
  "cat_Aventura": {
    pt: "Aventura",
    en: "Adventure",
    es: "Aventura"
  },
  "cat_Sobrevivência": {
    pt: "Sobrevivência",
    en: "Survival",
    es: "Supervivencia"
  },
  "cat_Simulação": {
    pt: "Simulação",
    en: "Simulation",
    es: "Simulación"
  },
  "cat_Luta": {
    pt: "Luta",
    en: "Fighting",
    es: "Lucha"
  },
  "cat_Anime": {
    pt: "Anime",
    en: "Anime",
    es: "Anime"
  },
  "cat_Indie": {
    pt: "Indie",
    en: "Indie",
    es: "Indie"
  },
  "cat_Ficção Científica": {
    pt: "Ficção Científica",
    en: "Sci-Fi",
    es: "Ciencia Ficción"
  },
  "cat_Casual": {
    pt: "Casual",
    en: "Casual",
    es: "Casual"
  },
  "suggest_game": {
    pt: "Pedir Jogo",
    en: "Request Game",
    es: "Pedir Juego"
  },
  "suggest_game_title": {
    pt: "Pedir / Sugerir um Jogo",
    en: "Request / Suggest a Game",
    es: "Pedir / Sugerir un Juego"
  },
  "suggest_game_desc": {
    pt: "Não encontrou o jogo que deseja? Envie sua sugestão para nossa equipe e faremos o possível para adicioná-lo ao catálogo!",
    en: "Didn't find the game you want? Send your suggestion to our team and we'll do our best to add it!",
    es: "¡¿No encontraste el juego que deseas? Envía tu sugerencia a nuestro equipo y haremos lo posible para agregarlo!"
  },
  "game_title_label": {
    pt: "Nome do Jogo",
    en: "Game Title",
    es: "Nombre del Juego"
  },
  "category_platform_label": {
    pt: "Categoria / Plataforma (ex: Steam, Epic Games, GOG)",
    en: "Category / Platform (e.g. Steam, Epic Games, GOG)",
    es: "Categoría / Plataforma (ej: Steam, Epic Games, GOG)"
  },
  "notes_label": {
    pt: "Observações Adicionais (opcional)",
    en: "Additional Notes (optional)",
    es: "Notas Adicionales (opcional)"
  },
  "send_suggestion_btn": {
    pt: "Enviar Sugestão",
    en: "Send Suggestion",
    es: "Enviar Sugerencia"
  },
  "suggestion_success_msg": {
    pt: "Sua sugestão foi enviada com sucesso ao painel dos administradores!",
    en: "Your suggestion was sent successfully to the admin team!",
    es: "¡Tu sugerencia fue enviada con éxito al equipo de administración!"
  },
  "admin_suggestions": {
    pt: "Sugestões dos Clientes",
    en: "Client Suggestions",
    es: "Sugerencias de Clientes"
  }
};

export const getCategoryTranslation = (catName: string | undefined | null, t: (k: string) => string) => {
  if (!catName) return '';
  const key = `cat_${catName.trim()}`;
  const translated = t(key);
  return translated !== key ? translated : catName;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
